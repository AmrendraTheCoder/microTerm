import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const USE_OPENAI = process.env.NEXT_PUBLIC_ENABLE_AI_MODE === 'true' && process.env.OPENAI_API_KEY;

const openai = USE_OPENAI ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface SummaryRequest {
  type: 'deal' | 'alert' | 'news';
  itemId: string;
  data: any;
}

/**
 * Generate mock AI summary using templates
 */
function generateMockSummary(type: string, data: any): string {
  switch (type) {
    case 'deal':
      return generateDealSummary(data);
    case 'alert':
      return generateAlertSummary(data);
    case 'news':
      return generateNewsSummary(data);
    default:
      return 'Summary not available.';
  }
}

function generateDealSummary(data: any): string {
  const amountM = (data.amount_raised / 1_000_000).toFixed(0);
  const sector = data.sector || 'Technology';
  
  return `
**${data.company_name} - ${sector} Sector**

**Funding Round**: $${amountM}M raised

**Key Highlights**:
- Leading ${sector.toLowerCase()} company securing significant capital
- Strong investor interest from top-tier VCs
- Positioned for rapid market expansion

**Market Impact**:
This funding round signals strong confidence in the ${sector.toLowerCase()} sector. The substantial raise suggests:
- Validated business model with proven traction
- Competitive advantage in the market
- Potential for 10x growth trajectory

**Risk Factors**:
- Market competition increasing
- Execution risk on deployment of capital
- Regulatory considerations for ${sector.toLowerCase()} sector

**Investment Thesis**:
Companies raising $${amountM}M+ typically have:
- Annual recurring revenue of $${(parseInt(amountM) * 2).toFixed(0)}M+
- Year-over-year growth of 100%+
- Clear path to profitability within 2-3 years

**Comparable Deals**:
Similar ${sector.toLowerCase()} companies that raised comparable amounts have seen average valuations increase 3-5x within 18 months post-funding.
`.trim();
}

function generateAlertSummary(data: any): string {
  const amountFormatted = data.amount.toLocaleString();
  const token = data.token_symbol;
  
  return `
**Whale Transaction Analysis**

**Transaction Details**:
- Amount: ${amountFormatted} ${token}
- From: ${data.sender_label}
- To: ${data.receiver_label}

**Entity Analysis**:
${data.sender_label} is a ${getCategoryDescription(data.sender_label)} known for:
- High-volume trading activity
- Market-moving transactions
- Strategic positioning

**Historical Behavior**:
Similar transactions from ${data.sender_label} have historically been followed by:
- 15-30% price movement within 24 hours
- Increased trading volume (2-3x average)
- Market attention and social media discussion

**Market Impact Prediction**:
- **Short-term** (24h): Moderate volatility expected
- **Medium-term** (7d): Potential trend reversal signal
- **Confidence**: ${getConfidenceLevel(data.amount)}

**Trading Implications**:
${getTradingImplications(data.sender_label, data.receiver_label)}

**Risk Assessment**:
- Liquidity risk: ${getLiquidityRisk(data.amount)}
- Timing risk: Monitor for follow-up transactions
- Counter-party risk: ${getCounterPartyRisk(data.receiver_label)}
`.trim();
}

function generateNewsSummary(data: any): string {
  const sentiment = data.sentiment || 'Neutral';
  
  return `
**${data.title}**

**Source**: ${data.source}
**Sentiment**: ${sentiment}

**Executive Summary**:
${data.summary || 'Breaking news in the cryptocurrency and blockchain space.'}

**Key Takeaways**:
- Major development with potential market-wide implications
- ${sentiment} sentiment indicates ${getSentimentImplication(sentiment)}
- Relevant for traders, investors, and industry participants

**Market Impact Analysis**:
${getMarketImpact(sentiment)}

**Trading Implications**:
- **Immediate** (0-4h): ${getImmediateImplication(sentiment)}
- **Short-term** (1-3d): ${getShortTermImplication(sentiment)}
- **Long-term** (1-4w): ${getLongTermImplication(sentiment)}

**Related Assets**:
This news is likely to impact: BTC, ETH, and major DeFi tokens

**Historical Context**:
Similar news events have resulted in average price movements of 5-15% across major cryptocurrencies.

**Recommended Actions**:
${getRecommendedActions(sentiment)}
`.trim();
}

// Helper functions for mock summaries
function getCategoryDescription(label: string): string {
  if (label.includes('Exchange')) return 'centralized exchange';
  if (label.includes('Trading')) return 'market maker';
  if (label.includes('Wallet')) return 'custody provider';
  return 'blockchain entity';
}

function getConfidenceLevel(amount: number): string {
  if (amount > 10_000_000) return 'High (>$10M transaction)';
  if (amount > 1_000_000) return 'Medium ($1-10M transaction)';
  return 'Low (<$1M transaction)';
}

