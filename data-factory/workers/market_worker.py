import yfinance as yf
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Database

class MarketWorker:
    def __init__(self):
        self.db = Database()
        self.tickers = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'NVDA', 'COIN']
    
    def fetch_market_data(self):
        """Fetch market data for all tickers"""
        print(f"[Market Worker] Fetching market data at {datetime.now()}")
        
        for ticker in self.tickers:
            try:
                self.fetch_ticker_data(ticker)
            except Exception as e:
                print(f"[Market Worker] Error fetching {ticker}: {e}")
    
    def fetch_ticker_data(self, ticker: str):
        """Fetch data for a single ticker"""
        try:
            stock = yf.Ticker(ticker)
            
            # Get current price and stats
            info = stock.info
            
            # Get historical data for 24h change
            hist = stock.history(period='2d')
            
            if len(hist) >= 2:
                current_price = hist['Close'].iloc[-1]
                prev_price = hist['Close'].iloc[-2]
                change_24h = ((current_price - prev_price) / prev_price) * 100
                volume_24h = hist['Volume'].iloc[-1]
            else:
                current_price = info.get('currentPrice', 0)
                change_24h = info.get('regularMarketChangePercent', 0)
                volume_24h = info.get('volume', 0)
            
            # Update database
            self.db.update_market_data(
                symbol=ticker.replace('-USD', ''),
                price=float(current_price),
                change_24h=float(change_24h),
                volume_24h=float(volume_24h)
            )
            
            print(f"[Market Worker] Updated {ticker}: ${current_price:.2f} ({change_24h:+.2f}%)")
        
        except Exception as e:
            print(f"[Market Worker] Error fetching {ticker}: {e}")
    
    def seed_initial_data(self):
        """Seed database with initial market data"""
        print("[Market Worker] Seeding initial market data...")
        
        sample_data = [
            {'symbol': 'BTC', 'price': 64234.50, 'change_24h': 2.5, 'volume_24h': 28_500_000_000},
            {'symbol': 'ETH', 'price': 3456.78, 'change_24h': -1.2, 'volume_24h': 15_200_000_000},
            {'symbol': 'SOL', 'price': 145.32, 'change_24h': 5.8, 'volume_24h': 2_800_000_000},
            {'symbol': 'NVDA', 'price': 892.45, 'change_24h': 1.4, 'volume_24h': 45_000_000},
            {'symbol': 'COIN', 'price': 234.67, 'change_24h': -0.8, 'volume_24h': 8_500_000},
        ]
        
        for data in sample_data:
            self.db.update_market_data(
                symbol=data['symbol'],
                price=data['price'],
                change_24h=data['change_24h'],
                volume_24h=data['volume_24h']
            )
            print(f"[Market Worker] Seeded: {data['symbol']}")

def run_once():
    """Run the market worker once"""
    worker = MarketWorker()
    worker.seed_initial_data()
    worker.fetch_market_data()

if __name__ == '__main__':
    run_once()

