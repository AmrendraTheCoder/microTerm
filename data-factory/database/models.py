import sqlite3
from datetime import datetime
from typing import Optional, List, Dict, Any
import config

class Database:
    def __init__(self, db_path: str = config.DATABASE_PATH):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize database with schema"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Private Deals Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS private_deals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                amount_raised REAL,
                filing_url TEXT,
                sector TEXT,
                filed_at DATETIME,
                is_premium BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(filing_url)
            )
        ''')
        
        # Whale Alerts Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS whale_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tx_hash TEXT UNIQUE NOT NULL,
                sender_address TEXT,
                sender_label TEXT,
                receiver_address TEXT,
                receiver_label TEXT,
                token_symbol TEXT,
                amount REAL,
                timestamp DATETIME,
                is_premium BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # News Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                summary TEXT,
                sentiment TEXT,
                source TEXT,
                url TEXT UNIQUE,
                published_at DATETIME,
                is_premium BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # User Unlocks Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_unlocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_wallet TEXT NOT NULL,
                item_type TEXT,
                item_id INTEGER,
                tx_hash TEXT NOT NULL,
                amount_paid REAL,
                unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_wallet, item_type, item_id)
            )
        ''')
        
        # Known Addresses Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS known_addresses (
                address TEXT PRIMARY KEY,
                label TEXT,
                category TEXT
            )
        ''')
        
        # Market Data Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS market_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                price REAL,
                change_24h REAL,
                volume_24h REAL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_deals_filed_at ON private_deals(filed_at DESC)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON whale_alerts(timestamp DESC)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_unlocks_wallet ON user_unlocks(user_wallet)')
        
        conn.commit()
        conn.close()
    
    # Private Deals Methods
    def insert_deal(self, company_name: str, amount_raised: float, filing_url: str, 
                    sector: str, filed_at: datetime) -> Optional[int]:
        """Insert a new private deal"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO private_deals (company_name, amount_raised, filing_url, sector, filed_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (company_name, amount_raised, filing_url, sector, filed_at))
            conn.commit()
            deal_id = cursor.lastrowid
            conn.close()
            return deal_id
        except sqlite3.IntegrityError:
            return None
    
    def get_recent_deals(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent deals"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM private_deals 
            ORDER BY filed_at DESC 
            LIMIT ?
        ''', (limit,))
        deals = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return deals
    
    # Whale Alerts Methods
    def insert_whale_alert(self, tx_hash: str, sender_address: str, sender_label: str,
                          receiver_address: str, receiver_label: str, token_symbol: str,
                          amount: float, timestamp: datetime) -> Optional[int]:
        """Insert a new whale alert"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO whale_alerts 
                (tx_hash, sender_address, sender_label, receiver_address, receiver_label, 
                 token_symbol, amount, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (tx_hash, sender_address, sender_label, receiver_address, receiver_label,
                  token_symbol, amount, timestamp))
            conn.commit()
            alert_id = cursor.lastrowid
            conn.close()
            return alert_id
        except sqlite3.IntegrityError:
            return None
    
    def get_recent_alerts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent whale alerts"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM whale_alerts 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        alerts = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return alerts
    
    # News Methods
    def insert_news(self, title: str, summary: str, sentiment: str, source: str,
                   url: str, published_at: datetime) -> Optional[int]:
        """Insert a news article"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO news (title, summary, sentiment, source, url, published_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (title, summary, sentiment, source, url, published_at))
            conn.commit()
            news_id = cursor.lastrowid
            conn.close()
            return news_id
        except sqlite3.IntegrityError:
            return None
    
    def get_recent_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent news"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM news 
            ORDER BY published_at DESC 
            LIMIT ?
        ''', (limit,))
        news = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return news
    
    # Known Addresses Methods
    def get_address_label(self, address: str) -> Optional[str]:
        """Get label for a known address"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT label FROM known_addresses WHERE address = ?', (address.lower(),))
        result = cursor.fetchone()
        conn.close()
        return result['label'] if result else None
    
    def insert_known_address(self, address: str, label: str, category: str):
        """Insert a known address"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO known_addresses (address, label, category)
                VALUES (?, ?, ?)
            ''', (address.lower(), label, category))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error inserting known address: {e}")
    
    # User Unlocks Methods
    def record_unlock(self, user_wallet: str, item_type: str, item_id: int, 
                     tx_hash: str, amount_paid: float) -> Optional[int]:
        """Record a user unlock"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO user_unlocks (user_wallet, item_type, item_id, tx_hash, amount_paid)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_wallet.lower(), item_type, item_id, tx_hash, amount_paid))
            conn.commit()
            unlock_id = cursor.lastrowid
            conn.close()
            return unlock_id
        except sqlite3.IntegrityError:
            return None
    
    def check_unlock(self, user_wallet: str, item_type: str, item_id: int) -> bool:
        """Check if user has unlocked an item"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id FROM user_unlocks 
            WHERE user_wallet = ? AND item_type = ? AND item_id = ?
        ''', (user_wallet.lower(), item_type, item_id))
        result = cursor.fetchone()
        conn.close()
        return result is not None
    
    # Market Data Methods
    def update_market_data(self, symbol: str, price: float, change_24h: float, volume_24h: float):
        """Update market data for a symbol"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO market_data (symbol, price, change_24h, volume_24h, updated_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (symbol, price, change_24h, volume_24h, datetime.now()))
        conn.commit()
        conn.close()
    
    def get_market_data(self) -> List[Dict[str, Any]]:
        """Get all market data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM market_data ORDER BY symbol')
        data = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return data