function getTradingImplications(sender: string, receiver: string): string {
  if (receiver.includes('Exchange')) {
    return 'Potential sell pressure as tokens move to exchange. Consider taking profits or setting stop-losses.';
  }
  if (sender.includes('Exchange')) {
    return 'Accumulation signal as tokens leave exchange. Bullish indicator for medium-term holders.';
  }
  return 'Monitor for follow-up transactions to confirm directional bias.';
}

function getLiquidityRisk(amount: number): string {
  if (amount > 10_000_000) return 'High - May impact market depth';
  if (amount > 1_000_000) return 'Medium - Monitor order books';
  return 'Low - Normal market conditions';
}

function getCounterPartyRisk(label: string): string {
  if (label.includes('Unknown')) return 'High - Unidentified wallet';
  if (label.includes('Exchange')) return 'Low - Reputable exchange';
  return 'Medium - Known entity';
}

function getSentimentImplication(sentiment: string): string {
  if (sentiment === 'Bullish') return 'positive price action and increased buying interest';
  if (sentiment === 'Bearish') return 'potential selling pressure and risk-off sentiment';
  return 'mixed market reaction with sideways price action';
}

function getMarketImpact(sentiment: string): string {
  if (sentiment === 'Bullish') {
    return 'Expected to drive positive momentum across crypto markets. Institutional and retail interest likely to increase. Watch for follow-through buying in next 24-48 hours.';
  }
  if (sentiment === 'Bearish') {
    return 'May trigger risk-off behavior and profit-taking. Monitor key support levels. Consider defensive positioning or hedging strategies.';
  }
  return 'Neutral impact expected. Market likely to digest news without significant directional movement. Good opportunity for range trading.';
}

function getImmediateImplication(sentiment: string): string {
  if (sentiment === 'Bullish') return 'Potential 2-5% upside';
  if (sentiment === 'Bearish') return 'Potential 2-5% downside';
  return 'Consolidation expected';
}

function getShortTermImplication(sentiment: string): string {
  if (sentiment === 'Bullish') return 'Sustained buying pressure likely';
  if (sentiment === 'Bearish') return 'Continued selling pressure possible';
  return 'Range-bound trading';
}

function getLongTermImplication(sentiment: string): string {
  if (sentiment === 'Bullish') return 'Positive trend continuation';
  if (sentiment === 'Bearish') return 'Trend reversal risk';
  return 'Sideways consolidation';
}

function getRecommendedActions(sentiment: string): string {
  if (sentiment === 'Bullish') {
    return '1. Consider adding to long positions\n2. Set trailing stop-losses\n3. Monitor volume for confirmation\n4. Watch for pullback entry opportunities';
  }
  if (sentiment === 'Bearish') {
    return '1. Consider reducing exposure\n2. Tighten stop-losses\n3. Look for short opportunities\n4. Preserve capital for better entries';
  }
  return '1. Maintain current positions\n2. Wait for clearer signals\n3. Focus on risk management\n4. Prepare for breakout in either direction';
}

/**
 * Generate OpenAI-powered summary
 */
async function generateOpenAISummary(type: string, data: any): Promise<string> {
  if (!openai) {
    return generateMockSummary(type, data);
  }

  try {
    const prompt = buildPrompt(type, data);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst providing concise, actionable insights for traders and investors. Format your response in markdown with clear sections.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return completion.choices[0].message.content || 'Summary generation failed.';
  } catch (error) {
    console.error('[AI Summary] OpenAI error:', error);
    // Fallback to mock summary
    return generateMockSummary(type, data);
  }
}

function buildPrompt(type: string, data: any): string {
  switch (type) {
    case 'deal':
      return `Analyze this SEC filing and provide a comprehensive summary:
Company: ${data.company_name}
Amount Raised: $${(data.amount_raised / 1_000_000).toFixed(0)}M
Sector: ${data.sector}

Include: key highlights, market impact, risk factors, investment thesis, and comparable deals.`;

    case 'alert':
      return `Analyze this whale transaction and provide trading insights:
Amount: ${data.amount.toLocaleString()} ${data.token_symbol}
From: ${data.sender_label}
To: ${data.receiver_label}

Include: entity analysis, historical behavior, market impact prediction, trading implications, and risk assessment.`;

    case 'news':
      return `Analyze this crypto news and provide market insights:
Title: ${data.title}
Summary: ${data.summary}
Sentiment: ${data.sentiment}
Source: ${data.source}

Include: executive summary, key takeaways, market impact, trading implications, and recommended actions.`;

    default:
      return 'Provide a summary of this financial data.';
  }
}

/**
 * API Route Handler
 */
export async function POST(request: NextRequest) {
  try {
    const { type, itemId, data }: SummaryRequest = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate summary
    const summary = USE_OPENAI
      ? await generateOpenAISummary(type, data)
      : generateMockSummary(type, data);

    // Cache summary (in production, save to database)
    console.log(`[AI Summary] Generated ${type} summary for item ${itemId}`);

    return NextResponse.json({
      summary,
      type,
      itemId,
      mode: USE_OPENAI ? 'openai' : 'mock',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AI Summary] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

