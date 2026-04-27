import { Transaction, Category } from './store';

interface ParsedSMS {
  type: 'income' | 'expense';
  amount: number;
  note: string;
  category: Category;
  network: 'MTN' | 'Telecel' | 'AirtelTigo' | 'Manual';
  date: string;
}

// Ghana MoMo SMS patterns
const PATTERNS = {
  // MTN MoMo received
  mtnReceived: /You have received GHS\s?([\d,]+\.?\d*)\s+from\s+(.+?)(?:\.|$)/i,
  mtnSent: /GHS\s?([\d,]+\.?\d*)\s+(?:has been )?(?:sent|transferred) to\s+(.+?)(?:\.|$)/i,
  mtnPayment: /Payment of GHS\s?([\d,]+\.?\d*)\s+to\s+(.+?)(?:\.|$)/i,
  mtnCashout: /Cash Out of GHS\s?([\d,]+\.?\d*)/i,
  mtnDeposit: /Deposited GHS\s?([\d,]+\.?\d*)/i,

  // Telecel (formerly Vodafone Cash)
  telecelReceived: /You have received GHS\s?([\d,]+\.?\d*)\s+from\s+(.+?)(?:\.|$)/i,
  telecelSent: /GHS\s?([\d,]+\.?\d*)\s+sent to\s+(.+?)(?:\.|$)/i,

  // AirtelTigo
  airtelReceived: /GHS\s?([\d,]+\.?\d*)\s+received from\s+(.+?)(?:\.|$)/i,
  airtelSent: /GHS\s?([\d,]+\.?\d*)\s+sent to\s+(.+?)(?:\.|$)/i,

  // Generic patterns
  genericReceived: /received\s+(?:GHS|₵)?\s*([\d,]+\.?\d*)/i,
  genericSent: /(?:sent|paid|transferred)\s+(?:GHS|₵)?\s*([\d,]+\.?\d*)/i,
  genericAmount: /(?:GHS|₵)\s*([\d,]+\.?\d*)/i,
};

function detectNetwork(text: string): 'MTN' | 'Telecel' | 'AirtelTigo' | 'Manual' {
  const upper = text.toUpperCase();
  if (upper.includes('MTN') || upper.includes('MOMO')) return 'MTN';
  if (upper.includes('TELECEL') || upper.includes('VODAFONE')) return 'Telecel';
  if (upper.includes('AIRTEL') || upper.includes('TIGO')) return 'AirtelTigo';
  return 'Manual';
}

function parseAmount(str: string): number {
  return parseFloat(str.replace(/,/g, ''));
}

function guessCategory(note: string, type: 'income' | 'expense'): Category {
  const lower = note.toLowerCase();
  if (type === 'income') {
    if (lower.includes('salary') || lower.includes('pay')) return 'Salary';
    if (lower.includes('business')) return 'Business';
    return 'MoMo Received';
  }
  if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant') || lower.includes('waakye') || lower.includes('rice')) return 'Food';
  if (lower.includes('transport') || lower.includes('uber') || lower.includes('bolt') || lower.includes('taxi') || lower.includes('trotro')) return 'Transport';
  if (lower.includes('airtime') || lower.includes('data') || lower.includes('bundle')) return 'Airtime';
  if (lower.includes('bill') || lower.includes('ecg') || lower.includes('water') || lower.includes('electricity')) return 'Bills';
  if (lower.includes('shop') || lower.includes('mall') || lower.includes('market')) return 'Shopping';
  return 'Transfer';
}

