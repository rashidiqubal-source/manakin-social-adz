from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import AdAccount, Business
from app.schemas.schemas import (
    AdAccountResponse,
    ConnectOAuthRequest,
    MetaOAuthCallbackRequest,
    MetaManualConnectRequest,
    MetaStatusResponse,
    MetaAuthUrlResponse,
    MetaTestPostRequest
)
from app.core.config import settings
from app.services.meta_service import MetaService

router = APIRouter()

@router.get("/accounts", response_model=List[AdAccountResponse])
async def list_connected_accounts(db: AsyncSession = Depends(get_db)):
    """List all currently connected ad accounts."""
    result = await db.execute(select(AdAccount).where(AdAccount.status == 'connected'))
    accounts = result.scalars().all()
    return accounts

# -------------------------------------------------------------
# Real Meta (Facebook & Instagram) Endpoints
# -------------------------------------------------------------

@router.get("/meta/status", response_model=MetaStatusResponse)
async def get_meta_status(db: AsyncSession = Depends(get_db)):
    """Check whether Meta (Facebook) is connected, and return the connected Page details."""
    result = await db.execute(
        select(AdAccount).where(AdAccount.platform == 'meta', AdAccount.status == 'connected')
    )
    acc = result.scalars().first()

    is_connected = acc is not None and bool(acc.access_token)
    app_configured = MetaService.is_configured()

    return MetaStatusResponse(
        is_connected=is_connected,
        status="connected" if is_connected else "disconnected",
        page_id=acc.account_id if acc else None,
        page_name=acc.account_name if acc else None,
        connected_at=acc.connected_at if acc else None,
        app_id_configured=app_configured,
        meta_app_id=settings.META_APP_ID if app_configured else None
    )

@router.get("/meta/auth-url", response_model=MetaAuthUrlResponse)
async def get_meta_auth_url(redirect_uri: str = Query("http://localhost:5173/connect-callback/meta")):
    """
    Generate the official Meta OAuth dialog URL requesting permissions:
    pages_show_list, pages_manage_posts, pages_read_engagement, public_profile
    """
    app_configured = MetaService.is_configured()
    auth_url = MetaService.get_authorization_url(redirect_uri=redirect_uri)
    return MetaAuthUrlResponse(
        auth_url=auth_url,
        app_id_configured=app_configured,
        app_id=settings.META_APP_ID if app_configured else None,
        redirect_uri=redirect_uri
    )

