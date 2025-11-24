# MicroTerm Data Factory

Python-based data collection workers for MicroTerm.

## Workers

- **SEC Worker**: Fetches Form D filings from SEC EDGAR
- **Blockchain Worker**: Monitors whale transfers on Base
- **News Worker**: Aggregates crypto news from RSS feeds
- **Market Worker**: Fetches live market data from Yahoo Finance

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuration

Create `.env` file:

```env
DATABASE_PATH=./data/financial_data.db
ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
OPENAI_API_KEY=sk-... (optional)
SEC_USER_AGENT=MicroTerm admin@youremail.com
```

## Running

### Run all workers:

```bash
python main.py
```

### Run individual workers:

```bash
python workers/sec_worker.py
python workers/blockchain_worker.py
python workers/news_worker.py
python workers/market_worker.py
```

## Database Schema

See `database/models.py` for full schema.

Tables:
- `private_deals` - SEC Form D filings
- `whale_alerts` - Large crypto transfers
- `news` - Aggregated news articles
- `market_data` - Live market prices
- `user_unlocks` - Payment records
- `known_addresses` - Labeled blockchain addresses

## Worker Intervals

- SEC: Every 10 minutes
- Blockchain: Every 30 seconds
- News: Every 5 minutes
- Market: Every 60 seconds

## Troubleshooting

### Rate limiting errors

Yahoo Finance and some RSS feeds may rate limit. The workers handle this gracefully and will retry on the next interval.

### Database locked errors

If using SQLite, ensure only one process writes at a time. Consider upgrading to PostgreSQL for production.

### Missing data

Check worker logs for errors. Verify API keys and network connectivity.