export function parseSMS(text: string): ParsedSMS | null {
  if (!text || text.trim().length < 5) return null;

  const network = detectNetwork(text);
  const now = new Date().toISOString();

  // Try income patterns
  let match = text.match(PATTERNS.mtnReceived) || text.match(PATTERNS.airtelReceived) || text.match(PATTERNS.genericReceived);
  if (match && (text.toLowerCase().includes('received') || text.toLowerCase().includes('you have received'))) {
    const amount = parseAmount(match[1]);
    const note = match[2] ? `From ${match[2].trim()}` : 'MoMo received';
    if (amount > 0) {
      return {
        type: 'income',
        amount,
        note,
        category: 'MoMo Received',
        network,
        date: now,
      };
    }
  }

  // Try expense/sent patterns
  match = text.match(PATTERNS.mtnSent) || text.match(PATTERNS.telecelSent) || text.match(PATTERNS.airtelSent);
  if (match && (text.toLowerCase().includes('sent') || text.toLowerCase().includes('transferred') || text.toLowerCase().includes('paid'))) {
    const amount = parseAmount(match[1]);
    const note = match[2] ? `To ${match[2].trim()}` : 'MoMo sent';
    if (amount > 0) {
      return {
        type: 'expense',
        amount,
        note,
        category: guessCategory(note, 'expense'),
        network,
        date: now,
      };
    }
  }

  // Payment
  match = text.match(PATTERNS.mtnPayment);
  if (match) {
    const amount = parseAmount(match[1]);
    const note = match[2] ? `Payment to ${match[2].trim()}` : 'Bill payment';
    if (amount > 0) {
      return {
        type: 'expense',
        amount,
        note,
        category: 'Bills',
        network,
        date: now,
      };
    }
  }

  // Cash out
  match = text.match(PATTERNS.mtnCashout);
  if (match) {
    const amount = parseAmount(match[1]);
    if (amount > 0) {
      return { type: 'expense', amount, note: 'Cash Out', category: 'Transfer', network, date: now };
    }
  }

  // Generic fallback
  match = text.match(PATTERNS.genericAmount);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    const isIncome = /received|credited|deposited/i.test(text);
    if (amount > 0) {
      return {
        type: isIncome ? 'income' : 'expense',
        amount,
        note: text.slice(0, 60),
        category: isIncome ? 'MoMo Received' : 'Other',
        network,
        date: now,
      };
    }
  }

  return null;
}

export function parseMultipleSMS(text: string): ParsedSMS[] {
  // Split on blank lines or numbered lines
  const segments = text.split(/\n{2,}|(?=\d+\.\s)/);
  const results: ParsedSMS[] = [];
  for (const seg of segments) {
    const trimmed = seg.trim();
    if (trimmed.length > 10) {
      const parsed = parseSMS(trimmed);
      if (parsed) results.push(parsed);
    }
  }
  // If splitting didn't work, try the whole text
  if (results.length === 0) {
    const parsed = parseSMS(text.trim());
    if (parsed) results.push(parsed);
  }
  return results;
}

export function parseSMSCommand(text: string): Omit<Transaction, 'id'> | null {
  // "spent 40 food", "received 500 salary kwame"
  const spentMatch = text.match(/^(?:spent|expense|paid)\s+([\d.]+)\s+(\w+)(?:\s+(.+))?$/i);
  if (spentMatch) {
    const amount = parseFloat(spentMatch[1]);
    const catHint = spentMatch[2];
    const note = spentMatch[3] || catHint;
    const category = guessCategory(catHint, 'expense');
    return { type: 'expense', amount, note, category, date: new Date().toISOString(), network: 'Manual' };
  }

  const receivedMatch = text.match(/^(?:received|income|got)\s+([\d.]+)(?:\s+(\w+))?(?:\s+(.+))?$/i);
  if (receivedMatch) {
    const amount = parseFloat(receivedMatch[1]);
    const catHint = receivedMatch[2] || '';
    const note = receivedMatch[3] || catHint || 'Income';
    const category = guessCategory(catHint, 'income');
    return { type: 'income', amount, note, category, date: new Date().toISOString(), network: 'Manual' };
  }

  return null;
}

export function generateAIAdvice(transactions: Transaction[]): string[] {
  const advice: string[] = [];
  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalExpenses = thisMonth.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const totalIncome = thisMonth.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);

  const catMap: Record<string, number> = {};
  thisMonth.filter((t) => t.type === 'expense').forEach((t) => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });

  if (totalIncome > 0 && totalExpenses / totalIncome > 0.8) {
    advice.push(`⚠️ You've spent ${Math.round((totalExpenses / totalIncome) * 100)}% of your income this month. Consider saving at least 20%.`);
  }

  if (catMap['Food'] && totalExpenses > 0) {
    const foodPct = Math.round((catMap['Food'] / totalExpenses) * 100);
    if (foodPct > 35) {
      advice.push(`🍽️ Food takes up ${foodPct}% of your expenses. Cutting by GHS 10/day saves ~GHS ${10 * 30}/month.`);
    }
  }

  if (catMap['Airtime'] && catMap['Airtime'] > 50) {
    advice.push(`📱 You've spent GHS ${catMap['Airtime'].toFixed(2)} on airtime this month. Consider a monthly data bundle.`);
  }

  if (totalIncome > totalExpenses) {
    const savings = totalIncome - totalExpenses;
    advice.push(`✅ Great! You've saved GHS ${savings.toFixed(2)} this month. Keep it up!`);
  }

  if (advice.length === 0) {
    advice.push(`📊 Add more transactions to get personalized spending advice.`);
  }

  return advice;
}
