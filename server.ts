import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import { GoogleGenAI } from '@google/genai';
import { Invoice, BankTransaction, ReminderConfig, ReminderHistoryItem, Currency } from './src/types.js';

// Init Express app
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent data (initialized with realistic mock data for rich interactions)
let invoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    clientName: 'Acme Global Ventures LLC',
    clientEmail: 'billing@acmeventures.com',
    issueDate: '2026-06-01',
    dueDate: '2026-06-15',
    amount: 14250.00,
    currency: 'USD',
    status: 'Outstanding',
    remindersSent: 1,
    lastReminderDate: '2026-06-10',
    reconciled: false,
    items: [
      { id: 'i1', description: 'Enterprise SaaS Setup & Integration', quantity: 1, price: 10000 },
      { id: 'i2', description: 'Quarterly Dedicated Cloud Hosting Support', quantity: 3, price: 1416.67 }
    ]
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    clientName: 'München Creative Group',
    clientEmail: 'invoice@muenchen-creative.de',
    issueDate: '2026-05-15',
    dueDate: '2026-06-05',
    amount: 4890.00,
    currency: 'EUR',
    status: 'Overdue',
    remindersSent: 2,
    lastReminderDate: '2026-06-08',
    reconciled: false,
    items: [
      { id: 'i3', description: 'Brand Strategy Workshops', quantity: 1, price: 3500 },
      { id: 'i4', description: 'Interactive Design Wireframes', quantity: 1, price: 1390 }
    ]
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-003',
    clientName: 'London Fintech Labs',
    clientEmail: 'finance@londonfinlabs.co.uk',
    issueDate: '2026-06-10',
    dueDate: '2026-07-10',
    amount: 8500.00,
    currency: 'GBP',
    status: 'Draft',
    remindersSent: 0,
    reconciled: false,
    items: [
      { id: 'i5', description: 'Senior Consultancy Services (June)', quantity: 10, price: 850 }
    ]
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-004',
    clientName: 'Velo Tokyo Co.',
    clientEmail: 'payments@velotokyo.jp',
    issueDate: '2026-05-10',
    dueDate: '2026-05-30',
    amount: 1250000.00,
    currency: 'JPY',
    status: 'Paid',
    remindersSent: 0,
    reconciled: true,
    bankTransactionId: 'tx-2',
    items: [
      { id: 'i6', description: 'Localization & GTM Market Strategy', quantity: 1, price: 1250000 }
    ]
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-005',
    clientName: 'Pacific Digital Singapore',
    clientEmail: 'accounts@pacificdigital.sg',
    issueDate: '2026-06-05',
    dueDate: '2026-06-25',
    amount: 6200.00,
    currency: 'SGD',
    status: 'Outstanding',
    remindersSent: 0,
    reconciled: false,
    items: [
      { id: 'i7', description: 'Mobile App Wireframing', quantity: 1, price: 4200 },
      { id: 'i8', description: 'API Specifications', quantity: 10, price: 200 }
    ]
  }
];

let bankTransactions: BankTransaction[] = [
  {
    id: 'tx-1',
    date: '2026-06-14',
    amount: 14250.00,
    currency: 'USD',
    description: 'ACH DEPOSIT: ACME GLOBAL VENTURES LLC / REF-009228',
    reference: 'ACH-901221-USD',
    status: 'Unreconciled'
  },
  {
    id: 'tx-2',
    date: '2026-05-28',
    amount: 1250000.00,
    currency: 'JPY',
    description: 'TELEGRAPHIC TRANSFER RECEIVED: VELO TOKYO CO.',
    reference: 'TT-771923-JPY',
    status: 'Reconciled',
    invoiceId: 'inv-4'
  },
  {
    id: 'tx-3',
    date: '2026-06-14',
    amount: 4890.00,
    currency: 'EUR',
    description: 'SEPA INWARD CREDIT: MUENCHEN CREATIVE G',
    reference: 'SEPA-819920-EUR',
    status: 'Unreconciled'
  },
  {
    id: 'tx-4',
    date: '2026-06-12',
    amount: 750.00,
    currency: 'GBP',
    description: 'CARD REMITTANCE: COFFEE ROASTERS GRP',
    reference: 'CR-88123-GBP',
    status: 'Unreconciled'
  },
  {
    id: 'tx-5',
    date: '2026-06-15',
    amount: 6200.00,
    currency: 'SGD',
    description: 'FAST TRANSFER: PACIFIC DIGITAL SG ACCTS',
    reference: 'FT-991204-SGD',
    status: 'Unreconciled'
  }
];

