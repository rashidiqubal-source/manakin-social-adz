import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from app.db.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    first_name = Column(String(100), nullable=False, default="Business")
    last_name = Column(String(100), nullable=False, default="Owner")
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    businesses = relationship("Business", back_populates="owner", cascade="all, delete-orphan")

class Business(Base):
    __tablename__ = "businesses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, default="My Enterprise")
    category = Column(String(100), nullable=False, default="E-Commerce & Retail")
    monthly_budget = Column(String(50), nullable=False, default="₹10,000 - ₹50,000")
    description = Column(Text, nullable=True)
    gst_number = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True, default="Mumbai")
    preferred_platform = Column(String(50), default="both")
    onboarding_completed = Column(Boolean, default=True)

    owner = relationship("User", back_populates="businesses")
    ad_accounts = relationship("AdAccount", back_populates="business", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="business", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="business", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="business", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="business", cascade="all, delete-orphan")

class AdAccount(Base):
    __tablename__ = "ad_accounts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=False) # 'meta', 'google', 'snapchat', 'twitter', 'whatsapp'
    account_id = Column(String(255), nullable=False)
    account_name = Column(String(255), nullable=True)
    status = Column(String(50), default="connected") # 'connected', 'disconnected', 'expired'
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    connected_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="ad_accounts")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=False) # 'meta', 'google', 'snapchat', 'twitter', 'whatsapp'
    title = Column(String(255), nullable=False)
    objective = Column(String(100), nullable=False, default="Lead Generation")
    daily_budget = Column(Float, nullable=False, default=500.0)
    total_budget = Column(Float, nullable=False, default=10000.0)
    status = Column(String(50), default="active") # 'draft', 'active', 'paused', 'completed'
    
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    spend = Column(Float, default=0.0)
    leads_count = Column(Integer, default=0)
    roas = Column(Float, default=3.5)

    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="campaigns")
    leads = relationship("Lead", back_populates="campaign")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    platform = Column(String(50), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    status = Column(String(50), default="new") # 'new', 'contacted', 'converted', 'closed'
    source = Column(String(100), default="Meta Lead Ads")
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="leads")
    campaign = relationship("Campaign", back_populates="leads")

class Post(Base):
    __tablename__ = "posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=False) # 'facebook', 'instagram'
    caption = Column(Text, nullable=False)
    media_url = Column(Text, nullable=True)
    status = Column(String(50), default="published") # 'draft', 'scheduled', 'published', 'failed'
    scheduled_at = Column(DateTime, nullable=True)
    published_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="posts")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    platform = Column(String(50), nullable=True)
    status = Column(String(50), default="paid") # 'paid', 'pending', 'refunded'
    description = Column(String(255), nullable=False)
    invoice_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="transactions")
