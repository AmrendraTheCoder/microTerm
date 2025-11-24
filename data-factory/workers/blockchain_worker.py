from web3 import Web3
from datetime import datetime
import time
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Database
import config

class BlockchainWorker:
    def __init__(self):
        self.db = Database()
        self.w3 = None
        if config.ALCHEMY_BASE_URL:
            self.w3 = Web3(Web3.HTTPProvider(config.ALCHEMY_BASE_URL))
        
        # Seed known addresses
        self.seed_known_addresses()
    
    def seed_known_addresses(self):
        """Seed database with known addresses"""
        known_addresses = [
            ('0x28c6c06298d514db089934071355e5743bf21d60', 'Binance Hot Wallet', 'exchange'),
            ('0x21a31ee1afc51d94c2efccaa2092ad1028285549', 'Binance Cold Wallet', 'exchange'),
            ('0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', 'Binance', 'exchange'),
            ('0xd551234ae421e3bcba99a0da6d736074f22192ff', 'Binance', 'exchange'),
            ('0x564286362092d8e7936f0549571a803b203aaced', 'Binance', 'exchange'),
            ('0x0681d8db095565fe8a346fa0277bffde9c0edbbf', 'Binance', 'exchange'),
            ('0xfe9e8709d3215310075d67e3ed32a380ccf451c8', 'Binance', 'exchange'),
            ('0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67', 'Binance', 'exchange'),
            ('0xbe0eb53f46cd790cd13851d5eff43d12404d33e8', 'Binance', 'exchange'),
            ('0xf977814e90da44bfa03b6295a0616a897441acec', 'Binance', 'exchange'),
            ('0x8894e0a0c962cb723c1976a4421c95949be2d4e3', 'Binance Hot Wallet', 'exchange'),
            ('0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf', 'Polygon (Matic): ERC20 Bridge', 'bridge'),
            ('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'USDC Contract', 'token'),
            ('0xdac17f958d2ee523a2206206994597c13d831ec7', 'Tether: USDT Stablecoin', 'token'),
            ('0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503', 'Wintermute Trading', 'market_maker'),
            ('0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2', 'FTX Exchange', 'exchange'),
            ('0x5041ed759dd4afc3a72b8192c143f72f4724081a', 'Jump Trading', 'market_maker'),
            ('0x1111111254fb6c44bac0bed2854e76f90643097d', '1inch: Aggregation Router', 'defi'),
            ('0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', 'Uniswap V3: Router 2', 'defi'),
            ('0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', 'Uniswap: Universal Router', 'defi'),
        ]
        
        for address, label, category in known_addresses:
            self.db.insert_known_address(address, label, category)
    
    def watch_whale_transfers(self):
        """Watch for large transfers on Base"""
        print(f"[Blockchain Worker] Watching for whale transfers at {datetime.now()}")
        
        if not self.w3 or not self.w3.is_connected():
            print("[Blockchain Worker] Not connected to Base RPC")
            return
        
        try:
            # Get latest block
            latest_block = self.w3.eth.get_block('latest', full_transactions=True)
            
            print(f"[Blockchain Worker] Scanning block {latest_block['number']}")
            
            # Process transactions in the block
            for tx in latest_block['transactions']:
                self.process_transaction(tx)
        
        except Exception as e:
            print(f"[Blockchain Worker] Error watching transfers: {e}")
    
    def process_transaction(self, tx):
        """Process a single transaction"""
        try:
            # Check if it's a USDC transfer (simplified)
            if tx['to'] and tx['to'].lower() == config.USDC_BASE_ADDRESS.lower():
                # This is an interaction with USDC contract
                # In reality, we'd decode the calldata to get transfer details
                # For now, we'll generate sample data
                pass
            
            # Check for large ETH transfers
            value_eth = self.w3.from_wei(tx['value'], 'ether')
            if value_eth >= config.WHALE_THRESHOLD_ETH:
                self.record_whale_alert(tx, value_eth, 'ETH')
        
        except Exception as e:
            print(f"[Blockchain Worker] Error processing transaction: {e}")
    
    def record_whale_alert(self, tx, amount, token_symbol):
        """Record a whale alert"""
        try:
            sender_address = tx['from']
            receiver_address = tx['to'] or 'Contract Creation'
            
            sender_label = self.db.get_address_label(sender_address) or 'Unknown Wallet'
            receiver_label = self.db.get_address_label(receiver_address) or 'Unknown Wallet'
            
            alert_id = self.db.insert_whale_alert(
                tx_hash=tx['hash'].hex(),
                sender_address=sender_address,
                sender_label=sender_label,
                receiver_address=receiver_address,
                receiver_label=receiver_label,
                token_symbol=token_symbol,
                amount=float(amount),
                timestamp=datetime.now()
            )
            
            if alert_id:
                print(f"[Blockchain Worker] Whale alert: {amount} {token_symbol} from {sender_label}")
        
        except Exception as e:
            print(f"[Blockchain Worker] Error recording alert: {e}")
    
    def seed_initial_data(self):
        """Seed database with initial whale alerts"""
        print("[Blockchain Worker] Seeding initial whale alerts...")
        
        sample_alerts = [
            {
                'tx_hash': '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                'sender_address': '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503',
                'sender_label': 'Wintermute Trading',
                'receiver_address': '0x28c6c06298d514db089934071355e5743bf21d60',
                'receiver_label': 'Binance Hot Wallet',
                'token_symbol': 'USDC',
                'amount': 5_000_000,
            },
            {
                'tx_hash': '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                'sender_address': '0x5041ed759dd4afc3a72b8192c143f72f4724081a',
                'sender_label': 'Jump Trading',
                'receiver_address': '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
                'receiver_label': 'Uniswap V3: Router 2',
                'token_symbol': 'ETH',
                'amount': 2_500,
            },
            {
                'tx_hash': '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
                'sender_address': '0x28c6c06298d514db089934071355e5743bf21d60',
                'sender_label': 'Binance Hot Wallet',
                'receiver_address': '0x1234567890abcdef1234567890abcdef12345678',
                'receiver_label': 'Unknown Wallet',
                'token_symbol': 'USDC',
                'amount': 10_000_000,
            },
        ]
        
        for alert in sample_alerts:
            alert_id = self.db.insert_whale_alert(
                tx_hash=alert['tx_hash'],
                sender_address=alert['sender_address'],
                sender_label=alert['sender_label'],
                receiver_address=alert['receiver_address'],
                receiver_label=alert['receiver_label'],
                token_symbol=alert['token_symbol'],
                amount=alert['amount'],
                timestamp=datetime.now()
            )
            if alert_id:
                print(f"[Blockchain Worker] Seeded: {alert['sender_label']} → {alert['receiver_label']}")

def run_once():
    """Run the blockchain worker once"""
    worker = BlockchainWorker()
    worker.seed_initial_data()
    # Uncomment when Alchemy URL is configured
    # worker.watch_whale_transfers()

if __name__ == '__main__':
    run_once()

