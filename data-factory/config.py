import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_PATH = os.getenv('DATABASE_PATH', './data/financial_data.db')

# Blockchain
ALCHEMY_BASE_URL = os.getenv('ALCHEMY_BASE_URL', '')
USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

# API Keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# SEC Configuration
SEC_USER_AGENT = os.getenv('SEC_USER_AGENT', 'MicroTerm admin@microterm.io')
SEC_FORM_D_RSS = 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=D&company=&dateb=&owner=exclude&start=0&count=100&output=atom'

# News Sources
NEWS_SOURCES = [
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://cointelegraph.com/rss',
]

# Whale Alert Thresholds
WHALE_THRESHOLD_USDC = 1_000_000  # $1M
WHALE_THRESHOLD_ETH = 100  # 100 ETH

# Worker Intervals (seconds)
SEC_WORKER_INTERVAL = 600  # 10 minutes
BLOCKCHAIN_WORKER_INTERVAL = 30  # 30 seconds
NEWS_WORKER_INTERVAL = 300  # 5 minutes
MARKET_WORKER_INTERVAL = 60  # 1 minute

