# MicroTerm 🚀

**The Unbundled Financial Intelligence Terminal**

MicroTerm is a pay-per-insight financial terminal powered by micro-payments on Base. No subscriptions, no commitments—just pay for the data you need using USDC.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![Base](https://img.shields.io/badge/Base-L2-blue)

## ✨ Features

- 📊 **SEC Filings**: Access private market intelligence from Form D filings ($0.50)
- 🐋 **Whale Alerts**: Track large cryptocurrency transfers in real-time ($0.25)
- 📰 **Market News**: AI-summarized crypto and financial news with sentiment ($0.10)
- 💹 **Live Market Data**: Real-time prices for BTC, ETH, SOL, and major stocks (FREE)
- 💳 **x402 Protocol**: Pay-per-unlock using USDC on Base network
- 🔐 **Wallet Integration**: Seamless connection with Coinbase Smart Wallet

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+

### One-Command Start

```bash
./start.sh
```

Then open http://localhost:3000

### Manual Setup

```bash
# Install frontend
cd microterm
npm install

# Install backend
cd ../data-factory
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Seed database
python workers/sec_worker.py
python workers/blockchain_worker.py
python workers/news_worker.py
python workers/market_worker.py

# Start backend
python main.py

# Start frontend (in new terminal)
cd ../microterm
npm run dev
```

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
- **[INDEX.md](INDEX.md)** - Complete documentation index
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Implementation details
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[TESTING.md](TESTING.md)** - Testing guide

## 🏗️ Architecture

```
User Browser
    ↓
Next.js Frontend (React + OnchainKit)
    ↓
Next.js API Routes (x402 Protocol)
    ↓
SQLite Database ← Python Workers
                      ↓
                  External APIs
                  (SEC, Base, RSS, Yahoo)
```

## 🛠️ Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- OnchainKit + Wagmi + Viem

**Backend**
- Python 3.9+
- SQLite (upgradeable to PostgreSQL)
- feedparser, web3.py, yfinance

**Blockchain**
- Base (Ethereum L2)
- USDC payments
- Coinbase Smart Wallet

## 💰 Pricing

| Content Type | Cost | Description |
|-------------|------|-------------|
| SEC Filing | $0.50 USDC | Full deal details, investors, valuation |
| Whale Alert | $0.25 USDC | Complete transaction info, labeled addresses |
| News Article | $0.10 USDC | Full summary, sentiment, impact analysis |
| Market Data | FREE | Live prices, 24h changes, volume |

## 🎯 Key Features

### x402 Payment Protocol

Custom HTTP 402 implementation for pay-per-content:
1. User clicks "Unlock" on blurred content
2. Payment modal shows cost in USDC
3. Transaction sent to Base network
4. Backend verifies transaction on-chain
5. Content unlocks instantly

### Data Sources

- **SEC EDGAR**: Form D private market filings
- **Base Blockchain**: Whale transfer monitoring
- **RSS Feeds**: CoinDesk, Cointelegraph
- **Yahoo Finance**: Live market data

### Real-time Updates

- Ticker tape updates every 30 seconds
- Server-Sent Events for live alerts
- Background workers refresh data continuously

## 📸 Screenshots

```
┌─────────────────────────────────────────────────┐
│  MICROTERM  |  Connect Wallet                   │
├─────────────────────────────────────────────────┤
│  $BTC: 64,234 ↑2.5%  $ETH: 3,456 ↓1.2%  ...    │
├─────────────────────────────────────────────────┤
│                    │                             │
│   SEC Filings      │     Whale Alerts            │
│   [Blurred Cards]  │     [Blurred Cards]         │
│                    │                             │
│   Market News      │                             │
│   [Blurred Cards]  │                             │
└─────────────────────────────────────────────────┘
```

## 🚢 Deployment

### Quick Deploy

**Frontend (Vercel)**
```bash
cd microterm
vercel
```

**Backend (Railway)**
- Connect GitHub repository
- Add environment variables
- Deploy automatically

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

```bash
# Run all tests
npm test

# Test payment flow on testnet
# See TESTING.md for complete guide
```

## 🔐 Environment Variables

### Frontend (`microterm/.env.local`)

```env
NEXT_PUBLIC_ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_TREASURY_WALLET=0xYourWallet
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### Backend (`data-factory/.env`)

```env
DATABASE_PATH=./data/financial_data.db
ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
SEC_USER_AGENT=MicroTerm admin@youremail.com
OPENAI_API_KEY=sk-... (optional)
```

## 📊 Project Status

- ✅ Core functionality complete
- ✅ Payment flow tested
- ✅ Data workers operational
- ✅ API routes implemented
- ✅ Frontend UI polished
- ✅ Documentation complete
- 🚧 Production deployment pending
- 🚧 Security audit recommended

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [OnchainKit](https://onchainkit.xyz) by Coinbase
- Powered by [Base](https://base.org) L2
- Inspired by Bloomberg Terminal

## 📞 Support

- 📖 Documentation: [INDEX.md](INDEX.md)
- 🐛 Issues: [GitHub Issues](https://github.com/AmrendraTheCoder/microterm/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/AmrendraTheCoder/microterm/discussions)

## 🎯 Roadmap

- [x] Core payment flow
- [x] Data aggregation
- [x] Terminal UI
- [ ] User accounts
- [ ] Subscription tier
- [ ] Mobile app
- [ ] API access
- [ ] Custom alerts
- [ ] Advanced analytics

## ⚖️ Legal Disclaimer

MicroTerm displays publicly available financial data for informational purposes only. This is not investment advice. Always do your own research before making investment decisions.

---

**Built with ❤️ using Base, OnchainKit, and Next.js**

[Get Started](QUICKSTART.md) | [Documentation](INDEX.md) | [Deploy](DEPLOYMENT.md)

