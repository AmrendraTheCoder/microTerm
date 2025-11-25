import sqlite3
from datetime import datetime, timedelta
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
                token_address TEXT,
                amount REAL,
                dex_pool TEXT,
                is_tradeable BOOLEAN DEFAULT 0,
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
        
        # NFT Receipts Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nft_receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token_id INTEGER NOT NULL,
                user_wallet TEXT NOT NULL,
                item_type TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                price_paid REAL NOT NULL,
                tx_hash TEXT NOT NULL,
                minted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(token_id)
            )
        ''')
        
        # Loyalty Balances Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS loyalty_balances (
                user_wallet TEXT PRIMARY KEY,
                balance REAL DEFAULT 0,
                total_earned REAL DEFAULT 0,
                total_spent REAL DEFAULT 0,
                last_free_unlock DATETIME,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Token Gates Table (track free unlocks)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS token_gates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_wallet TEXT NOT NULL,
                item_type TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_wallet, item_type, item_id)
            )
        ''')
        
        # Agent Actions Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agent_actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_wallet TEXT NOT NULL,
                action_type TEXT NOT NULL,
                item_type TEXT,
                item_id INTEGER,
                rule_matched TEXT,
                cost REAL,
                success BOOLEAN DEFAULT 1,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # AI Summaries Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_type TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                summary_text TEXT,
                model_used TEXT,
                generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(item_type, item_id)
            )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_deals_filed_at ON private_deals(filed_at DESC)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON whale_alerts(timestamp DESC)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_unlocks_wallet ON user_unlocks(user_wallet)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_nft_receipts_wallet ON nft_receipts(user_wallet)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_agent_actions_wallet ON agent_actions(user_wallet)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_agent_actions_time ON agent_actions(executed_at DESC)')
        
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
                          amount: float, timestamp: datetime, token_address: str = None,
                          dex_pool: str = None, is_tradeable: bool = False) -> Optional[int]:
        """Insert a new whale alert"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO whale_alerts 
                (tx_hash, sender_address, sender_label, receiver_address, receiver_label, 
                 token_symbol, token_address, amount, dex_pool, is_tradeable, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (tx_hash, sender_address, sender_label, receiver_address, receiver_label,
                  token_symbol, token_address, amount, dex_pool, is_tradeable, timestamp))
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
    
    # NFT Receipts Methods
    def record_nft_receipt(self, token_id: int, user_wallet: str, item_type: str,
                          item_id: int, price_paid: float, tx_hash: str) -> Optional[int]:
        """Record an NFT receipt mint"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO nft_receipts (token_id, user_wallet, item_type, item_id, price_paid, tx_hash)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (token_id, user_wallet.lower(), item_type, item_id, price_paid, tx_hash))
            conn.commit()
            receipt_id = cursor.lastrowid
            conn.close()
            return receipt_id
        except sqlite3.IntegrityError:
            return None
    
    def get_user_nft_receipts(self, user_wallet: str) -> List[Dict[str, Any]]:
        """Get all NFT receipts for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM nft_receipts 
            WHERE user_wallet = ? 
            ORDER BY minted_at DESC
        ''', (user_wallet.lower(),))
        receipts = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return receipts
    
    # Loyalty Balance Methods
    def update_loyalty_balance(self, user_wallet: str, amount_earned: float = 0,
                              amount_spent: float = 0) -> None:
        """Update user's loyalty token balance"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get current balance or create new record
        cursor.execute('SELECT * FROM loyalty_balances WHERE user_wallet = ?', (user_wallet.lower(),))
        existing = cursor.fetchone()
        
        if existing:
            new_balance = existing['balance'] + amount_earned - amount_spent
            new_earned = existing['total_earned'] + amount_earned
            new_spent = existing['total_spent'] + amount_spent
            
            cursor.execute('''
                UPDATE loyalty_balances 
                SET balance = ?, total_earned = ?, total_spent = ?, updated_at = ?
                WHERE user_wallet = ?
            ''', (new_balance, new_earned, new_spent, datetime.now(), user_wallet.lower()))
        else:
            cursor.execute('''
                INSERT INTO loyalty_balances (user_wallet, balance, total_earned, total_spent)
                VALUES (?, ?, ?, ?)
            ''', (user_wallet.lower(), amount_earned - amount_spent, amount_earned, amount_spent))
        
        conn.commit()
        conn.close()
    
    def get_loyalty_balance(self, user_wallet: str) -> Dict[str, Any]:
        """Get user's loyalty balance"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM loyalty_balances WHERE user_wallet = ?', (user_wallet.lower(),))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return dict(result)
        return {
            'user_wallet': user_wallet.lower(),
            'balance': 0,
            'total_earned': 0,
            'total_spent': 0,
            'last_free_unlock': None
        }
    
    def can_use_free_unlock(self, user_wallet: str) -> bool:
        """Check if user can use a free unlock (100+ tokens, 24h cooldown)"""
        balance_info = self.get_loyalty_balance(user_wallet)
        
        # Check if user has enough tokens
        if balance_info['balance'] < 100:
            return False
        
        # Check cooldown
        if balance_info['last_free_unlock']:
            last_unlock = datetime.fromisoformat(balance_info['last_free_unlock'])
            cooldown_hours = 24
            if datetime.now() < last_unlock + timedelta(hours=cooldown_hours):
                return False
        
        return True
    
    def use_free_unlock(self, user_wallet: str) -> bool:
        """Record a free unlock usage"""
        if not self.can_use_free_unlock(user_wallet):
            return False
        
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE loyalty_balances 
            SET last_free_unlock = ?
            WHERE user_wallet = ?
        ''', (datetime.now(), user_wallet.lower()))
        conn.commit()
        conn.close()
        return True
    
    # Token Gates Methods
    def record_token_gate_unlock(self, user_wallet: str, item_type: str, item_id: int) -> Optional[int]:
        """Record a token-gated unlock"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO token_gates (user_wallet, item_type, item_id)
                VALUES (?, ?, ?)
            ''', (user_wallet.lower(), item_type, item_id))
            conn.commit()
            gate_id = cursor.lastrowid
            conn.close()
            return gate_id
        except sqlite3.IntegrityError:
            return None
    
    # Agent Actions Methods
    def record_agent_action(self, user_wallet: str, action_type: str, item_type: str = None,
                           item_id: int = None, rule_matched: str = None, cost: float = 0,
                           success: bool = True) -> int:
        """Record an agent action"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO agent_actions 
            (user_wallet, action_type, item_type, item_id, rule_matched, cost, success)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_wallet.lower(), action_type, item_type, item_id, rule_matched, cost, success))
        conn.commit()
        action_id = cursor.lastrowid
        conn.close()
        return action_id
    
    def get_agent_actions(self, user_wallet: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent agent actions for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM agent_actions 
            WHERE user_wallet = ? 
            ORDER BY executed_at DESC 
            LIMIT ?
        ''', (user_wallet.lower(), limit))
        actions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return actions
    
    # AI Summaries Methods
    def save_ai_summary(self, item_type: str, item_id: int, summary_text: str,
                       model_used: str = 'mock') -> Optional[int]:
        """Save an AI-generated summary"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO ai_summaries (item_type, item_id, summary_text, model_used)
                VALUES (?, ?, ?, ?)
            ''', (item_type, item_id, summary_text, model_used))
            conn.commit()
            summary_id = cursor.lastrowid
            conn.close()
            return summary_id
        except Exception as e:
            print(f"Error saving AI summary: {e}")
            return None
    
    def get_ai_summary(self, item_type: str, item_id: int) -> Optional[Dict[str, Any]]:
        """Get cached AI summary"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM ai_summaries 
            WHERE item_type = ? AND item_id = ?
        ''', (item_type, item_id))
        result = cursor.fetchone()
        conn.close()
        return dict(result) if result else None

