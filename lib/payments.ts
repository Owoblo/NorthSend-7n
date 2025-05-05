import { supabase } from '@/lib/supabase'
import { createTransaction, updateWalletBalance } from './wallet'
import Stripe from 'stripe'

// Payment processor configuration
const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

// Types
export type PaymentMethod = 
  | 'ACH' 
  | 'WIRE' 
  | 'INTERAC' 
  | 'BANK_TRANSFER'
  | 'CASHAPP'
  | 'VENMO'
  | 'PAYPAL'
  | 'ZELLE'

export type PaymentDetails = {
  amount: number
  currency: 'USD' | 'CAD'
  method: PaymentMethod
  accountDetails?: {
    accountName: string
    accountNumber: string
    bankName: string
    routingNumber?: string
    email?: string
    phone?: string
    username?: string
  }
}

// Initialize Stripe
let stripe: Stripe | null = null

// Initialize Stripe with error handling
try {
  if (typeof window === 'undefined') {
    if (!STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined in environment variables')
    } else {
      stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2025-04-30.basil'
      })
      console.log('Stripe initialized successfully')
    }
  }
} catch (error) {
  console.error('Error initializing Stripe:', error)
}

// Create a payment intent for USD deposits
export async function createUsdPaymentIntent(amount: number, method: PaymentMethod): Promise<{ clientSecret: string; error: any }> {
  try {
    if (!stripe) {
      console.error('Stripe initialization failed. STRIPE_SECRET_KEY:', STRIPE_SECRET_KEY ? 'Present' : 'Missing')
      throw new Error('Stripe not initialized. Please check server logs for details.')
    }

    // For P2P payments, we'll create a payment link instead of a payment intent
    if (['CASHAPP', 'VENMO', 'PAYPAL', 'ZELLE'].includes(method)) {
      // Create a product and price for this specific payment
      const product = await stripe.products.create({
        name: 'USD Deposit',
        description: `USD deposit of $${amount}`,
      })

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100),
        currency: 'usd',
      })

      const paymentLink = await stripe.paymentLinks.create({
        line_items: [{
          price: price.id,
          quantity: 1,
        }],
        payment_method_types: ['card', 'us_bank_account'],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/receive/success`,
          },
        },
        automatic_tax: { enabled: false },
        customer_creation: 'always',
        metadata: {
          type: 'USD_DEPOSIT',
          method: method,
          amount: amount.toString()
        }
      })

      return { clientSecret: paymentLink.url, error: null }
    }

    // For traditional banking methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['us_bank_account'],
      metadata: {
        type: 'USD_DEPOSIT',
        method: method,
        amount: amount.toString()
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      }
    })

    return { clientSecret: paymentIntent.client_secret || '', error: null }
  } catch (err) {
    console.error('Error creating payment intent:', err)
    return { clientSecret: '', error: err }
  }
}

// Process USD deposit
export async function processUsdDeposit(
  walletId: string,
  amount: number,
  paymentIntentId: string,
  method: PaymentMethod
): Promise<{ success: boolean; error: any }> {
  try {
    if (!stripe) {
      throw new Error('Stripe not initialized')
    }

    // Verify the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not completed')
    }

    // Create deposit transaction
    const { error: transactionError } = await createTransaction(
      walletId,
      'DEPOSIT',
      amount,
      'USD',
      `USD deposit via ${method}`,
      { paymentIntentId, method }
    )

    if (transactionError) {
      throw new Error('Failed to create deposit transaction')
    }

    // Update wallet balance
    const { error: balanceError } = await updateWalletBalance(
      walletId,
      amount
    )

    if (balanceError) {
      throw new Error('Failed to update wallet balance')
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Error processing USD deposit:', err)
    return { success: false, error: err }
  }
}

// Process CAD withdrawal
export async function processCadWithdrawal(
  walletId: string,
  amount: number,
  method: PaymentMethod,
  details: {
    email?: string;
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get wallet and verify balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (walletError || !wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create withdrawal transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        wallet_id: walletId,
        type: 'WITHDRAWAL',
        amount,
        currency: 'CAD',
        status: 'PENDING',
        payment_method: method,
        payment_details: details,
        description: `CAD withdrawal via ${method}`
      })
      .select()
      .single();

    if (transactionError) {
      throw transactionError;
    }

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: wallet.balance - amount })
      .eq('id', walletId);

    if (updateError) {
      // Revert transaction if wallet update fails
      await supabase
        .from('transactions')
        .update({ status: 'FAILED' })
        .eq('id', transaction.id);
      throw updateError;
    }

    // TODO: Integrate with actual payment processor
    // For now, we'll simulate processing
    setTimeout(async () => {
      await supabase
        .from('transactions')
        .update({ status: 'COMPLETED' })
        .eq('id', transaction.id);
    }, 5000);

    return { success: true };
  } catch (error) {
    console.error('Withdrawal error:', error);
    return { success: false, error: error.message };
  }
}

// Get withdrawal status
export async function getWithdrawalStatus(transactionId: string): Promise<string> {
  const { data, error } = await supabase
    .from('transactions')
    .select('status')
    .eq('id', transactionId)
    .single();

  if (error) throw error;
  return data.status;
}

// Get withdrawal history
export async function getWithdrawalHistory(walletId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .eq('type', 'WITHDRAWAL')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get payment methods available for a currency
export function getAvailablePaymentMethods(currency: 'USD' | 'CAD'): PaymentMethod[] {
  if (currency === 'USD') {
    return ['ACH', 'WIRE', 'CASHAPP', 'VENMO', 'PAYPAL', 'ZELLE']
  } else {
    return ['INTERAC', 'BANK_TRANSFER']
  }
}

// Get minimum amount for a payment method
export function getMinimumAmount(method: PaymentMethod): number {
  switch (method) {
    case 'ACH':
      return 10
    case 'WIRE':
      return 100
    case 'INTERAC':
      return 20
    case 'BANK_TRANSFER':
      return 50
    case 'CASHAPP':
    case 'VENMO':
    case 'PAYPAL':
    case 'ZELLE':
      return 5
    default:
      return 0
  }
}

// Get required fields for a payment method
export function getRequiredFields(method: PaymentMethod): string[] {
  switch (method) {
    case 'CASHAPP':
      return ['username']
    case 'VENMO':
      return ['username']
    case 'PAYPAL':
      return ['email']
    case 'ZELLE':
      return ['email', 'phone']
    case 'BANK_TRANSFER':
    case 'WIRE':
      return ['accountName', 'accountNumber', 'bankName']
    case 'INTERAC':
      return ['email']
    default:
      return []
  }
} 