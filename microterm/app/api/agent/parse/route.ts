import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Toggle between mock and OpenAI modes
const USE_OPENAI = process.env.NEXT_PUBLIC_ENABLE_AI_MODE === 'true' && process.env.OPENAI_API_KEY;

const openai = USE_OPENAI ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface ParsedCommand {
  action: 'auto_unlock' | 'swap' | 'summarize' | 'show_status' | 'unlock' | 'unknown';
  filter?: {
    type?: 'deal' | 'alert' | 'news';
    minAmount?: number;
    sector?: string;
    keyword?: string;
  };
  itemType?: string;
  itemId?: string;
  token?: string;
  amount?: number;
  cost?: number;
  maxCost?: number;
}

// Mock AI parser using keyword matching
function mockParse(command: string): ParsedCommand {
  const lower = command.toLowerCase();

  // Auto-unlock patterns
  if (lower.includes('auto') || lower.includes('unlock all')) {
    const result: ParsedCommand = {
      action: 'auto_unlock',
      filter: {},
      maxCost: 1.0,
    };

    // Detect content type
    if (lower.includes('deal')) result.filter!.type = 'deal';
    else if (lower.includes('alert') || lower.includes('whale')) result.filter!.type = 'alert';
    else if (lower.includes('news')) result.filter!.type = 'news';

    // Detect amount filter
    const amountMatch = lower.match(/(\$|over |above )(\d+)([km])?/i);
    if (amountMatch) {
      let amount = parseInt(amountMatch[2]);
      if (amountMatch[3] === 'k') amount *= 1000;
      if (amountMatch[3] === 'm') amount *= 1000000;
      result.filter!.minAmount = amount;
    }

    // Detect sector
    if (lower.includes('ai')) result.filter!.sector = 'AI';
    else if (lower.includes('fintech')) result.filter!.sector = 'Fintech';
    else if (lower.includes('crypto')) result.filter!.sector = 'Crypto';

    // Detect source for whale alerts
    if (lower.includes('binance')) result.filter!.keyword = 'Binance';
    else if (lower.includes('coinbase')) result.filter!.keyword = 'Coinbase';

    return result;
  }

  // Copy trade / swap patterns
  if (lower.includes('copy') || lower.includes('buy') || lower.includes('swap')) {
    const result: ParsedCommand = {
      action: 'swap',
    };

    // Detect token
    if (lower.includes('eth')) result.token = 'ETH';
    else if (lower.includes('usdc')) result.token = 'USDC';
    else if (lower.includes('btc')) result.token = 'BTC';

    // Detect amount
    const amountMatch = lower.match(/(\d+\.?\d*)\s*(eth|usdc|btc)/i);
    if (amountMatch) {
      result.amount = parseFloat(amountMatch[1]);
    }

    // If "last whale trade", we'd fetch the latest alert
    if (lower.includes('last') || lower.includes('latest')) {
      result.itemType = 'alert';
      result.itemId = 'latest';
    }

    return result;
  }

  // Summarize patterns
  if (lower.includes('summarize') || lower.includes('summary') || lower.includes('analyze')) {
    const result: ParsedCommand = {
      action: 'summarize',
    };

    if (lower.includes('deal')) result.itemType = 'deal';
    else if (lower.includes('alert')) result.itemType = 'alert';
    else if (lower.includes('news')) result.itemType = 'news';

    if (lower.includes('latest') || lower.includes('last')) {
      result.itemId = 'latest';
    }

    return result;
  }

  // Show status patterns
  if (lower.includes('status') || lower.includes('balance') || lower.includes('show agent')) {
    return { action: 'show_status' };
  }

  // Direct unlock patterns
  if (lower.includes('unlock') && !lower.includes('auto')) {
    const result: ParsedCommand = {
      action: 'unlock',
      cost: 0.50, // Default cost
    };

    if (lower.includes('deal')) {
      result.itemType = 'deal';
      result.cost = 0.50;
    } else if (lower.includes('alert')) {
      result.itemType = 'alert';
      result.cost = 0.25;
    } else if (lower.includes('news')) {
      result.itemType = 'news';
      result.cost = 0.10;
    }

    return result;
  }

  return { action: 'unknown' };
}

// OpenAI-powered parser using function calling
async function openaiParse(command: string): Promise<ParsedCommand> {
  if (!openai) {
    return mockParse(command);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for MicroTerm, a financial intelligence terminal. 
Parse user commands into structured actions. Available actions:
- auto_unlock: Set up automatic unlocking of content based on filters
- swap: Execute a token swap (copy trading)
- summarize: Generate AI summary of content
- show_status: Display agent status
- unlock: Unlock specific content

Content types: deal (SEC filings), alert (whale transactions), news (market news)
Pricing: deals=$0.50, alerts=$0.25, news=$0.10`,
        },
        {
          role: 'user',
          content: command,
        },
      ],
      functions: [
        {
          name: 'parse_command',
          description: 'Parse a user command into a structured action',
          parameters: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['auto_unlock', 'swap', 'summarize', 'show_status', 'unlock', 'unknown'],
              },
              filter: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['deal', 'alert', 'news'] },
                  minAmount: { type: 'number' },
                  sector: { type: 'string' },
                  keyword: { type: 'string' },
                },
              },
              itemType: { type: 'string' },
              itemId: { type: 'string' },
              token: { type: 'string' },
              amount: { type: 'number' },
              cost: { type: 'number' },
              maxCost: { type: 'number' },
            },
            required: ['action'],
          },
        },
      ],
      function_call: { name: 'parse_command' },
    });

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall && functionCall.arguments) {
      return JSON.parse(functionCall.arguments);
    }

    return { action: 'unknown' };
  } catch (error) {
    console.error('OpenAI parsing error:', error);
    // Fallback to mock parser
    return mockParse(command);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { command, userWallet } = await request.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Invalid command' },
        { status: 400 }
      );
    }

    // Parse the command
    const parsed = USE_OPENAI
      ? await openaiParse(command)
      : mockParse(command);

    // Log the command (optional - could save to database)
    console.log(`[Agent] User ${userWallet} command: "${command}" → ${parsed.action}`);

    return NextResponse.json({
      ...parsed,
      mode: USE_OPENAI ? 'openai' : 'mock',
      originalCommand: command,
    });
  } catch (error) {
    console.error('Command parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse command' },
      { status: 500 }
    );
  }
}

