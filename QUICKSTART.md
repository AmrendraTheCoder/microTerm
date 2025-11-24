# MicroTerm Quick Start Guide

Get MicroTerm running in 5 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- Python 3.9+ ([Download](https://python.org))
- Git (optional)

## Option 1: Automated Start (Recommended)

```bash
cd /Users/amrendravikramsingh/Desktop/microTerm
./start.sh
```

This script will:
1. Check prerequisites
2. Install dependencies
3. Seed database
4. Start backend workers
5. Start frontend server

Then open http://localhost:3000 in your browser!

## Option 2: Manual Start

### Step 1: Install Frontend Dependencies

```bash
cd microterm
npm install
```

### Step 2: Install Backend Dependencies

```bash
cd ../data-factory
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Seed Database

```bash
python workers/sec_worker.py
python workers/blockchain_worker.py
python workers/news_worker.py
python workers/market_worker.py
```

### Step 4: Start Backend (Terminal 1)

```bash
python main.py
```

### Step 5: Start Frontend (Terminal 2)

```bash
cd ../microterm
npm run dev
```

### Step 6: Open Browser

Visit http://localhost:3000

## Configuration (Optional)

For full functionality, create environment files:

### Frontend: `microterm/.env.local`

```env
NEXT_PUBLIC_ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_TREASURY_WALLET=0xYourWallet
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
DATABASE_URL=file:../data-factory/data/financial_data.db
```

### Backend: `data-factory/.env`

```env
DATABASE_PATH=./data/financial_data.db
ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
SEC_USER_AGENT=MicroTerm admin@youremail.com
OPENAI_API_KEY=sk-... (optional)
```

## Getting API Keys

### Alchemy (Required for payments)

1. Go to https://www.alchemy.com
2. Sign up for free account
3. Create new app on Base network
4. Copy API key

### OpenAI (Optional for better summaries)

1. Go to https://platform.openai.com
2. Create API key
3. Add to backend .env

## Testing Payments

### Get Testnet Funds

1. Switch to Base Sepolia testnet
2. Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
3. Get testnet USDC from faucet

### Test Unlock Flow

1. Connect wallet
2. Click "Unlock" on any card
3. Approve USDC payment
4. Content unlocks after confirmation

## Troubleshooting

### "Module not found" errors

```bash
cd microterm
npm install
```

### "Database locked" errors

Only one process can write to SQLite. Stop any running workers and restart.

### "Connection refused" errors

Make sure both frontend and backend are running.

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Next Steps

1. ✅ Explore the UI
2. ✅ Connect your wallet
3. ✅ Try unlocking content
4. ✅ Check the documentation
5. ✅ Deploy to production (see DEPLOYMENT.md)

## Need Help?

- 📖 Full documentation: README.md
- 🚀 Deployment guide: DEPLOYMENT.md
- 🧪 Testing guide: TESTING.md
- 📊 Project summary: PROJECT_SUMMARY.md

---

Enjoy using MicroTerm! 🎉

