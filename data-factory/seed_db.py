#!/usr/bin/env python3
"""Quick database seeder for MicroTerm"""
import sqlite3
from datetime import datetime, timedelta
import random
import os
import config

def seed_database():
    # Ensure database exists and tables are created
    from database.models import Database
    db = Database()
    
    print(f"Seeding database at: {config.DATABASE_PATH}")
    
    conn = sqlite3.connect(config.DATABASE_PATH)
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute("DELETE FROM market_data")
    cursor.execute("DELETE FROM private_deals")
    cursor.execute("DELETE FROM whale_alerts")
    cursor.execute("DELETE FROM news")
    
    # Seed market data
    market_data = [
        ('BTC', 64234.50, 2.5),
        ('ETH', 3456.78, -1.2),
        ('SOL', 145.32, 5.8),
        ('NVDA', 892.45, 1.4),
        ('COIN', 234.12, -0.8),
    ]
    
    for symbol, price, change in market_data:
        cursor.execute(
            "INSERT INTO market_data (symbol, price, change_24h, updated_at) VALUES (?, ?, ?, ?)",
            (symbol, price, change, datetime.now())
        )
    
    # Seed private deals
    deals = [
        ('Anthropic AI', 750000000, 'https://sec.gov/filing/anthropic-2024', 'AI/ML', datetime.now() - timedelta(days=1)),
        ('Stripe Payments', 500000000, 'https://sec.gov/filing/stripe-2024', 'Fintech', datetime.now() - timedelta(days=2)),
        ('SpaceX Launch', 350000000, 'https://sec.gov/filing/spacex-2024', 'Aerospace', datetime.now() - timedelta(days=3)),
        ('Databricks Inc', 450000000, 'https://sec.gov/filing/databricks-2024', 'Cloud/Data', datetime.now() - timedelta(days=4)),
        ('Canva Design', 200000000, 'https://sec.gov/filing/canva-2024', 'SaaS', datetime.now() - timedelta(days=5)),
    ]
    
    for company, amount, url, sector, filed_at in deals:
        cursor.execute(
            "INSERT INTO private_deals (company_name, amount_raised, filing_url, sector, filed_at, is_premium) VALUES (?, ?, ?, ?, ?, 1)",
            (company, amount, url, sector, filed_at)
        )
    
    # Seed whale alerts
    whales = [
        ('0xabc...123', 'Binance Hot Wallet', '0xdef...456', 'Unknown', 'USDC', '0x123...abc', 5000000, None, False),
        ('0x789...xyz', 'Coinbase', '0x456...def', 'DeFi Protocol', 'ETH', '0xeth...addr', 1500, None, False),
        ('0xwhale...1', 'Whale #1', '0xdex...pool', 'Uniswap V3', 'AERO', '0xaero...token', 250000, 'uniswap-v3', True),
        ('0xwhale...2', 'Jump Trading', '0xwallet...x', 'Unknown', 'SOL', '0xsol...addr', 50000, None, False),
        ('0xvc...fund', 'a16z Crypto', '0xproject...y', 'New Project', 'USDC', '0x123...abc', 10000000, None, False),
    ]
    
    for sender, sender_label, receiver, receiver_label, token, token_addr, amount, dex, tradeable in whales:
        cursor.execute(
            """INSERT INTO whale_alerts 
            (tx_hash, sender_address, sender_label, receiver_address, receiver_label, 
             token_symbol, token_address, amount, dex_pool, is_tradeable, timestamp, is_premium) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)""",
            (f"0x{random.randint(1000000, 9999999):x}", sender, sender_label, receiver, receiver_label,
             token, token_addr, amount, dex, tradeable, datetime.now() - timedelta(hours=random.randint(1, 24)))
        )
    
    # Seed news
    news_items = [
        ('Bitcoin ETF Sees Record Inflows', 'Institutional investors pour $2B into Bitcoin ETFs', 'Bullish', 'Bloomberg', 'https://bloomberg.com/btc-etf'),
        ('Ethereum Upgrade Delayed', 'Developers postpone major network upgrade to Q2', 'Bearish', 'CoinDesk', 'https://coindesk.com/eth-delay'),
        ('Solana DeFi TVL Hits All-Time High', 'Total value locked surpasses $5B milestone', 'Bullish', 'The Block', 'https://theblock.co/solana-tvl'),
        ('SEC Approves New Crypto Framework', 'Regulatory clarity for digital assets expected', 'Bullish', 'Reuters', 'https://reuters.com/sec-crypto'),
        ('Major Exchange Hack Reported', 'Unknown exchange loses $50M in security breach', 'Bearish', 'CryptoNews', 'https://cryptonews.com/hack'),
    ]
    
    for title, summary, sentiment, source, url in news_items:
        cursor.execute(
            "INSERT INTO news (title, summary, sentiment, source, url, published_at, is_premium) VALUES (?, ?, ?, ?, ?, ?, 1)",
            (title, summary, sentiment, source, url, datetime.now() - timedelta(hours=random.randint(1, 12)))
        )
    
    conn.commit()
    conn.close()
    print("✅ Database seeded successfully!")
    print(f"   - {len(market_data)} market data entries")
    print(f"   - {len(deals)} private deals")
    print(f"   - {len(whales)} whale alerts")
    print(f"   - {len(news_items)} news items")

if __name__ == "__main__":
    seed_database()

