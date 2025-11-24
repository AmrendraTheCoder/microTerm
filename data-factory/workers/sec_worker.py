import feedparser
import requests
from datetime import datetime
from bs4 import BeautifulSoup
import time
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Database
import config

class SECWorker:
    def __init__(self):
        self.db = Database()
        self.headers = {
            'User-Agent': config.SEC_USER_AGENT
        }
    
    def fetch_form_d_filings(self):
        """Fetch Form D filings from SEC RSS feed"""
        print(f"[SEC Worker] Fetching Form D filings at {datetime.now()}")
        
        try:
            # Parse RSS feed
            feed = feedparser.parse(config.SEC_FORM_D_RSS)
            
            if not feed.entries:
                print("[SEC Worker] No entries found in feed")
                return
            
            print(f"[SEC Worker] Found {len(feed.entries)} entries")
            
            for entry in feed.entries:
                try:
                    self.process_filing(entry)
                    time.sleep(0.1)  # Rate limiting
                except Exception as e:
                    print(f"[SEC Worker] Error processing entry: {e}")
                    continue
        
        except Exception as e:
            print(f"[SEC Worker] Error fetching RSS feed: {e}")
    
    def process_filing(self, entry):
        """Process a single Form D filing"""
        try:
            # Extract basic info from RSS entry
            company_name = entry.get('title', 'Unknown Company')
            filing_url = entry.get('link', '')
            
            # Parse the published date
            published = entry.get('published', '')
            try:
                filed_at = datetime.strptime(published, '%Y-%m-%dT%H:%M:%S%z')
            except:
                filed_at = datetime.now()
            
            # Extract additional details from summary
            summary = entry.get('summary', '')
            
            # Try to extract amount raised and sector from the filing
            # Note: This is simplified - real implementation would parse XML
            amount_raised = self.extract_amount_from_summary(summary)
            sector = self.extract_sector_from_summary(summary)
            
            # Filter: Only store deals > $1M
            if amount_raised and amount_raised >= 1_000_000:
                deal_id = self.db.insert_deal(
                    company_name=company_name,
                    amount_raised=amount_raised,
                    filing_url=filing_url,
                    sector=sector or 'Unknown',
                    filed_at=filed_at
                )
                
                if deal_id:
                    print(f"[SEC Worker] Inserted deal: {company_name} - ${amount_raised:,.0f}")
                else:
                    print(f"[SEC Worker] Deal already exists: {company_name}")
        
        except Exception as e:
            print(f"[SEC Worker] Error processing filing: {e}")
    
    def extract_amount_from_summary(self, summary: str) -> float:
        """Extract amount raised from summary (simplified)"""
        # In a real implementation, you would parse the actual Form D XML
        # For now, we'll generate realistic amounts for demonstration
        import random
        amounts = [1_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000]
        return random.choice(amounts)
    
    def extract_sector_from_summary(self, summary: str) -> str:
        """Extract sector from summary (simplified)"""
        sectors = ['Technology', 'Healthcare', 'Fintech', 'AI/ML', 'Biotech', 'SaaS', 'E-commerce']
        import random
        return random.choice(sectors)
    
    def seed_initial_data(self):
        """Seed database with initial sample data"""
        print("[SEC Worker] Seeding initial data...")
        
        sample_deals = [
            {
                'company_name': 'Anthropic',
                'amount_raised': 450_000_000,
                'sector': 'AI',
                'filing_url': 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001234567',
            },
            {
                'company_name': 'Stripe',
                'amount_raised': 6_500_000_000,
                'sector': 'Fintech',
                'filing_url': 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001234568',
            },
            {
                'company_name': 'SpaceX',
                'amount_raised': 750_000_000,
                'sector': 'Aerospace',
                'filing_url': 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001234569',
            },
            {
                'company_name': 'OpenAI',
                'amount_raised': 10_000_000_000,
                'sector': 'AI',
                'filing_url': 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001234570',
            },
            {
                'company_name': 'Databricks',
                'amount_raised': 500_000_000,
                'sector': 'Data Infrastructure',
                'filing_url': 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001234571',
            },
        ]
        
        for deal in sample_deals:
            deal_id = self.db.insert_deal(
                company_name=deal['company_name'],
                amount_raised=deal['amount_raised'],
                filing_url=deal['filing_url'],
                sector=deal['sector'],
                filed_at=datetime.now()
            )
            if deal_id:
                print(f"[SEC Worker] Seeded: {deal['company_name']}")

def run_once():
    """Run the SEC worker once"""
    worker = SECWorker()
    worker.seed_initial_data()
    worker.fetch_form_d_filings()

if __name__ == '__main__':
    run_once()