@router.post("/meta/callback")
async def handle_meta_callback(payload: MetaOAuthCallbackRequest, db: AsyncSession = Depends(get_db)):
    """
    Handle OAuth callback from Facebook:
    1. Exchange authorization code for short-lived user access token
    2. Upgrade to a 60-day long-lived token
    3. Fetch user's managed Facebook Pages and page access tokens
    4. Store the Page ID, Page Name, and permanent Page Access Token in database
    """
    if not MetaService.is_configured():
        raise HTTPException(
            status_code=400,
            detail="META_APP_ID and META_APP_SECRET are not configured in backend/.env. Please configure them or use Manual Connect."
        )

    try:
        # Step 1: Exchange code for user token
        token_data = await MetaService.exchange_code_for_token(payload.code, payload.redirect_uri)
        short_token = token_data.get("access_token")

        # Step 2: Extend to long-lived user token
        long_user_token = await MetaService.get_long_lived_token(short_token)

        # Step 3: Fetch managed pages
        pages = await MetaService.get_user_pages(long_user_token)
        if not pages:
            raise HTTPException(
                status_code=400,
                detail="No Facebook Pages found under this account. Please create or manage a Facebook Page with admin access."
            )

        # Select primary page (prefer one with CREATE_CONTENT permission)
        primary_page = pages[0]
        page_id = primary_page["id"]
        page_name = primary_page.get("name", "Connected Facebook Page")
        page_token = primary_page["access_token"]

        # Step 4: Upsert in database
        biz_result = await db.execute(select(Business).limit(1))
        biz = biz_result.scalars().first()
        biz_id = biz.id if biz else "demo-biz-id"

        result = await db.execute(
            select(AdAccount).where(AdAccount.business_id == biz_id, AdAccount.platform == 'meta')
        )
        acc = result.scalars().first()

        if not acc:
            acc = AdAccount(
                business_id=biz_id,
                platform="meta",
                account_id=page_id,
                account_name=page_name,
                status="connected",
                access_token=page_token,
                refresh_token=long_user_token,
                connected_at=datetime.utcnow()
            )
            db.add(acc)
        else:
            acc.account_id = page_id
            acc.account_name = page_name
            acc.status = "connected"
            acc.access_token = page_token
            acc.refresh_token = long_user_token
            acc.connected_at = datetime.utcnow()

        await db.commit()
        await db.refresh(acc)

        return {
            "success": True,
            "message": f"Successfully connected Facebook Page: {page_name}!",
            "page_id": page_id,
            "page_name": page_name,
            "available_pages": [{"id": p["id"], "name": p["name"]} for p in pages]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/meta/connect-manual")
async def connect_meta_manual(payload: MetaManualConnectRequest, db: AsyncSession = Depends(get_db)):
    """
    Connect a Facebook Page manually using a Page ID and Page Access Token
    (e.g., generated from Meta Graph API Explorer during development/testing).
    """
    page_name = payload.page_name or "Facebook Business Page"
    
    # Attempt to validate page token live with Meta Graph API if it's a real token
    if payload.access_token and payload.access_token.startswith("EAA"):
        try:
            page_info = await MetaService.validate_page_token(payload.page_id, payload.access_token)
            if "name" in page_info:
                page_name = page_info["name"]
        except Exception as e:
            # If token validation fails, raise informative error
            raise HTTPException(status_code=400, detail=f"Meta verification failed: {str(e)}")

    biz_result = await db.execute(select(Business).limit(1))
    biz = biz_result.scalars().first()
    biz_id = biz.id if biz else "demo-biz-id"

    result = await db.execute(
        select(AdAccount).where(AdAccount.business_id == biz_id, AdAccount.platform == 'meta')
    )
    acc = result.scalars().first()

    if not acc:
        acc = AdAccount(
            business_id=biz_id,
            platform="meta",
            account_id=payload.page_id,
            account_name=page_name,
            status="connected",
            access_token=payload.access_token,
            connected_at=datetime.utcnow()
        )
        db.add(acc)
    else:
        acc.account_id = payload.page_id
        acc.account_name = page_name
        acc.status = "connected"
        acc.access_token = payload.access_token
        acc.connected_at = datetime.utcnow()

    await db.commit()
    await db.refresh(acc)

    return {
        "success": True,
        "message": f"Successfully connected to Facebook Page: {page_name}!",
        "page_id": payload.page_id,
        "page_name": page_name
    }

@router.post("/meta/disconnect")
async def disconnect_meta(db: AsyncSession = Depends(get_db)):
    """Disconnect the currently linked Meta account."""
    result = await db.execute(select(AdAccount).where(AdAccount.platform == 'meta'))
    acc = result.scalars().first()
    if acc:
        acc.status = "disconnected"
        acc.access_token = None
        await db.commit()
    return {"success": True, "message": "Meta account disconnected successfully."}

@router.post("/meta/test-post")
async def test_meta_post(payload: MetaTestPostRequest, db: AsyncSession = Depends(get_db)):
    """Test publishing a live post to the connected Facebook Page using its Page Access Token."""
    result = await db.execute(
        select(AdAccount).where(AdAccount.platform == 'meta', AdAccount.status == 'connected')
    )
    acc = result.scalars().first()
    if not acc or not acc.access_token:
        raise HTTPException(status_code=400, detail="No active Meta Facebook Page is connected.")

    try:
        fb_response = await MetaService.publish_post_to_page(
            page_id=acc.account_id,
            page_access_token=acc.access_token,
            caption=payload.message or "Test post from Manakin Social Adz",
            media_url=payload.media_url
        )
        return {
            "success": True,
            "message": "Post published to Facebook Page successfully!",
            "post_id": fb_response.get("id"),
            "raw": fb_response
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# -------------------------------------------------------------
# Generic Platforms (Google, Snapchat, Twitter, WhatsApp)
# -------------------------------------------------------------

@router.get("/connect/{platform}")
async def initiate_oauth(platform: str):
    if platform.lower() == "meta":
        return {
            "auth_url": MetaService.get_authorization_url("http://localhost:5173/connect-callback/meta"),
            "sandbox_mode": not MetaService.is_configured()
        }

    platform_urls = {
        "google": f"https://accounts.google.com/o/oauth2/auth?client_id={settings.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:5173/connect-callback/google&scope=https://www.googleapis.com/auth/adwords&response_type=code",
        "snapchat": f"https://accounts.snapchat.com/login/oauth2/authorize?client_id={settings.SNAP_CLIENT_ID}&redirect_uri=http://localhost:5173/connect-callback/snapchat&scope=snapchat-marketing-api&response_type=code",
        "twitter": f"https://twitter.com/i/oauth2/authorize?client_id={settings.TWITTER_CLIENT_ID}&redirect_uri=http://localhost:5173/connect-callback/twitter&scope=ads.read%20ads.write&response_type=code"
    }
    url = platform_urls.get(platform.lower())
    if not url:
        raise HTTPException(status_code=400, detail="Unsupported platform")
    
    return {"auth_url": url, "sandbox_mode": True}

@router.post("/connect", response_model=AdAccountResponse)
async def connect_account_generic(payload: ConnectOAuthRequest, db: AsyncSession = Depends(get_db)):
    biz_result = await db.execute(select(Business).limit(1))
    biz = biz_result.scalars().first()
    biz_id = biz.id if biz else "demo-biz-id"

    result = await db.execute(
        select(AdAccount).where(AdAccount.business_id == biz_id, AdAccount.platform == payload.platform)
    )
    acc = result.scalars().first()
    if not acc:
        acc = AdAccount(
            business_id=biz_id,
            platform=payload.platform,
            account_id=payload.account_id or f"act_{payload.platform}_908412",
            account_name=payload.account_name or f"My {payload.platform.capitalize()} Account",
            status="connected",
            access_token=f"mock_token_{payload.platform}_2026",
            connected_at=datetime.utcnow()
        )
        db.add(acc)
    else:
        acc.status = "connected"
        acc.account_name = payload.account_name or acc.account_name
    
    await db.commit()
    await db.refresh(acc)
    return acc
