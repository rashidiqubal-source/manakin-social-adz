from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import User, Business
from app.schemas.schemas import ProfileStep1, ProfileStep2, ProfileStep3, BusinessResponse

router = APIRouter()

@router.post("/step1")
async def save_step1(payload: ProfileStep1, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).limit(1))
    user = result.scalars().first()
    if user:
        user.first_name = payload.first_name
        user.last_name = payload.last_name
        user.email = payload.email
        await db.commit()
    return {"message": "Personal profile saved successfully", "step": 1}

@router.post("/step2", response_model=BusinessResponse)
async def save_step2(payload: ProfileStep2, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Business).limit(1))
    biz = result.scalars().first()
    if not biz:
        u_res = await db.execute(select(User).limit(1))
        user = u_res.scalars().first()
        user_id = user.id if user else "demo-user-id"
        biz = Business(user_id=user_id, name=payload.name, category=payload.category, monthly_budget=payload.monthly_budget)
        db.add(biz)
    
    biz.name = payload.name
    biz.category = payload.category
    biz.monthly_budget = payload.monthly_budget
    biz.description = payload.description
    biz.gst_number = payload.gst_number
    biz.website = payload.website
    biz.city = payload.city
    await db.commit()
    await db.refresh(biz)
    return biz

@router.post("/step3")
async def save_step3(payload: ProfileStep3, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Business).limit(1))
    biz = result.scalars().first()
    if biz:
        biz.preferred_platform = payload.preferred_platform
        biz.onboarding_completed = True
        await db.commit()
    return {"message": "Onboarding complete! Dashboard initialized.", "status": "active"}

@router.get("/business", response_model=BusinessResponse)
async def get_business_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Business).limit(1))
    biz = result.scalars().first()
    if not biz:
        biz = Business(
            name="Manakin Digital Store",
            category="E-Commerce & Retail",
            monthly_budget="₹25,000 - ₹50,000",
            description="Premium Online Apparel & Lifestyle Store",
            city="Mumbai",
            preferred_platform="both",
            onboarding_completed=True
        )
        db.add(biz)
        await db.commit()
        await db.refresh(biz)
    return biz
