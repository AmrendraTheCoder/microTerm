#!/usr/bin/env python3
"""
MicroTerm Data Factory - Main Worker Orchestrator
Runs all data collection workers on scheduled intervals
"""

import schedule
import time
from datetime import datetime
import sys

from workers.sec_worker import SECWorker
from workers.blockchain_worker import BlockchainWorker
from workers.news_worker import NewsWorker
from workers.market_worker import MarketWorker
import config

def run_sec_worker():
    """Run SEC worker"""
    try:
        print(f"\n{'='*60}")
        print(f"[Main] Running SEC Worker at {datetime.now()}")
        print(f"{'='*60}")
        worker = SECWorker()
        worker.fetch_form_d_filings()
    except Exception as e:
        print(f"[Main] SEC Worker error: {e}")

def run_blockchain_worker():
    """Run blockchain worker"""
    try:
        print(f"\n{'='*60}")
        print(f"[Main] Running Blockchain Worker at {datetime.now()}")
        print(f"{'='*60}")
        worker = BlockchainWorker()
        worker.watch_whale_transfers()
    except Exception as e:
        print(f"[Main] Blockchain Worker error: {e}")

def run_news_worker():
    """Run news worker"""
    try:
        print(f"\n{'='*60}")
        print(f"[Main] Running News Worker at {datetime.now()}")
        print(f"{'='*60}")
        worker = NewsWorker()
        worker.fetch_news()
    except Exception as e:
        print(f"[Main] News Worker error: {e}")

def run_market_worker():
    """Run market worker"""
    try:
        print(f"\n{'='*60}")
        print(f"[Main] Running Market Worker at {datetime.now()}")
        print(f"{'='*60}")
        worker = MarketWorker()
        worker.fetch_market_data()
    except Exception as e:
        print(f"[Main] Market Worker error: {e}")

def seed_all_data():
    """Seed all workers with initial data"""
    print(f"\n{'='*60}")
    print("[Main] Seeding all workers with initial data")
    print(f"{'='*60}\n")
    
    try:
        print("[Main] Seeding SEC data...")
        sec_worker = SECWorker()
        sec_worker.seed_initial_data()
    except Exception as e:
        print(f"[Main] Error seeding SEC data: {e}")
    
    try:
        print("\n[Main] Seeding Blockchain data...")
        blockchain_worker = BlockchainWorker()
        blockchain_worker.seed_initial_data()
    except Exception as e:
        print(f"[Main] Error seeding Blockchain data: {e}")
    
    try:
        print("\n[Main] Seeding News data...")
        news_worker = NewsWorker()
        news_worker.seed_initial_data()
    except Exception as e:
        print(f"[Main] Error seeding News data: {e}")
    
    try:
        print("\n[Main] Seeding Market data...")
        market_worker = MarketWorker()
        market_worker.seed_initial_data()
    except Exception as e:
        print(f"[Main] Error seeding Market data: {e}")
    
    print(f"\n{'='*60}")
    print("[Main] Initial data seeding complete!")
    print(f"{'='*60}\n")

def main():
    """Main function to run all workers on schedule"""
    print(f"\n{'='*60}")
    print("MicroTerm Data Factory Starting...")
    print(f"{'='*60}\n")
    
    # Seed initial data
    seed_all_data()
    
    # Schedule workers
    print("[Main] Scheduling workers...")
    schedule.every(config.SEC_WORKER_INTERVAL).seconds.do(run_sec_worker)
    schedule.every(config.BLOCKCHAIN_WORKER_INTERVAL).seconds.do(run_blockchain_worker)
    schedule.every(config.NEWS_WORKER_INTERVAL).seconds.do(run_news_worker)
    schedule.every(config.MARKET_WORKER_INTERVAL).seconds.do(run_market_worker)
    
    print(f"[Main] SEC Worker: Every {config.SEC_WORKER_INTERVAL}s")
    print(f"[Main] Blockchain Worker: Every {config.BLOCKCHAIN_WORKER_INTERVAL}s")
    print(f"[Main] News Worker: Every {config.NEWS_WORKER_INTERVAL}s")
    print(f"[Main] Market Worker: Every {config.MARKET_WORKER_INTERVAL}s")
    
    print(f"\n{'='*60}")
    print("[Main] Workers scheduled. Running continuously...")
    print("[Main] Press Ctrl+C to stop")
    print(f"{'='*60}\n")
    
    # Run all workers once immediately
    run_market_worker()
    time.sleep(2)
    run_news_worker()
    time.sleep(2)
    run_sec_worker()
    time.sleep(2)
    
    # Keep running scheduled tasks
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n[Main] Shutting down workers...")
        sys.exit(0)

if __name__ == '__main__':
    main()

