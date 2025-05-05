import { supabase } from '@/lib/supabase'

export type Wallet = {
  id: string
  user_id: string
  currency: 'USD' | 'CAD'
  balance: number
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  wallet_id: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'CONVERSION' | 'TRANSFER'
  amount: number
  currency: 'USD' | 'CAD'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  description?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export async function getWallets(userId: string): Promise<{ wallets: Wallet[]; error: any }> {
  try {
    console.log('Fetching wallets for user:', userId)
    
    if (!userId) {
      console.error('No userId provided to getWallets')
      return { wallets: [], error: 'No userId provided' }
    }

    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error fetching wallets:', error)
      return { wallets: [], error }
    }

    console.log('Successfully fetched wallets:', wallets)
    return { wallets, error: null }
  } catch (err) {
    console.error('Unexpected error in getWallets:', err)
    return { wallets: [], error: err }
  }
}

export async function getWalletBalance(userId: string): Promise<Wallet | null> {
  if (!userId) {
    console.error('getWalletBalance: No userId provided')
    return null
  }

  console.log('Fetching wallet for user:', userId)

  // First try to get existing wallet
  const { data: existingWallet, error: fetchError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    console.error('Error fetching wallet:', {
      code: fetchError.code,
      message: fetchError.message,
      details: fetchError.details,
      hint: fetchError.hint
    })

    // If wallet doesn't exist, create a new one
    if (fetchError.code === 'PGRST116') {
      console.log('Creating new wallet for user:', userId)
      
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert([
          {
            user_id: userId,
            currency: 'USD',
            balance: 0
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('Error creating wallet:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        })
        return null
      }

      console.log('Successfully created new wallet:', newWallet)
      return newWallet
    }

    return null
  }

  console.log('Found existing wallet:', existingWallet)
  return existingWallet
}

export async function createTransaction(
  walletId: string,
  type: Transaction['type'],
  amount: number,
  currency: 'USD' | 'CAD',
  description?: string,
  metadata?: any
): Promise<{ transaction: Transaction | null; error: any }> {
  try {
    console.log('Creating transaction:', {
      walletId,
      type,
      amount,
      currency,
      description,
      metadata
    })

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([{
        wallet_id: walletId,
        type,
        amount,
        currency,
        status: 'PENDING',
        description,
        metadata
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating transaction:', error)
      return { transaction: null, error }
    }

    console.log('Successfully created transaction:', transaction)
    return { transaction, error: null }
  } catch (err) {
    console.error('Unexpected error in createTransaction:', err)
    return { transaction: null, error: err }
  }
}

export async function updateWalletBalance(
  walletId: string,
  amount: number
): Promise<{ wallet: Wallet | null; error: any }> {
  try {
    console.log('Updating wallet balance:', { walletId, amount })

    // First get the current wallet
    const { data: currentWallet, error: fetchError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single()

    if (fetchError) {
      console.error('Error fetching current wallet:', fetchError)
      return { wallet: null, error: fetchError }
    }

    // Calculate new balance
    const newBalance = Number(currentWallet.balance) + amount

    // Update wallet balance
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', walletId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating wallet balance:', updateError)
      return { wallet: null, error: updateError }
    }

    console.log('Successfully updated wallet balance:', updatedWallet)
    return { wallet: updatedWallet, error: null }
  } catch (err) {
    console.error('Unexpected error in updateWalletBalance:', err)
    return { wallet: null, error: err }
  }
}

export async function getRecentTransactions(
  userId: string,
  limit: number = 10
): Promise<{ transactions: Transaction[]; error: any }> {
  try {
    console.log('Fetching recent transactions for user:', userId)

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        wallets!inner (
          user_id
        )
      `)
      .eq('wallets.user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Supabase error fetching transactions:', error)
      return { transactions: [], error }
    }

    console.log('Successfully fetched transactions:', transactions)
    return { transactions, error: null }
  } catch (err) {
    console.error('Unexpected error in getRecentTransactions:', err)
    return { transactions: [], error: err }
  }
}

// Add test funds to a wallet
export async function addTestFunds(walletId: string, amount: number = 10000): Promise<boolean> {
  if (!walletId) {
    console.error('addTestFunds: No walletId provided')
    return false
  }

  console.log('Adding test funds to wallet:', walletId)

  // Create a deposit transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert([
      {
        wallet_id: walletId,
        type: 'DEPOSIT',
        amount: amount,
        currency: 'USD',
        status: 'COMPLETED',
        metadata: {
          description: 'Initial test funds'
        }
      }
    ])
    .select()
    .single()

  if (transactionError) {
    console.error('Error creating deposit transaction:', {
      code: transactionError.code,
      message: transactionError.message,
      details: transactionError.details,
      hint: transactionError.hint
    })
    return false
  }

  // Update wallet balance
  const { error: updateError } = await supabase
    .from('wallets')
    .update({
      balance: amount
    })
    .eq('id', walletId)

  if (updateError) {
    console.error('Error updating wallet balance:', {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint
    })
    return false
  }

  console.log('Successfully added test funds')
  return true
}

export async function convertCurrency(
  walletId: string,
  fromAmount: number,
  fromCurrency: 'USD' | 'CAD',
  toCurrency: 'USD' | 'CAD',
  rate: number
): Promise<Transaction | null> {
  if (!walletId) {
    console.error('convertCurrency: No walletId provided')
    return null
  }

  console.log('Starting currency conversion:', {
    walletId,
    fromAmount,
    fromCurrency,
    toCurrency,
    rate
  })

  const toAmount = fromCurrency === 'USD' ? fromAmount * rate : fromAmount / rate
  console.log('Calculated toAmount:', toAmount)

  // Get current wallet balances
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('id', walletId)
    .single()

  if (walletError) {
    console.error('Error fetching wallet for conversion:', {
      code: walletError.code,
      message: walletError.message,
      details: walletError.details,
      hint: walletError.hint
    })
    return null
  }

  console.log('Current wallet balances:', {
    usd_balance: wallet.usd_balance,
    cad_balance: wallet.cad_balance
  })

  // Calculate new balances
  const newUsdBalance = fromCurrency === 'USD'
    ? wallet.usd_balance - fromAmount
    : wallet.usd_balance + toAmount

  const newCadBalance = fromCurrency === 'CAD'
    ? wallet.cad_balance - fromAmount
    : wallet.cad_balance + toAmount

  console.log('New balances:', {
    newUsdBalance,
    newCadBalance
  })

  // Start a transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert([
      {
        wallet_id: walletId,
        type: 'conversion',
        amount: fromAmount,
        currency: fromCurrency,
        status: 'completed',
        metadata: {
          to_amount: toAmount,
          to_currency: toCurrency,
          rate: rate
        }
      }
    ])
    .select()
    .single()

  if (transactionError) {
    console.error('Error creating conversion transaction:', {
      code: transactionError.code,
      message: transactionError.message,
      details: transactionError.details,
      hint: transactionError.hint
    })
    return null
  }

  console.log('Created transaction:', transaction)

  // Update wallet balances
  const { error: updateError } = await supabase
    .from('wallets')
    .update({
      usd_balance: newUsdBalance,
      cad_balance: newCadBalance
    })
    .eq('id', walletId)

  if (updateError) {
    console.error('Error updating wallet balances:', {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint
    })
    return null
  }

  console.log('Successfully updated wallet balances')
  return transaction
} 