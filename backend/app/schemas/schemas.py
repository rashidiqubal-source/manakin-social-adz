from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Auth & User
class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    onboarding_completed: bool

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Business & Profile Setup
class ProfileStep1(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class ProfileStep2(BaseModel):
    name: str
    category: str
    monthly_budget: str
    description: Optional[str] = None
    gst_number: Optional[str] = None
    website: Optional[str] = None
    city: Optional[str] = "Mumbai"

class ProfileStep3(BaseModel):
    preferred_platform: str = "both"

class BusinessResponse(BaseModel):
    id: str
    name: str
    category: str
    monthly_budget: str
    description: Optional[str] = None
    gst_number: Optional[str] = None
    website: Optional[str] = None
    city: Optional[str] = None
    preferred_platform: str
    onboarding_completed: bool

    class Config:
        from_attributes = True

# Ad Accounts & OAuth
class AdAccountResponse(BaseModel):
    id: str
    platform: str
    account_id: str
    account_name: Optional[str] = None
    status: str
    connected_at: datetime

    class Config:
        from_attributes = True

class ConnectOAuthRequest(BaseModel):
    platform: str
    account_id: Optional[str] = None
    account_name: Optional[str] = None

# Campaigns
class CampaignCreate(BaseModel):
    platform: str
    title: str
    objective: str = "Lead Generation"
    daily_budget: float = 500.0
    total_budget: float = 10000.0

class CampaignResponse(BaseModel):
    id: str
    platform: str
    title: str
    objective: str
    daily_budget: float
    total_budget: float
    status: str
    impressions: int
    clicks: int
    spend: float
    leads_count: int
    roas: float
    created_at: datetime

    class Config:
        from_attributes = True

# AI Objective Recommendation
class AIObjectiveRequest(BaseModel):
    business_description: str
    target_city: Optional[str] = "All India"
    target_goal: Optional[str] = "Leads & Direct WhatsApp Messages"

class AIObjectiveResponse(BaseModel):
    score: int
    suggested_audience: List[str]
    recommended_keywords: List[str]
    estimated_reach: str
    estimated_leads: str
    ai_recommendation: str

# Leads
class LeadStatusUpdate(BaseModel):
    status: str

class LeadResponse(BaseModel):
    id: str
    campaign_id: Optional[str] = None
    platform: str
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    status: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

# Posts Hub
class PostCreate(BaseModel):
    platform: str
    caption: str
    media_url: Optional[str] = None
    status: str = "published" # draft, scheduled, published

class PostResponse(BaseModel):
    id: str
    platform: str
    caption: str
    media_url: Optional[str] = None
    status: str
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Stats
class DashboardStatsResponse(BaseModel):
    active_campaigns_count: int
    total_spend: float
    total_leads: int
    avg_cpl: float
    connected_platforms: List[str]
    wallet_balance: float

# Billing & Transactions
class TransactionResponse(BaseModel):
    id: str
    amount: float
    currency: str
    platform: Optional[str] = None
    status: str
    description: str
    invoice_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
