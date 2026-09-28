import logging
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import Post, Business, AdAccount
from app.schemas.schemas import PostCreate, PostResponse
from app.services.meta_service import MetaService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("", response_model=List[PostResponse])
async def list_posts(status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Post)
    if status and status != 'all':
        query = query.where(Post.status == status)
    result = await db.execute(query.order_by(Post.created_at.desc()))
    posts = result.scalars().all()
    return posts

@router.post("", response_model=PostResponse)
async def create_post(payload: PostCreate, db: AsyncSession = Depends(get_db)):
    biz_result = await db.execute(select(Business).limit(1))
    biz = biz_result.scalars().first()
    biz_id = biz.id if biz else "demo-biz-id"

    meta_post_id = None
    error_message = None
    post_status = payload.status

    # If publishing directly to Facebook
    if payload.platform.lower() in ("facebook", "meta") and payload.publish_to_meta:
        # Check for active connected Meta account
        acc_result = await db.execute(
            select(AdAccount).where(AdAccount.platform == "meta", AdAccount.status == "connected")
        )
        meta_acc = acc_result.scalars().first()

        if meta_acc and meta_acc.access_token:
            try:
                fb_res = await MetaService.publish_post_to_page(
                    page_id=meta_acc.account_id,
                    page_access_token=meta_acc.access_token,
                    caption=payload.caption,
                    media_url=payload.media_url
                )
                meta_post_id = fb_res.get("id")
                post_status = "published"
                logger.info(f"Published to Meta Page {meta_acc.account_id}: Post ID {meta_post_id}")
            except Exception as e:
                error_message = str(e)
                post_status = "failed"
                logger.error(f"Failed to publish to Meta: {e}")
        else:
            error_message = "Meta account is not connected. Connect your Facebook Page in the Dashboard to publish on Facebook."
            post_status = "failed"

    new_post = Post(
        business_id=biz_id,
        platform=payload.platform,
        caption=payload.caption,
        media_url=payload.media_url or "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=60",
        status=post_status,
        meta_post_id=meta_post_id,
        error_message=error_message
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    return new_post
