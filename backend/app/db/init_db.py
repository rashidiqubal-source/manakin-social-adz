import asyncio
from datetime import datetime, timedelta
from sqlalchemy.future import select
from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.models.models import User, Business, AdAccount, Campaign, Lead, Post, Transaction

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Create Demo User
        user = User(
            id="demo-user-id",
            first_name="Rashid",
            last_name="Iqubal",
            email="mdrashidiqubal@socialadz.co",
            phone="9876543210",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        )
        db.add(user)
        await db.commit()

        # Create Demo Business
        biz = Business(
            id="demo-biz-id",
            user_id=user.id,
            name="Manakin Social Adz Store",
            category="E-Commerce & Retail",
            monthly_budget="₹25,000 - ₹50,000",
            description="Leading digital marketing platform for high-converting social media & search ads in India.",
            gst_number="27AAAAA0000A1Z5",
            website="https://socialadz.co",
            city="Mumbai",
            preferred_platform="both",
            onboarding_completed=True
        )
        db.add(biz)
        await db.commit()

        # Create Connected Ad Accounts
        ad_accs = [
            AdAccount(
                business_id=biz.id,
                platform="meta",
                account_id="act_meta_8894120",
                account_name="Manakin Meta Business Manager (FB & IG)",
                status="connected",
                access_token="mock_access_token_meta"
            ),
            AdAccount(
                business_id=biz.id,
                platform="google",
                account_id="act_goog_5541901",
                account_name="Manakin Google Ads Account",
                status="connected",
                access_token="mock_access_token_google"
            ),
            AdAccount(
                business_id=biz.id,
                platform="whatsapp",
                account_id="act_wa_1092837",
                account_name="WhatsApp Business API (+91 63976 50863)",
                status="connected",
                access_token="mock_access_token_whatsapp"
            ),
            AdAccount(
                business_id=biz.id,
                platform="snapchat",
                account_id="act_snap_7712093",
                account_name="Manakin Snapchat Ads Account",
                status="connected",
                access_token="mock_access_token_snap"
            ),
            AdAccount(
                business_id=biz.id,
                platform="twitter",
                account_id="act_tw_4491823",
                account_name="Manakin X (Twitter) Ads",
                status="connected",
                access_token="mock_access_token_twitter"
            ),
        ]
        db.add_all(ad_accs)

        # Create Campaigns
        camps = [
            Campaign(
                business_id=biz.id,
                platform="meta",
                title="Festive Apparel Mega Sale 2026",
                objective="Lead Generation & Direct WhatsApp Messages",
                daily_budget=800.0,
                total_budget=15000.0,
                status="active",
                impressions=48200,
                clicks=3410,
                spend=8400.0,
                leads_count=68,
                roas=4.8
            ),
            Campaign(
                business_id=biz.id,
                platform="google",
                title="Google High-Intent Search & Shopping",
                objective="Website Traffic & Conversions",
                daily_budget=600.0,
                total_budget=12000.0,
                status="active",
                impressions=29100,
                clicks=1950,
                spend=5200.0,
                leads_count=34,
                roas=3.9
            ),
            Campaign(
                business_id=biz.id,
                platform="snapchat",
                title="Gen-Z Youth Story & Spotlight Ads",
                objective="Brand Awareness & App Installs",
                daily_budget=300.0,
                total_budget=5000.0,
                status="active",
                impressions=18400,
                clicks=920,
                spend=1800.0,
                leads_count=12,
                roas=2.8
            ),
            Campaign(
                business_id=biz.id,
                platform="meta",
                title="Retargeting Cart Abandoners",
                objective="Catalog Sales",
                daily_budget=500.0,
                total_budget=10000.0,
                status="paused",
                impressions=12500,
                clicks=890,
                spend=3100.0,
                leads_count=22,
                roas=5.4
            ),
        ]
        db.add_all(camps)
        await db.commit()

        # Seed Leads
        leads = [
            Lead(
                business_id=biz.id,
                platform="meta",
                full_name="Aarav Verma",
                phone="+91 98112 44556",
                email="aarav.verma@gmail.com",
                city="Mumbai",
                status="new",
                source="Meta Lead Ads (Festive Campaign)"
            ),
            Lead(
                business_id=biz.id,
                platform="meta",
                full_name="Sneha Kulkarni",
                phone="+91 97223 88990",
                email="sneha.k@yahoo.com",
                city="Pune",
                status="contacted",
                source="Click-to-WhatsApp Ad"
            ),
            Lead(
                business_id=biz.id,
                platform="google",
                full_name="Vikramaditya Singh",
                phone="+91 99001 22334",
                email="vikram.singh@outlook.com",
                city="Bangalore",
                status="converted",
                source="Google Search Lead Extension"
            ),
            Lead(
                business_id=biz.id,
                platform="snapchat",
                full_name="Ananya Roy",
                phone="+91 98334 77889",
                email="ananya.roy@gmail.com",
                city="Kolkata",
                status="new",
                source="Snapchat Story Ad"
            ),
            Lead(
                business_id=biz.id,
                platform="twitter",
                full_name="Rohan Mehta",
                phone="+91 96118 33221",
                email="rohan.m@techcorp.in",
                city="Hyderabad",
                status="closed",
                source="X Promoted Campaign"
            ),
        ]
        db.add_all(leads)

        # Seed Posts
        posts = [
            Post(
                business_id=biz.id,
                platform="instagram",
                caption="🔥 Exclusive Weekend Offer! Upgrade your marketing strategy today with automated social ad management across FB, IG & Google. #SocialAdz #GrowthMarketing",
                media_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60",
                status="published"
            ),
            Post(
                business_id=biz.id,
                platform="facebook",
                caption="🚀 Scale your sales 5X with AI-driven budget allocation and real-time WhatsApp lead integration.",
                media_url="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=60",
                status="published"
            ),
            Post(
                business_id=biz.id,
                platform="instagram",
                caption="✨ New Arrival Launch Announcement! Schedule your festive campaigns in advance.",
                media_url="https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=600&auto=format&fit=crop&q=60",
                status="scheduled",
                scheduled_at=datetime.utcnow() + timedelta(days=2)
            ),
        ]
        db.add_all(posts)

        # Seed Billing Transactions
        transactions = [
            Transaction(
                business_id=biz.id,
                amount=10000.0,
                currency="INR",
                platform="Razorpay UPI",
                status="paid",
                description="Ad Wallet Recharge via UPI (HDFC Bank)",
                invoice_url="https://socialadz.co/invoices/INV-2026-9041.pdf"
            ),
            Transaction(
                business_id=biz.id,
                amount=8400.0,
                currency="INR",
                platform="Meta Ads Billing",
                status="paid",
                description="Automated Meta Ads Campaign Settlement",
                invoice_url="https://socialadz.co/invoices/INV-2026-8812.pdf"
            ),
            Transaction(
                business_id=biz.id,
                amount=5200.0,
                currency="INR",
                platform="Google Ads Billing",
                status="paid",
                description="Google Ads Account Auto-Debit",
                invoice_url="https://socialadz.co/invoices/INV-2026-7490.pdf"
            ),
        ]
        db.add_all(transactions)

        await db.commit()

if __name__ == "__main__":
    asyncio.run(init_db())