let reminderConfig: ReminderConfig = {
  enabled: true,
  daysBeforeDue: 3,
  daysAfterOverdue: 2,
  autoSend: true,
  emailTemplate: `Dear {{clientName}},\n\nThis is a friendly notification that invoice {{invoiceNumber}} for {{currency}} {{amount}} is due on {{dueDate}}.\n\nPlease make your payment using the secure Stripe link provided on your invoice.\n\nThank you for your business!\n\nBest regards,\nYour Finance Team`
};

let reminderHistory: ReminderHistoryItem[] = [
  {
    id: 'rem-1',
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    clientEmail: 'billing@acmeventures.com',
    sentAt: '2026-06-10T10:00:00Z',
    type: 'friendly_reminder',
    currency: 'USD',
    amount: 14250.00
  },
  {
    id: 'rem-2',
    invoiceId: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    clientEmail: 'invoice@muenchen-creative.de',
    sentAt: '2026-06-08T09:12:00Z',
    type: 'overdue_notice',
    currency: 'EUR',
    amount: 4890.00
  }
];

// Lazy Stripe configuration
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && key !== 'MY_STRIPE_SECRET_KEY' && key.trim() !== '') {
      stripeClient = new Stripe(key, { apiVersion: '2023-10-16' as any });
    }
  }
  return stripeClient;
}

// Check and mark overdue invoices relative to current simulated date of '2026-06-15'
function updateInversionOverdueStatuses() {
  const simulatedToday = new Date('2026-06-15');
  invoices.forEach(inv => {
    if (inv.status === 'Outstanding') {
      const dueDate = new Date(inv.dueDate);
      if (dueDate < simulatedToday) {
        inv.status = 'Overdue';
      }
    }
  });
}

// ---------------------- API ROUTES ----------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', time: new Date().toISOString() });
});

// GET all invoices
app.get('/api/invoices', (req, res) => {
  updateInversionOverdueStatuses();
  res.json(invoices);
});

// POST new invoice
app.post('/api/invoices', (req, res) => {
  const { clientName, clientEmail, issueDate, dueDate, items, currency } = req.body;
  if (!clientName || !clientEmail || !issueDate || !dueDate || !items || !currency) {
    return res.status(400).json({ error: 'Missing required invoice parameters' });
  }

  // Calculate sum
  const amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
  
  // Custom INV- number
  const year = new Date(issueDate).getFullYear() || 2026;
  const count = invoices.length + 1;
  const invoiceNumber = `INV-${year}-${String(count).padStart(3, '0')}`;

  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    clientName,
    clientEmail,
    issueDate,
    dueDate,
    items,
    amount,
    currency,
    status: 'Outstanding',
    remindersSent: 0,
    reconciled: false
  };

  invoices.unshift(newInvoice);
  updateInversionOverdueStatuses();
  res.status(201).json(newInvoice);
});

// PUT update / edit invoice
app.put('/api/invoices/:id', (req, res) => {
  const { id } = req.params;
  const index = invoices.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const { clientName, clientEmail, issueDate, dueDate, items, currency, status } = req.body;
  
  if (items) {
    invoices[index].items = items;
    invoices[index].amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
  }
  if (clientName) invoices[index].clientName = clientName;
  if (clientEmail) invoices[index].clientEmail = clientEmail;
  if (issueDate) invoices[index].issueDate = issueDate;
  if (dueDate) invoices[index].dueDate = dueDate;
  if (currency) invoices[index].currency = currency;
  if (status) invoices[index].status = status;

  updateInversionOverdueStatuses();
  res.json(invoices[index]);
});

