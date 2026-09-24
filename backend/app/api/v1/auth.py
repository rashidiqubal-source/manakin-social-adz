from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from jose import jwt

from app.db.session import get_db
from app.core.config import settings
from app.models.models import User, Business
from app.schemas.schemas import SendOTPRequest, VerifyOTPRequest, TokenResponse, UserResponse

router = APIRouter()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

@router.post("/send-otp")
async def send_otp(payload: SendOTPRequest):
    # In production, triggers SMS via AWS SNS / Twilio / MSG91.
    # For dev & demo, any 10 digit number accepts OTP '123456'
    return {
        "message": f"OTP successfully sent to +91 {payload.phone}",
        "demo_otp": "123456"
    }

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(payload: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    if payload.otp != "123456" and len(payload.otp) != 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. Use 123456 for demo verification."
        )

    # Check if user exists or create new
    result = await db.execute(select(User).where(User.phone == payload.phone))
    user = result.scalars().first()

    if not user:
        user = User(
            phone=payload.phone,
            email=f"user_{payload.phone[-4:]}@socialadz.co",
            first_name="Ad",
            last_name="Marketer"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Create initial business
        business = Business(
            user_id=user.id,
            name="My Social Brand",
            category="E-Commerce & Retail",
            monthly_budget="₹10,000 - ₹50,000",
            onboarding_completed=True
        )
        db.add(business)
        await db.commit()

    token = create_access_token({"sub": user.id, "phone": user.phone})
    
    # Check onboarding status
    biz_result = await db.execute(select(Business).where(Business.user_id == user.id))
    biz = biz_result.scalars().first()
    onboarding_completed = biz.onboarding_completed if biz else False

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        onboarding_completed=onboarding_completed
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(user_id: str = "demo-user-id", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).limit(1))
    user = result.scalars().first()
    if not user:
        user = User(
            id="demo-user-id",
            first_name="Demo",
            last_name="Manager",
            email="demo@socialadz.co",
            phone="9876543210"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
