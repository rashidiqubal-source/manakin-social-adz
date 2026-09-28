import json
import logging
from typing import Optional, Dict, Any, List
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

GRAPH_API_VERSION = "v20.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

class MetaService:
    @staticmethod
    def is_configured() -> bool:
        """Check if real Meta Developer App credentials are provided in settings/env."""
        app_id = (settings.META_APP_ID or "").strip()
        app_secret = (settings.META_APP_SECRET or "").strip()
        
        is_placeholder = (
            app_id in ("your_meta_app_id", "mock_meta_app_id", "") or
            app_secret in ("your_meta_app_secret", "mock_meta_app_secret", "")
        )
        return not is_placeholder

    @staticmethod
    def get_authorization_url(redirect_uri: str, state: str = "meta_oauth") -> str:
        """
        Generate Facebook OAuth dialog URL with the exact permissions required to post on a Facebook Page:
        - pages_show_list: Retrieve user's managed Facebook Pages
        - pages_read_engagement: Read page data and engagement metrics
        - pages_manage_posts: Publish, edit, and manage posts on behalf of the connected Page
        - public_profile: Basic profile verification
        """
        client_id = settings.META_APP_ID
        scope = "pages_show_list,pages_manage_posts,pages_read_engagement,public_profile"
        return (
            f"https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth"
            f"?client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={scope}"
            f"&response_type=code"
            f"&state={state}"
        )

    @staticmethod
    async def exchange_code_for_token(code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange the authorization code for a user access token."""
        url = f"{GRAPH_API_BASE}/oauth/access_token"
        params = {
            "client_id": settings.META_APP_ID,
            "client_secret": settings.META_APP_SECRET,
            "redirect_uri": redirect_uri,
            "code": code
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            data = resp.json()
            if resp.status_code != 200 or "access_token" not in data:
                err_msg = data.get("error", {}).get("message", f"Facebook OAuth token exchange failed (HTTP {resp.status_code})")
                raise ValueError(err_msg)
            return data

    @staticmethod
    async def get_long_lived_token(short_lived_token: str) -> str:
        """
        Exchange a short-lived user token for a long-lived user token (valid for ~60 days).
        Page tokens obtained using a long-lived user token have NO expiration date.
        """
        url = f"{GRAPH_API_BASE}/oauth/access_token"
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": settings.META_APP_ID,
            "client_secret": settings.META_APP_SECRET,
            "fb_exchange_token": short_lived_token
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url, params=params)
                data = resp.json()
                if resp.status_code == 200 and "access_token" in data:
                    return data["access_token"]
        except Exception as e:
            logger.warning(f"Could not extend token to long-lived: {e}")
        return short_lived_token

    @staticmethod
    async def get_user_pages(user_access_token: str) -> List[Dict[str, Any]]:
        """
        Retrieve all Facebook Pages managed by the user with their Page Access Tokens.
        Each page in response includes: id, name, access_token, tasks, category.
        """
        url = f"{GRAPH_API_BASE}/me/accounts"
        params = {
            "access_token": user_access_token,
            "fields": "id,name,category,access_token,tasks,picture"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            data = resp.json()
            if resp.status_code != 200 or "data" not in data:
                err_msg = data.get("error", {}).get("message", "Could not fetch user's Facebook Pages")
                raise ValueError(err_msg)
            return data.get("data", [])

    @staticmethod
    async def validate_page_token(page_id: str, page_access_token: str) -> Dict[str, Any]:
        """
        Validate a Page Access Token and retrieve page details.
        Used for manual connection mode (e.g. tokens from Meta Graph API Explorer).
        """
        url = f"{GRAPH_API_BASE}/{page_id}"
        params = {
            "access_token": page_access_token,
            "fields": "id,name,category,link"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            data = resp.json()
            if resp.status_code != 200 or "id" not in data:
                err_msg = data.get("error", {}).get("message", "Invalid Page ID or Page Access Token")
                raise ValueError(err_msg)
            return data

    @staticmethod
    async def publish_post_to_page(
        page_id: str,
        page_access_token: str,
        caption: str,
        media_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Publish a post to the connected Facebook Page on behalf of the user.
        - If media_url is provided: calls POST /{page_id}/photos with url and caption
        - If text only: calls POST /{page_id}/feed with message
        Returns Facebook response containing {"id": "{page_id}_{post_id}"}
        """
        async with httpx.AsyncClient(timeout=25.0) as client:
            if media_url and (media_url.startswith("http://") or media_url.startswith("https://")):
                url = f"{GRAPH_API_BASE}/{page_id}/photos"
                payload = {
                    "url": media_url,
                    "caption": caption,
                    "access_token": page_access_token
                }
            else:
                url = f"{GRAPH_API_BASE}/{page_id}/feed"
                payload = {
                    "message": caption,
                    "access_token": page_access_token
                }

            resp = await client.post(url, data=payload)
            data = resp.json()
            if resp.status_code not in (200, 201) or "id" not in data:
                err_data = data.get("error", {})
                err_msg = err_data.get("message", f"Facebook Graph API publish error (HTTP {resp.status_code})")
                err_type = err_data.get("type", "")
                err_code = err_data.get("code", "")
                raise ValueError(f"Meta Graph API error [{err_type} {err_code}]: {err_msg}")
            
            return data
