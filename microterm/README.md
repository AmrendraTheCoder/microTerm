# MicroTerm - Unbundled Financial Intelligence Terminal

MicroTerm is a pay-per-insight financial terminal powered by micro-payments on Base. Users pay only for the data they need using USDC, with no subscriptions required.

## Features

- **SEC Filings**: Access private market intelligence from Form D filings
- **Whale Alerts**: Track large cryptocurrency transfers in real-time
- **Market News**: Get AI-summarized crypto and financial news with sentiment analysis
- **Live Market Data**: Real-time prices for BTC, ETH, SOL, and major stocks
- **x402 Payment Protocol**: Pay-per-unlock using USDC on Base network
- **Wallet Integration**: Seamless connection with Coinbase Smart Wallet

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **OnchainKit** for wallet integration
- **Wagmi & Viem** for blockchain interactions

### Backend
- **Python 3.9+** for data workers
- **SQLite** for data storage (upgradeable to PostgreSQL)
- **Web3.py** for blockchain monitoring
- **yfinance** for market data
- **feedparser** for RSS feeds

### Blockchain
- **Base** (Ethereum L2) for fast, cheap transactions
- **USDC** as payment token
- **Smart Wallet** integration via OnchainKit

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Alchemy API key (for Base RPC)
- (Optional) OpenAI API key for enhanced news summaries

### Installation

1. **Clone the repository**

```bash
cd microterm
```

2. **Install frontend dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` in the `microterm` directory:

```env
NEXT_PUBLIC_ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_TREASURY_WALLET=0xYourTreasuryWalletAddress
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
DATABASE_URL=file:../data-factory/data/financial_data.db
```

4. **Set up Python backend**

```bash
cd ../data-factory
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` in the `data-factory` directory:

```env
DATABASE_PATH=./data/financial_data.db
ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
OPENAI_API_KEY=sk-... (optional)
SEC_USER_AGENT=MicroTerm admin@youremail.com
```

5. **Initialize database and seed data**

```bash
python workers/sec_worker.py
python workers/blockchain_worker.py
python workers/news_worker.py
python workers/market_worker.py
```

### Running the Application

1. **Start the data workers** (in one terminal):

```bash
cd data-factory
source venv/bin/activate
python main.py
```

2. **Start the Next.js dev server** (in another terminal):

```bash
cd microterm
npm run dev
```

3. **Open your browser** to `http://localhost:3000`

## Architecture

### Data Flow

1. **Python Workers** continuously fetch data from:
   - SEC EDGAR (Form D filings)
   - Base blockchain (whale transfers)
   - RSS feeds (crypto news)
   - Yahoo Finance (market data)

2. **SQLite Database** stores all collected data with premium flags

3. **Next.js API Routes** implement the x402 protocol:
   - Return 402 status for locked content
   - Verify USDC payments on-chain
   - Record unlocks in database
   - Serve full content after payment

4. **Frontend** displays blurred previews and handles payments via OnchainKit

### x402 Payment Protocol

The x402 protocol is a custom implementation inspired by HTTP 402 (Payment Required):

1. User clicks "Unlock" on blurred content
2. Payment modal shows cost and initiates USDC transfer
3. Transaction is sent to Base network
4. Backend verifies transaction on-chain
5. Content is unlocked and stored in user's unlock history

## Pricing

- **SEC Filing**: $0.50 USDC
- **Whale Alert**: $0.25 USDC
- **News Article**: $0.10 USDC
- **Market Data**: Free

## Deployment

### Frontend (Vercel)

```bash
cd microterm
vercel
```

Set environment variables in Vercel dashboard.

### Backend (Railway/DigitalOcean)

1. Push code to GitHub
2. Connect Railway to your repository
3. Set environment variables
4. Deploy Python workers

Alternatively, use Docker:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY data-factory/ .
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
```

## Development Roadmap

- [x] Phase 1: Foundation & Payment POC
- [x] Phase 2: Data Factory Backend
- [x] Phase 3: API Layer & Payment Verification
- [x] Phase 4: Frontend Terminal Interface
- [ ] Phase 5: Production Deployment
- [ ] Phase 6: Advanced Features (alerts, API access, subscriptions)

## Security Considerations

- Treasury wallet should use multi-sig (Gnosis Safe)
- Never expose private keys
- Always verify transactions on-chain server-side
- Rate limit API endpoints
- Validate all blockchain addresses

## Legal Disclaimer

MicroTerm displays publicly available financial data for informational purposes only. This is not investment advice. Always do your own research before making investment decisions.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open a GitHub issue or contact admin@microterm.io

---

Built with ❤️ using Base, OnchainKit, and Next.js

