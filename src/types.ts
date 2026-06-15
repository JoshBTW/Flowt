export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'SGD';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export type InvoiceStatus = 'Draft' | 'Outstanding' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  amount: number;
  currency: Currency;
  status: InvoiceStatus;
  remindersSent: number;
  lastReminderDate?: string;
  stripePaymentId?: string;
  stripeSessionId?: string;
  reconciled: boolean;
  bankTransactionId?: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  description: string;
  reference: string;
  status: 'Unreconciled' | 'Reconciled';
  invoiceId?: string;
}

export interface ReminderConfig {
  enabled: boolean;
  daysBeforeDue: number;
  daysAfterOverdue: number;
  autoSend: boolean;
  emailTemplate: string;
}

export interface FinancialStats {
  totalInvoiced: Record<Currency, number>;
  totalPaid: Record<Currency, number>;
  totalOutstanding: Record<Currency, number>;
  totalOverdue: Record<Currency, number>;
  monthlyRevenue: { month: string; amount: number; scaleCurrency: Currency }[];
}

export interface ReminderHistoryItem {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientEmail: string;
  sentAt: string;
  type: 'friendly_reminder' | 'overdue_notice';
  currency: Currency;
  amount: number;
}
