import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 
               path.join(process.cwd(), '../data-factory/data/financial_data.db');

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    try {
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }
  return db;
}

export interface Deal {
  id: number;
  company_name: string;
  amount_raised: number;
  filing_url: string;
  sector: string;
  filed_at: string;
  is_premium: number;
  created_at: string;
}

export interface WhaleAlert {
  id: number;
  tx_hash: string;
  sender_address: string;
  sender_label: string;
  receiver_address: string;
  receiver_label: string;
  token_symbol: string;
  amount: number;
  timestamp: string;
  is_premium: number;
  created_at: string;
}

export interface News {
  id: number;
  title: string;
  summary: string;
  sentiment: string;
  source: string;
  url: string;
  published_at: string;
  is_premium: number;
  created_at: string;
}

export interface MarketData {
  id: number;
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  updated_at: string;
}

export interface UserUnlock {
  id: number;
  user_wallet: string;
  item_type: string;
  item_id: number;
  tx_hash: string;
  amount_paid: number;
  unlocked_at: string;
}

