import { Invoice, BankTransaction, Currency, FinancialStats } from './types.js';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$'
};

export function formatAmount(amount: number, currency: Currency): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (e) {
    return `${CURRENCY_SYMBOLS[currency]}${amount.toFixed(2)}`;
  }
}

// Convert arbitrary values roughly to a base (e.g. USD) for aggregate stats, simulating a mid-market rate exchange!
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 1.08,    // 1 EUR = 1.08 USD
  GBP: 1.27,    // 1 GBP = 1.27 USD
  JPY: 0.0064,  // 1 JPY = 0.0064 USD
  AUD: 0.66,    // 1 AUD = 0.66 USD
  CAD: 0.73,    // 1 CAD = 0.73 USD
  SGD: 0.74     // 1 SGD = 0.74 USD
};

export function convertToUSD(amount: number, currency: Currency): number {
  return amount * (EXCHANGE_RATES[currency] || 1.0);
}

export function calculateStats(invoices: Invoice[]): FinancialStats {
  const totalInvoiced: Record<Currency, number> = {
    USD: 0, EUR: 0, GBP: 0, JPY: 0, AUD: 0, CAD: 0, SGD: 0
  };
  const totalPaid: Record<Currency, number> = {
    USD: 0, EUR: 0, GBP: 0, JPY: 0, AUD: 0, CAD: 0, SGD: 0
  };
  const totalOutstanding: Record<Currency, number> = {
    USD: 0, EUR: 0, GBP: 0, JPY: 0, AUD: 0, CAD: 0, SGD: 0
  };
  const totalOverdue: Record<Currency, number> = {
    USD: 0, EUR: 0, GBP: 0, JPY: 0, AUD: 0, CAD: 0, SGD: 0
  };

  invoices.forEach(inv => {
    const cur = inv.currency;
    totalInvoiced[cur] += inv.amount;
    
    if (inv.status === 'Paid') {
      totalPaid[cur] += inv.amount;
    } else if (inv.status === 'Outstanding') {
      totalOutstanding[cur] += inv.amount;
    } else if (inv.status === 'Overdue') {
      totalOverdue[cur] += inv.amount;
    }
  });

  // Calculate monthly revenue in USD for charting simplicity
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth: Record<string, number> = {};

  // Initialize previous few months
  const currentYear = 2026;
  for (let i = 1; i <= 6; i++) {
    revenueByMonth[`${monthNames[i-1]} ${currentYear}`] = 0;
  }

  invoices.forEach(inv => {
    if (inv.status === 'Paid') {
      const date = new Date(inv.issueDate);
      const m = monthNames[date.getMonth()];
      const y = date.getFullYear();
      const label = `${m} ${y}`;
      
      const usdAmount = convertToUSD(inv.amount, inv.currency);
      if (revenueByMonth[label] !== undefined) {
        revenueByMonth[label] += usdAmount;
      } else {
        revenueByMonth[label] = usdAmount;
      }
    }
  });

  const monthlyRevenue = Object.entries(revenueByMonth).map(([month, amount]) => ({
    month,
    amount: Math.round(amount),
    scaleCurrency: 'USD' as Currency
  })).sort((a, b) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idxA = months.indexOf(a.month.split(' ')[0]);
    const idxB = months.indexOf(b.month.split(' ')[0]);
    return idxA - idxB;
  });

  return {
    totalInvoiced,
    totalPaid,
    totalOutstanding,
    totalOverdue,
    monthlyRevenue
  };
}
