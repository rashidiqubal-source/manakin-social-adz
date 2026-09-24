from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import AdAccount, Business
from app.schemas.schemas import AdAccountResponse, ConnectOAuthRequest
from app.core.config import settings

router = APIRouter()

@router.get("/accounts", response_model=List[AdAccountResponse])
async def list_connected_accounts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdAccount).where(AdAccount.status == 'connected'))
    accounts = result.scalars().all()
    return accounts

@router.get("/connect/{platform}")
async def initiate_oauth(platform: str):
    platform_urls = {
        "meta": f"https://www.facebook.com/v19.0/dialog/oauth?client_id={settings.META_APP_ID}&redirect_uri=http://localhost:5173/connect-callback/meta&scope=ads_management,leads_retrieval,pages_read_engagement",
        "google": f"https://accounts.google.com/o/oauth2/auth?client_id={settings.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:5173/connect-callback/google&scope=https://www.googleapis.com/auth/adwords&response_type=code",
        "snapchat": f"https://accounts.snapchat.com/login/oauth2/authorize?client_id={settings.SNAP_CLIENT_ID}&redirect_uri=http://localhost:5173/connect-callback/snapchat&scope=snapchat-marketing-api&response_type=code",
        "twitter": f"https://twitter.com/i/oauth2/authorize?client_id={settings.TWITTER_CLIENT_ID}&redirect_uri=http://localhost:5173/connect-callback/twitter&scope=ads.read%20ads.write&response_type=code"
    }
    url = platform_urls.get(platform.lower())
    if not url:
        raise HTTPException(status_code=400, detail="Unsupported platform")
    
    # In local development sandbox mode, redirect back to frontend callback directly
    return {"auth_url": url, "sandbox_mode": True}

@router.post("/connect", response_model=AdAccountResponse)
async def connect_account_sandbox(payload: ConnectOAuthRequest, db: AsyncSession = Depends(get_db)):
    biz_result = await db.execute(select(Business).limit(1))
    biz = biz_result.scalars().first()
    biz_id = biz.id if biz else "demo-biz-id"

    # Check if existing
    result = await db.execute(
        select(AdAccount).where(AdAccount.business_id == biz_id).where(AdAccount.platform == payload.platform)
    )
    acc = result.scalars().first()
    if not acc:
        acc = AdAccount(
            business_id=biz_id,
            platform=payload.platform,
            account_id=payload.account_id or f"act_{payload.platform}_908412",
            account_name=payload.account_name or f"My {payload.platform.capitalize()} Ad Account",
            status="connected",
            access_token=f"mock_token_{payload.platform}_2026"
        )
        db.add(acc)
    else:
        acc.status = "connected"
        acc.account_name = payload.account_name or acc.account_name
    
    await db.commit()
    await db.refresh(acc)
    return acc
