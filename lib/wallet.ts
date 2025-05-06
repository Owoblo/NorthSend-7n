import { supabase } from './auth'

export interface Wallet {
  id: string
  user_id: string
  currency: string
  balance: number
  created_at: string
}

export async function getWallets(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
  
  return { data, error }
}

export async function getWalletBalance(walletId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance')
    .eq('id', walletId)
    .single()
  
  return { data, error }
}

export async function updateWalletBalance(walletId: string, newBalance: number) {
  const { data, error } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', walletId)
  
  return { data, error }
}

export async function createTransaction(
  walletId: string,
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'CONVERSION',
  amount: number,
  currency: string,
  description?: string,
  metadata?: any
) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      wallet_id: walletId,
      type,
      amount,
      currency,
      status: 'COMPLETED',
      description,
      metadata
    }])
    .select()
    .single()
  
  return { data, error }
} 