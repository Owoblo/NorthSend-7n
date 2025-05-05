"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getWallets, type Wallet } from '@/lib/wallet'
import { getWithdrawalHistory } from '@/lib/payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

type Transaction = {
  id: string
  type: 'DEPOSIT' | 'WITHDRAWAL'
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  created_at: string
  payment_method: string
  description: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const loadData = async () => {
      const { user, error: authError } = await getCurrentUser()
      
      if (authError || !user) {
        console.error('Auth error:', authError)
        router.push('/login')
        return
      }

      // Fetch wallets
      const { wallets, error: walletsError } = await getWallets(user.id)
      if (walletsError) {
        console.error('Error fetching wallets:', walletsError)
        setError('Failed to load wallet data')
      } else {
        setWallets(wallets)
        
        // Fetch transactions for each wallet
        const allTransactions = await Promise.all(
          wallets.map(async (wallet) => {
            const history = await getWithdrawalHistory(wallet.id)
            return history
          })
        )
        
        setTransactions(allTransactions.flat().sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getTransactionIcon = (type: string) => {
    return type === 'DEPOSIT' 
      ? <ArrowDownLeft className="h-5 w-5 text-green-500" />
      : <ArrowUpRight className="h-5 w-5 text-red-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8">Transaction History</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>View your deposit and withdrawal history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No transactions yet</p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {transaction.type === 'DEPOSIT' ? '+' : '-'}
                        {transaction.amount.toFixed(2)} {transaction.currency}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.payment_method}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <span className="text-sm capitalize">{transaction.status.toLowerCase()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 