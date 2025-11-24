# MicroTerm Testing Guide

This guide covers testing the complete MicroTerm system from data ingestion to payment verification.

## Prerequisites

- Both frontend and backend running
- Test wallet with Base Sepolia testnet USDC
- Alchemy API key configured

## Test Environment Setup

### 1. Get Testnet USDC

1. Visit Base Sepolia faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Connect your wallet
3. Request testnet ETH (for gas)
4. Bridge to get testnet USDC or use a USDC faucet

### 2. Configure for Testnet

In `microterm/.env.local`:

```env
NEXT_PUBLIC_ALCHEMY_BASE_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_BASE_CHAIN_ID=84532
NEXT_PUBLIC_TREASURY_WALLET=0xYourTestWallet
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

## Testing Checklist

### Phase 1: Data Ingestion

**Test SEC Worker**

```bash
cd data-factory
source venv/bin/activate
python workers/sec_worker.py
```

✅ Expected output:
- "Seeded: Anthropic"
- "Seeded: Stripe"
- Database file created at `data/financial_data.db`

**Verify in database:**

```bash
sqlite3 data/financial_data.db "SELECT COUNT(*) FROM private_deals;"
```

Should return at least 5 deals.

**Test Blockchain Worker**

```bash
python workers/blockchain_worker.py
```

✅ Expected output:
- "Seeded: Wintermute Trading → Binance Hot Wallet"
- Known addresses inserted

**Test News Worker**

```bash
python workers/news_worker.py
```

✅ Expected output:
- "Seeded: SEC Approves Bitcoin ETF"
- News articles fetched from RSS feeds

**Test Market Worker**

```bash
python workers/market_worker.py
```

✅ Expected output:
- "Seeded: BTC"
- Market data for 5 symbols

### Phase 2: API Endpoints

**Start Next.js dev server:**

```bash
cd microterm
npm run dev
```

**Test Market Data API (Free)**

```bash
curl http://localhost:3000/api/market
```

✅ Expected: JSON array with market data

**Test Deals API**

```bash
curl http://localhost:3000/api/deals
```

✅ Expected: JSON array with deals

**Test Single Deal (Locked)**

```bash
curl http://localhost:3000/api/deals/1
```

✅ Expected: 402 status with payment info

**Test Alerts API**

```bash
curl http://localhost:3000/api/alerts
```

✅ Expected: JSON array with whale alerts

**Test News API**

```bash
curl http://localhost:3000/api/news
```

✅ Expected: JSON array with news articles

### Phase 3: Frontend UI

**Open browser to http://localhost:3000**

✅ Checklist:
- [ ] Page loads without errors
- [ ] Ticker tape shows market data
- [ ] SEC filings section displays cards
- [ ] Whale alerts section displays cards
- [ ] News section displays cards
- [ ] All cards show blurred content
- [ ] "Unlock" buttons visible
- [ ] Wallet connect button in header

### Phase 4: Wallet Connection

**Test Wallet Connection**

1. Click "Connect Wallet" button
2. Select Coinbase Wallet
3. Approve connection

✅ Expected:
- Wallet connects successfully
- Address displayed in header
- Can disconnect and reconnect

### Phase 5: Payment Flow (Critical)

**Test SEC Filing Unlock ($0.50)**

1. Click "Unlock" on a SEC filing card
2. Payment modal appears
3. Shows cost: $0.50 USDC
4. Click "Pay with USDC"
5. Approve transaction in wallet

✅ Expected:
- Transaction submitted to Base Sepolia
- Transaction hash displayed
- Content unblurs after confirmation
- Can view full deal details

**Verify on BaseScan:**

Visit: https://sepolia.basescan.org/tx/[YOUR_TX_HASH]

✅ Check:
- Transaction succeeded
- USDC transferred to treasury wallet
- Amount matches ($0.50 = 500000 in USDC units)

**Test Whale Alert Unlock ($0.25)**

Repeat process for whale alert.

✅ Expected:
- Payment of $0.25 USDC
- Content unlocks
- Full transaction details visible

**Test News Unlock ($0.10)**

Repeat process for news article.

✅ Expected:
- Payment of $0.10 USDC
- Full summary and analysis visible

### Phase 6: Backend Verification

**Check user_unlocks table:**

```bash
sqlite3 data/financial_data.db "SELECT * FROM user_unlocks;"
```

✅ Expected:
- Rows for each unlock
- Correct wallet address
- Correct transaction hash
- Correct amount paid

**Test Duplicate Prevention**

Try unlocking the same item again.

✅ Expected:
- Content already unlocked (no payment required)
- OR payment modal shows but backend rejects duplicate

### Phase 7: Real-Time Updates

**Test Ticker Tape Updates**

1. Watch ticker tape for 30 seconds
2. Data should refresh

✅ Expected:
- Market data updates automatically
- No page refresh needed

**Test SSE Stream (if implemented)**

Open browser console and check Network tab for `/api/stream`.

✅ Expected:
- EventSource connection established
- Periodic updates received

### Phase 8: Error Handling

**Test Invalid Transaction**

1. Try to unlock content
2. Cancel transaction in wallet

✅ Expected:
- Error message displayed
- Content remains locked
- No unlock recorded

**Test Insufficient Funds**

1. Empty wallet of USDC
2. Try to unlock content

✅ Expected:
- Transaction fails
- Error message shown
- Content remains locked

**Test Network Issues**

1. Disconnect internet
2. Try to load page

✅ Expected:
- Graceful error handling
- Offline message or cached data

### Phase 9: Performance

**Test Page Load Time**

Use browser DevTools Performance tab.

✅ Target:
- Initial load < 2 seconds
- Time to Interactive < 3 seconds

**Test API Response Time**

```bash
time curl http://localhost:3000/api/deals
```

✅ Target:
- Response time < 500ms

**Test Database Query Performance**

```bash
sqlite3 data/financial_data.db ".timer on" "SELECT * FROM private_deals ORDER BY filed_at DESC LIMIT 10;"
```

✅ Target:
- Query time < 50ms

### Phase 10: Security

**Test SQL Injection**

```bash
curl "http://localhost:3000/api/deals/1'; DROP TABLE private_deals;--"
```

✅ Expected:
- No SQL injection possible
- Proper error handling

**Test XSS**

Try entering `<script>alert('xss')</script>` in any input.

✅ Expected:
- Script not executed
- Content properly escaped

**Test CORS**

```bash
curl -H "Origin: http://evil.com" http://localhost:3000/api/deals
```

✅ Expected:
- CORS headers properly configured
- Only allowed origins accepted

## Automated Testing

### Unit Tests (Future)

```bash
# Frontend
npm test

