import feedparser
import requests
from datetime import datetime
import time
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Database
import config

class NewsWorker:
    def __init__(self):
        self.db = Database()
    
    def fetch_news(self):
        """Fetch news from RSS feeds"""
        print(f"[News Worker] Fetching news at {datetime.now()}")
        
        for source_url in config.NEWS_SOURCES:
            try:
                self.fetch_from_source(source_url)
                time.sleep(1)  # Rate limiting between sources
            except Exception as e:
                print(f"[News Worker] Error fetching from {source_url}: {e}")
    
    def fetch_from_source(self, source_url: str):
        """Fetch news from a single RSS source"""
        try:
            feed = feedparser.parse(source_url)
            
            if not feed.entries:
                print(f"[News Worker] No entries from {source_url}")
                return
            
            print(f"[News Worker] Found {len(feed.entries)} articles from {source_url}")
            
            for entry in feed.entries[:10]:  # Limit to 10 most recent
                try:
                    self.process_article(entry, source_url)
                except Exception as e:
                    print(f"[News Worker] Error processing article: {e}")
                    continue
        
        except Exception as e:
            print(f"[News Worker] Error parsing feed: {e}")
    
    def process_article(self, entry, source_url: str):
        """Process a single news article"""
        try:
            title = entry.get('title', 'Untitled')
            url = entry.get('link', '')
            
            # Parse published date
            published = entry.get('published', '')
            try:
                published_at = datetime.strptime(published, '%a, %d %b %Y %H:%M:%S %z')
            except:
                try:
                    published_at = datetime.strptime(published, '%Y-%m-%dT%H:%M:%S%z')
                except:
                    published_at = datetime.now()
            
            # Extract source name from URL
            source = self.extract_source_name(source_url)
            
            # Generate summary and sentiment
            summary = self.generate_summary(entry)
            sentiment = self.analyze_sentiment(title, summary)
            
            # Insert into database
            news_id = self.db.insert_news(
                title=title,
                summary=summary,
                sentiment=sentiment,
                source=source,
                url=url,
                published_at=published_at
            )
            
            if news_id:
                print(f"[News Worker] Inserted: {title[:50]}...")
            else:
                print(f"[News Worker] Article already exists: {title[:50]}...")
        
        except Exception as e:
            print(f"[News Worker] Error processing article: {e}")
    
    def extract_source_name(self, url: str) -> str:
        """Extract source name from URL"""
        if 'coindesk' in url:
            return 'CoinDesk'
        elif 'cointelegraph' in url:
            return 'Cointelegraph'
        elif 'reuters' in url:
            return 'Reuters'
        elif 'bloomberg' in url:
            return 'Bloomberg'
        else:
            return 'Unknown Source'
    
    def generate_summary(self, entry) -> str:
        """Generate summary from article"""
        # Try to get summary from feed
        summary = entry.get('summary', '')
        if summary:
            # Clean HTML tags
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(summary, 'html.parser')
            summary = soup.get_text()
            # Limit length
            if len(summary) > 200:
                summary = summary[:200] + '...'
            return summary
        
        # Fallback to title
        return entry.get('title', 'No summary available')
    
    def analyze_sentiment(self, title: str, summary: str) -> str:
        """Analyze sentiment (simplified)"""
        # In production, use OpenAI API for better analysis
        text = (title + ' ' + summary).lower()
        
        bullish_keywords = ['surge', 'rally', 'gain', 'approve', 'adoption', 'upgrade', 'success']
        bearish_keywords = ['crash', 'drop', 'fall', 'reject', 'hack', 'scam', 'fraud']
        
        bullish_count = sum(1 for word in bullish_keywords if word in text)
        bearish_count = sum(1 for word in bearish_keywords if word in text)
        
        if bullish_count > bearish_count:
            return 'Bullish'
        elif bearish_count > bullish_count:
            return 'Bearish'
        else:
            return 'Neutral'
    
    def seed_initial_data(self):
        """Seed database with initial news"""
        print("[News Worker] Seeding initial news...")
        
        sample_news = [
            {
                'title': 'SEC Approves Bitcoin ETF Applications',
                'summary': 'Major regulatory milestone for cryptocurrency adoption as the SEC approves multiple spot Bitcoin ETF applications.',
                'sentiment': 'Bullish',
                'source': 'Reuters',
                'url': 'https://reuters.com/markets/sec-approves-bitcoin-etf',
            },
            {
                'title': 'Ethereum Upgrade Successfully Deployed',
                'summary': 'Network efficiency improved by 40% following latest fork, reducing gas fees significantly.',
                'sentiment': 'Bullish',
                'source': 'CoinDesk',
                'url': 'https://coindesk.com/ethereum-upgrade-success',
            },
            {
                'title': 'Federal Reserve Signals Rate Cut',
                'summary': 'Potential boost for risk assets including crypto markets as Fed indicates dovish policy shift.',
                'sentiment': 'Bullish',
                'source': 'Bloomberg',
                'url': 'https://bloomberg.com/fed-rate-cut-signal',
            },
            {
                'title': 'Major DeFi Protocol Reports Security Vulnerability',
                'summary': 'Developers quickly patch critical bug that could have affected millions in user funds.',
                'sentiment': 'Neutral',
                'source': 'CoinDesk',
                'url': 'https://coindesk.com/defi-security-patch',
            },
        ]
        
        for news in sample_news:
            news_id = self.db.insert_news(
                title=news['title'],
                summary=news['summary'],
                sentiment=news['sentiment'],
                source=news['source'],
                url=news['url'],
                published_at=datetime.now()
            )
            if news_id:
                print(f"[News Worker] Seeded: {news['title']}")

def run_once():
    """Run the news worker once"""
    worker = NewsWorker()
    worker.seed_initial_data()
    worker.fetch_news()

if __name__ == '__main__':
    run_once()

