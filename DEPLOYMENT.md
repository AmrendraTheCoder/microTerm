# MicroTerm Deployment Guide

This guide covers deploying MicroTerm to production.

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway/DigitalOcean account (for backend)
- Alchemy API key
- Base wallet with USDC for testing
- Domain name (optional)

## Part 1: Deploy Python Backend

### Option A: Railway (Recommended)

1. **Push code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/microterm.git
git push -u origin main
```

2. **Create Railway project**

- Go to https://railway.app
- Click "New Project" → "Deploy from GitHub repo"
- Select your microterm repository
- Railway will auto-detect Python

3. **Configure Railway**

Create `railway.json` in `data-factory/`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python main.py",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

4. **Set environment variables**

In Railway dashboard, add:
- `DATABASE_PATH=/app/data/financial_data.db`
- `ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY`
- `SEC_USER_AGENT=MicroTerm admin@youremail.com`
- `OPENAI_API_KEY=sk-...` (optional)

5. **Add persistent volume**

- Go to Settings → Volumes
- Add volume: `/app/data` (to persist database)

6. **Deploy**

Railway will automatically deploy. Check logs for any errors.

### Option B: DigitalOcean Droplet

1. **Create Droplet**

- Ubuntu 22.04 LTS
- Basic plan ($6/month)
- Add SSH key

2. **SSH into droplet**

```bash
ssh root@your-droplet-ip
```

3. **Install dependencies**

```bash
apt update && apt upgrade -y
apt install python3 python3-pip python3-venv supervisor -y
```

4. **Clone repository**

```bash
cd /opt
git clone https://github.com/yourusername/microterm.git
cd microterm/data-factory
```

5. **Set up Python environment**

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

6. **Create .env file**

```bash
nano .env
```

Add your environment variables.

7. **Configure Supervisor**

```bash
nano /etc/supervisor/conf.d/microterm.conf
```

Add:

```ini
[program:microterm-workers]
command=/opt/microterm/data-factory/venv/bin/python /opt/microterm/data-factory/main.py
directory=/opt/microterm/data-factory
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/microterm/err.log
stdout_logfile=/var/log/microterm/out.log
environment=PATH="/opt/microterm/data-factory/venv/bin"
```

8. **Start workers**

```bash
mkdir -p /var/log/microterm
supervisorctl reread
supervisorctl update
supervisorctl start microterm-workers
```

9. **Check status**

```bash
supervisorctl status
tail -f /var/log/microterm/out.log
```

## Part 2: Deploy Frontend to Vercel

1. **Install Vercel CLI**

```bash
npm i -g vercel
```

2. **Login to Vercel**

```bash
vercel login
```

3. **Deploy**

```bash
cd microterm
vercel
```

Follow the prompts:
- Set up and deploy? Yes
- Which scope? Your account
- Link to existing project? No
- Project name? microterm
- Directory? ./
- Override settings? No

4. **Set environment variables**

In Vercel dashboard (Settings → Environment Variables):

```
NEXT_PUBLIC_ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_TREASURY_WALLET=0xYourWalletAddress
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
DATABASE_URL=file:../data-factory/data/financial_data.db
```

**Important**: For production, you'll need to:
- Use PostgreSQL instead of SQLite (Vercel is serverless)
- Or connect to Railway's database via network

5. **Redeploy**

```bash
vercel --prod
```

## Part 3: Database Migration (SQLite → PostgreSQL)

For production, migrate to PostgreSQL:

1. **Create PostgreSQL database** (Railway, Supabase, or Neon)

2. **Update Python code** to use PostgreSQL:

```python
# In database/models.py
import psycopg2
from psycopg2.extras import RealDictCursor

class Database:
    def __init__(self, db_url: str = config.DATABASE_URL):
        self.db_url = db_url
        self.conn = psycopg2.connect(db_url)
```

3. **Update schema** for PostgreSQL syntax:

```sql
-- Use SERIAL instead of AUTOINCREMENT
-- Use TIMESTAMP instead of DATETIME
```

4. **Migrate data**:

```bash
# Export from SQLite
sqlite3 financial_data.db .dump > dump.sql

# Import to PostgreSQL (after adapting SQL)
psql $DATABASE_URL < dump.sql
```

## Part 4: Custom Domain (Optional)

1. **Add domain in Vercel**

- Go to Settings → Domains
- Add your domain
- Update DNS records as instructed

2. **SSL Certificate**

Vercel automatically provisions SSL certificates.

## Part 5: Monitoring & Maintenance

### Set up monitoring

1. **Vercel Analytics**

Enable in Vercel dashboard (free tier available).

2. **Railway Logs**

Monitor worker health in Railway dashboard.

3. **Uptime monitoring**

Use UptimeRobot or similar to monitor:
- Frontend: https://microterm.vercel.app
- API health: https://microterm.vercel.app/api/market

### Database backups

**For SQLite on Railway:**

```bash
# In Railway, add a cron job
0 0 * * * cp /app/data/financial_data.db /app/data/backup-$(date +\%Y\%m\%d).db
```

**For PostgreSQL:**

Most providers (Railway, Supabase) have automatic backups.

### Update workers

```bash
# SSH into droplet or use Railway CLI
cd /opt/microterm
git pull
supervisorctl restart microterm-workers
```

## Part 6: Testing Production

1. **Test wallet connection**

- Visit your production URL
- Click "Connect Wallet"
- Ensure Coinbase Wallet connects

2. **Test payment flow**

- Use Base Sepolia testnet first
- Get testnet USDC from faucet
- Try unlocking content
- Verify transaction on BaseScan

3. **Test data freshness**

- Check that workers are running
- Verify new data appears in dashboard
- Monitor logs for errors

## Troubleshooting

### Workers not running

```bash
# Check supervisor status
supervisorctl status

# Check logs
tail -f /var/log/microterm/err.log

# Restart
supervisorctl restart microterm-workers
```

### Database connection errors

- Verify DATABASE_URL is correct
- Check file permissions (SQLite)
- Test connection manually:

```python
import sqlite3
conn = sqlite3.connect('/path/to/db')
print(conn.execute('SELECT COUNT(*) FROM private_deals').fetchone())
```

### API errors in production

- Check Vercel logs
- Verify environment variables
- Test API endpoints directly:

```bash
curl https://your-domain.vercel.app/api/market
```

### Payment verification fails

- Verify Alchemy API key is correct
- Check USDC contract address
- Ensure treasury wallet address is set
- Test on testnet first

## Security Checklist

- [ ] Treasury wallet uses multi-sig
- [ ] All API keys in environment variables
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Database backups automated
- [ ] Monitoring alerts set up
- [ ] SSL certificate active
- [ ] Workers restart on failure

## Cost Estimate

### Minimum viable production:

- **Railway**: $5-10/month (workers + database)
- **Vercel**: Free tier (upgrade to Pro $20/month for production)
- **Alchemy**: Free tier (300M compute units/month)
- **Domain**: $10-15/year (optional)

**Total**: ~$5-30/month depending on traffic

### At scale (1000+ users):

- **Railway**: $20-50/month
- **Vercel Pro**: $20/month
- **Alchemy Growth**: $49/month
- **PostgreSQL**: $10-25/month

**Total**: ~$100-150/month

## Next Steps

1. Deploy to testnet first
2. Test all features thoroughly
3. Get feedback from beta users
4. Deploy to mainnet
5. Monitor and iterate

## Support

For deployment issues:
- Check Vercel docs: https://vercel.com/docs
- Check Railway docs: https://docs.railway.app
- Open GitHub issue: https://github.com/yourusername/microterm/issues

---

Good luck with your deployment! 🚀