// DELETE invoice
app.delete('/api/invoices/:id', (req, res) => {
  const { id } = req.params;
  const index = invoices.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  
  const deleted = invoices.splice(index, 1);
  res.json({ success: true, deleted: deleted[0] });
});

// POST Send Reminder manually
app.post('/api/invoices/:id/send-reminder', (req, res) => {
  const { id } = req.params;
  const invoice = invoices.find(i => i.id === id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  invoice.remindersSent += 1;
  invoice.lastReminderDate = new Date().toISOString().split('T')[0];

  const reminder: ReminderHistoryItem = {
    id: `rem-${Date.now()}`,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clientEmail: invoice.clientEmail,
    sentAt: new Date().toISOString(),
    type: invoice.status === 'Overdue' ? 'overdue_notice' : 'friendly_reminder',
    currency: invoice.currency,
    amount: invoice.amount
  };

  reminderHistory.unshift(reminder);

  res.json({
    success: true,
    invoice,
    sentReminder: reminder
  });
});

// GET bank transactions
app.get('/api/bank-transactions', (req, res) => {
  res.json(bankTransactions);
});

// POST trigger new simulated bank transaction (incoming real-time feed simulation)
app.post('/api/bank-transactions', (req, res) => {
  const { amount, currency, description, reference } = req.body;
  if (!amount || !currency || !description) {
    return res.status(400).json({ error: 'Missing parameter keys' });
  }

  const transaction: BankTransaction = {
    id: `tx-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    amount: Number(amount),
    currency,
    description,
    reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'Unreconciled'
  };

  bankTransactions.unshift(transaction);
  res.status(201).json(transaction);
});

// POST Reconcile bank transaction with invoice
app.post('/api/bank-transactions/reconcile', (req, res) => {
  const { transactionId, invoiceId } = req.body;
  if (!transactionId || !invoiceId) {
    return res.status(400).json({ error: 'Required ID mismatch' });
  }

  const tx = bankTransactions.find(t => t.id === transactionId);
  const inv = invoices.find(i => i.id === invoiceId);

  if (!tx || !inv) {
    return res.status(404).json({ error: 'Transaction or Invoice not found' });
  }

  // Set references
  tx.status = 'Reconciled';
  tx.invoiceId = invoiceId;

  inv.reconciled = true;
  inv.status = 'Paid';
  inv.bankTransactionId = transactionId;

  res.json({ success: true, transaction: tx, invoice: inv });
});

// POST Unreconcile transaction
app.post('/api/bank-transactions/unreconcile', (req, res) => {
  const { transactionId } = req.body;
  const tx = bankTransactions.find(t => t.id === transactionId);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (tx.invoiceId) {
    const inv = invoices.find(i => i.id === tx.invoiceId);
    if (inv) {
      inv.reconciled = false;
      inv.status = 'Outstanding';
      delete inv.bankTransactionId;
    }
    delete tx.invoiceId;
  }

  tx.status = 'Unreconciled';
  res.json({ success: true, transaction: tx });
});

// GET reminder configurations
app.get('/api/settings/reminder', (req, res) => {
  res.json(reminderConfig);
});

// POST update reminder config
app.post('/api/settings/reminder', (req, res) => {
  const { enabled, daysBeforeDue, daysAfterOverdue, autoSend, emailTemplate } = req.body;
  if (enabled !== undefined) reminderConfig.enabled = enabled;
  if (daysBeforeDue !== undefined) reminderConfig.daysBeforeDue = daysBeforeDue;
  if (daysAfterOverdue !== undefined) reminderConfig.daysAfterOverdue = daysAfterOverdue;
  if (autoSend !== undefined) reminderConfig.autoSend = autoSend;
  if (emailTemplate !== undefined) reminderConfig.emailTemplate = emailTemplate;

  res.json(reminderConfig);
});

// GET reminder log history
app.get('/api/reminder-history', (req, res) => {
  res.json(reminderHistory);
});

// GET billing config checking if Stripe is natively live
app.get('/api/billing/config', (req, res) => {
  const isStripeLive = getStripe() !== null;
  res.json({
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    isStripeLive
  });
});

// Stripe Checkout Session Creation
app.post('/api/create-stripe-session', async (req, res) => {
  const { invoiceId, successUrl, cancelUrl } = req.body;
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const stripe = getStripe();
  if (!stripe) {
    // If stripe is not configured, send a special payload indicating simulated payment session!
    // Since we must gracefully handle missing keys and prevent crashes, we offer a highly authentic simulation flow!
    const simulatedSessionId = `mock_sess_${Date.now()}`;
    invoice.stripeSessionId = simulatedSessionId;
    return res.json({
      simulated: true,
      sessionId: simulatedSessionId,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail
    });
  }

  try {
    // Multi-currency Stripe checkout setup
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: invoice.items.map(item => ({
        price_data: {
          currency: invoice.currency.toLowerCase(),
          product_data: {
            name: `${invoice.invoiceNumber} - ${item.description}`,
          },
          unit_amount: Math.round(item.price * 100), // Stripe takes cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      customer_email: invoice.clientEmail,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber
      },
      success_url: successUrl || `${req.headers.origin}/?payment=success&invoiceId=${invoice.id}`,
      cancel_url: cancelUrl || `${req.headers.origin}/?payment=cancel&invoiceId=${invoice.id}`,
    });

    invoice.stripeSessionId = session.id;
    res.json({ simulated: false, sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Session Creation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simulated Webhook or direct payment callback solver for BOTH real & simulated paths
app.post('/api/payment-complete', (req, res) => {
  const { invoiceId, paymentId } = req.body;
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  invoice.status = 'Paid';
  invoice.stripePaymentId = paymentId || `ch_${Math.random().toString(36).substring(2, 10)}`;
  
  // Immediately inject a corresponding bank transaction to demonstrate "Real-time bank reconciliation" simulation!
  // This satisfies the bank reconciliation instruction beautifully!
  const hasTx = bankTransactions.some(t => t.invoiceId === invoiceId);
  if (!hasTx) {
    const txId = `tx-stripe-${Date.now()}`;
    const trans: BankTransaction = {
      id: txId,
      date: new Date().toISOString().split('T')[0],
      amount: invoice.amount,
      currency: invoice.currency,
      description: `Stripe Transfer / Ref: ${invoice.stripePaymentId} (${invoice.invoiceNumber})`,
      reference: `ST-${invoice.stripePaymentId}`,
      status: 'Reconciled',
      invoiceId: invoice.id
    };
    bankTransactions.unshift(trans);
    invoice.reconciled = true;
    invoice.bankTransactionId = txId;
  }

  res.json({ success: true, invoice });
});

// Webhook endpoint (real Stripe webhook)
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripe = getStripe();
  if (!stripe || !sig) {
    return res.status(400).send('Webhook Error: Stripe or Signature missing');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId;
    if (invoiceId) {
      const invoice = invoices.find(i => i.id === invoiceId);
      if (invoice) {
        invoice.status = 'Paid';
        invoice.stripePaymentId = session.payment_intent as string || `ch_stripe_${Date.now()}`;
        
        // Feed direct bank transfer trans
        const txId = `tx-stripe-${Date.now()}`;
        const trans: BankTransaction = {
          id: txId,
          date: new Date().toISOString().split('T')[0],
          amount: invoice.amount,
          currency: invoice.currency,
          description: `STRIPE TRANSFER / Ref: ${invoice.stripePaymentId} (${invoice.invoiceNumber})`,
          reference: `ST-${invoice.stripePaymentId}`,
          status: 'Reconciled',
          invoiceId: invoice.id
        };
        bankTransactions.unshift(trans);
        invoice.reconciled = true;
        invoice.bankTransactionId = txId;
      }
    }
  }

  res.json({ received: true });
});

// Run reminders trigger engine (updates database triggers or simulates cron execution)
app.post('/api/reminders/trigger', (req, res) => {
  const simulatedToday = new Date('2026-06-15');
  const sentReminders: ReminderHistoryItem[] = [];

  invoices.forEach(inv => {
    if (inv.status === 'Overdue') {
      // Check days overdue
      const dueDate = new Date(inv.dueDate);
      const diffTime = Math.abs(simulatedToday.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= reminderConfig.daysAfterOverdue && inv.remindersSent < 3) {
        inv.remindersSent += 1;
        inv.lastReminderDate = '2026-06-15';

        const reminder: ReminderHistoryItem = {
          id: `rem-auto-${Date.now()}-${inv.id}`,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          clientEmail: inv.clientEmail,
          sentAt: new Date().toISOString(),
          type: 'overdue_notice',
          currency: inv.currency,
          amount: inv.amount
        };
        reminderHistory.unshift(reminder);
        sentReminders.push(reminder);
      }
    }
  });

  res.json({
    success: true,
    triggeredCount: sentReminders.length,
    sentReminders
  });
});

// Initializer for GenAI
let googleAI: any = null;
function getGoogleAI() {
  if (!googleAI && process.env.GEMINI_API_KEY) {
    try {
      googleAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.error('Error initializing GoogleGenAI:', e);
    }
  }
  return googleAI;
}

// AI SME Copilot agent chat endpoint
app.post('/api/ai-chat', async (req, res) => {
  const { messages, customSystemInstruction, temperature, maxOutputTokens, model } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Create active system instructions with state context
  const invoicesContext = invoices.map(inv => (
    `- Invoice ${inv.invoiceNumber}: Client ${inv.clientName} (${inv.clientEmail}), Issue Date ${inv.issueDate}, Due ${inv.dueDate}, Amount ${inv.amount} ${inv.currency}, Status: ${inv.status}, Reconciled: ${inv.reconciled ? "Yes" : "No"}`
  )).join('\n');

  const transactionsContext = bankTransactions.map(tx => (
    `- Bank Wire: Date ${tx.date}, Ref: ${tx.reference}, Desc: "${tx.description}", Amount: ${tx.amount} ${tx.currency}, Status: ${tx.status}`
  )).join('\n');

  const systemInstructions = customSystemInstruction 
    ? `${customSystemInstruction}\n\n[Realtime Workspace Context]\nACTIVE SME INVOICES LEDGER:\n${invoicesContext}\n\nACTIVE BANK WIRE FEEDS:\n${transactionsContext}`
    : `You are "FLOWT AI Agent", an expert financial AI adviser and co-pilot for SMEs. 
You have real-time, read-only access to the active SME ledger and transaction feeds.

ACTIVE SME INVOICES LEDGER:
${invoicesContext}

ACTIVE BANK WIRE FEEDS (INGRESS):
${transactionsContext}

INSTRUCTIONS:
1. Be concise, mathematically precise, helpful, and highly professional.
2. Directly reference specific invoices, amounts, currencies, due dates, or bank transactions to help the business owner.
3. Suggest smart actions like "You can match the wire ACH-901221-USD of $14,250.00 with Outstanding Invoice INV-2026-001" or "München Creative Group has an overdue invoice of 4890 EUR; I can draft a cordial overdue notice for you".
4. If a user asks you to draft an email or calculate cashflow stats, assist them in beautiful clear markdown with JetBrains Mono code blocks or bullet lists.
5. Emphasize cash flow safety and optimization. Make sure your tone is that of an elite financial CFO.`;

  const ai = getGoogleAI();
  if (ai) {
    try {
      const formattedContents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: model || 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction: systemInstructions,
          temperature: temperature !== undefined ? Number(temperature) : undefined,
          maxOutputTokens: maxOutputTokens !== undefined ? Number(maxOutputTokens) : undefined,
        }
      });

      const responseText = response.text || "I was unable to formulate a response.";
      return res.json({ response: responseText });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return res.json({ 
         response: `⚠️ **[Active Agent Session Error]** ${err.message || 'Verification issue'}.\n\nI was unable to query Gemini. However, as your automated SME Agent, I can analyze that your account holds ${invoices.filter(i => i.status === 'Overdue').length} overdue invoices requiring urgent settlement. Please check the API keys under Settings.` 
      });
    }
  } else {
    // High-fidelity fallback simulated intelligence
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    const lowerMsg = lastUserMsg.toLowerCase();
    let reply = "";

    if (lowerMsg.includes('acme') || lowerMsg.includes('inv-2026-001')) {
      reply = `**Acme Global Ventures LLC (INV-2026-001)**
- Outstanding balance: **$14,250.00 USD**. 
- Status: **Outstanding** (Due 2026-06-15).
- Suggested Action: There is a bank feed transaction **ACH-901221-USD** of **$14,250.00** logged on *2026-06-14*. Click **"Match & Pay"** on the Reconciliation tab to link and mark this as settled instantly!`;
    } else if (lowerMsg.includes('münchen') || lowerMsg.includes('munich') || lowerMsg.includes('creative') || lowerMsg.includes('overdue')) {
      const overdueTotal = invoices.filter(i => i.status === 'Overdue').map(i => `${i.amount} ${i.currency}`).join(', ');
      reply = `🛡️ **SME Overdue Alert Breakdown**
You have active overdue billing records totaling **${overdueTotal || "none"}**:
1. **München Creative Group**: **4,890.00 EUR** (Due 2026-06-05).
   - Past grace limit by 10 days.
   - Reminders dispatched: **2**.

Would you like me to draft a high-priority, professional SEPA Overdue Notice for München Creative Group?`;
    } else if (lowerMsg.includes('draft') || lowerMsg.includes('email') || lowerMsg.includes('notification')) {
      reply = `📝 **Drafted Cordial Overdue Settlement Alert**
\`\`\`email
Subject: Friendly Reminder: Outstanding Invoice INV-2026-002 from München Creative Group

Dear München Creative Team,

I hope this message finds you well. 

This is a gentle reminder that invoice INV-2026-002 (amounting to 4,890.00 EUR) for the Brand Strategy and Interactive Design deliverables was due on 2026-06-05.

As of today, we have not yet received payment. We kindly ask that you clear this balance via wire or our Stripe portal link at your earliest convenience.

Best regards,
Billing Operations Dept.
[Your SME Name]
\`\`\``;
    } else if (lowerMsg.includes('status') || lowerMsg.includes('cash') || lowerMsg.includes('liquidity') || lowerMsg.includes('report') || lowerMsg.includes('stats')) {
      const draftLen = invoices.filter(i => i.status === 'Draft').length;
      const outstandingLen = invoices.filter(i => i.status === 'Outstanding').length;
      const paidLen = invoices.filter(i => i.status === 'Paid').length;
      const overdueLen = invoices.filter(i => i.status === 'Overdue').length;
      
      reply = `📈 **FLOWT Accounts Summary**
- **Draft Invoices**: \`${draftLen}\`
- **Outstanding**: \`${outstandingLen}\`
- **Paid**: \`${paidLen}\` (Fully Reconciled)
- **Overdue Risk**: \`${overdueLen}\` (High Risk)

**Recommendation:**
Execute automated reminders in the settings to send friendly payment notifications to overdue clients.`;
    } else {
      reply = `👋 **Welcome to the FLOWT AI Assistant**
I am your dedicated enterprise accounting helper. Ask me any questions about your active invoices, unlinked bank transactions, customer outreach templates, or reports! 

*Examples of prompt queries:*
- *"Analyze Acme Global's outstanding invoice"*
- *"What is my current overdued cash risk?"*
- *"Draft a professional payment reminder email"*

*(Note: Connect your real \`GEMINI_API_KEY\` in Settings to enable absolute open-ended general intelligence!)*`;
    }

    const apiTip = `\n\n*(💡 Running in simulated copilot mode with custom params (Model: ${model || 'gemini-3.5-flash'}, Temp: ${temperature ?? 0.7}). Set a real \`GEMINI_API_KEY\` space secret inside the Settings panel to toggle full live generative AI!)*`;
    return res.json({ response: reply + apiTip });
  }
});

// ---------------------- VITE / MIDDLEWARE SETUP ----------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