# Backend
pytest
```

### Integration Tests

Create `tests/integration.test.ts`:

```typescript
describe('Payment Flow', () => {
  it('should unlock content after payment', async () => {
    // Test implementation
  });
});
```

## Common Issues

### Issue: "Database locked"

**Solution**: Ensure only one process writes to SQLite. Use PostgreSQL for production.

### Issue: "Transaction verification failed"

**Solution**: 
- Check Alchemy API key
- Verify USDC contract address
- Ensure transaction succeeded on-chain

### Issue: "Wallet won't connect"

**Solution**:
- Clear browser cache
- Try different wallet (MetaMask, Coinbase)
- Check network configuration

### Issue: "Content won't unlock after payment"

**Solution**:
- Check browser console for errors
- Verify transaction on BaseScan
- Check backend logs
- Manually verify in database

## Test Results Template

```
Date: ___________
Tester: ___________

✅ Data Ingestion
  ✅ SEC Worker
  ✅ Blockchain Worker
  ✅ News Worker
  ✅ Market Worker

✅ API Endpoints
  ✅ /api/market
  ✅ /api/deals
  ✅ /api/alerts
  ✅ /api/news

✅ Frontend UI
  ✅ Page loads
  ✅ Components render
  ✅ Blurred content
  ✅ Wallet connection

✅ Payment Flow
  ✅ SEC unlock ($0.50)
  ✅ Alert unlock ($0.25)
  ✅ News unlock ($0.10)
  ✅ Transaction verification
  ✅ Database recording

✅ Error Handling
  ✅ Invalid transactions
  ✅ Network errors
  ✅ Duplicate unlocks

Notes:
_______________________
_______________________
```

## Next Steps After Testing

1. Fix any bugs found
2. Optimize performance bottlenecks
3. Add more comprehensive error handling
4. Implement analytics
5. Deploy to production
6. Monitor and iterate

## Production Testing

Before mainnet launch:

1. Test on Base Sepolia for at least 24 hours
2. Perform 10+ successful unlocks
3. Verify all transactions on-chain
4. Test with multiple wallets
5. Load test with 100+ concurrent users
6. Security audit (recommended)

---

Happy testing! Report issues to GitHub or admin@microterm.io

