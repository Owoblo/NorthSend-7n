"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getWallets, getRecentTransactions, type Wallet, type Transaction } from '@/lib/wallet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const checkAuth = async () => {
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
        setLoading(false)
        return
      }
      setWallets(wallets)

      // Fetch recent transactions
      const { transactions: recentTransactions, error: transactionsError } = await getRecentTransactions(user.id)
      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError)
        setError('Failed to load transaction history')
      } else {
        setTransactions(recentTransactions)
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  const getWalletBalance = (currency: 'USD' | 'CAD') => {
    const wallet = wallets.find(w => w.currency === currency)
    return wallet ? wallet.balance : 0
  }

  const formatCurrency = (amount: number, currency: 'USD' | 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'WITHDRAWAL':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'CONVERSION':
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
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
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>USD Balance</CardTitle>
            <CardDescription>Your USD wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(getWalletBalance('USD'), 'USD')}
            </div>
            <div className="mt-4 space-x-4">
              <Button onClick={() => router.push('/dashboard/receive')}>
                Receive USD
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/convert')}>
                Convert to CAD
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CAD Balance</CardTitle>
            <CardDescription>Your CAD wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(getWalletBalance('CAD'), 'CAD')}
            </div>
            <div className="mt-4">
              <Button onClick={() => router.push('/dashboard/withdraw')}>
                Withdraw CAD
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest account activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No recent transactions</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium capitalize">{transaction.type.toLowerCase()}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{transaction.status.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
