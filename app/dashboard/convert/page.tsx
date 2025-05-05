'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getWallets, createTransaction, updateWalletBalance, type Wallet } from '@/lib/wallet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRightLeft } from 'lucide-react'
import { toast } from 'sonner'

// Mock exchange rate - In production, this would come from an API
const USD_TO_CAD_RATE = 1.35

export default function ConvertPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [amount, setAmount] = useState('')

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
      } else {
        setWallets(wallets)
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  const getUsdWallet = () => {
    return wallets.find(w => w.currency === 'USD')
  }

  const getCadWallet = () => {
    return wallets.find(w => w.currency === 'CAD')
  }

  const handleConvert = async () => {
    const usdAmount = parseFloat(amount)
    if (isNaN(usdAmount) || usdAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const usdWallet = getUsdWallet()
    const cadWallet = getCadWallet()

    if (!usdWallet || !cadWallet) {
      toast.error('Wallet not found')
      return
    }

    if (usdAmount > usdWallet.balance) {
      toast.error('Insufficient USD balance')
      return
    }

    setConverting(true)
    try {
      // Create transaction record
      const { error: transactionError } = await createTransaction(
        usdWallet.id,
        'CONVERSION',
        usdAmount,
        'USD',
        'USD to CAD conversion',
        { cadAmount: usdAmount * USD_TO_CAD_RATE }
      )

      if (transactionError) {
        throw new Error('Failed to create transaction')
      }

      // Update USD wallet balance
      const { error: usdError } = await updateWalletBalance(
        usdWallet.id,
        -usdAmount
      )

      if (usdError) {
        throw new Error('Failed to update USD balance')
      }

      // Update CAD wallet balance
      const { error: cadError } = await updateWalletBalance(
        cadWallet.id,
        usdAmount * USD_TO_CAD_RATE
      )

      if (cadError) {
        throw new Error('Failed to update CAD balance')
      }

      toast.success('Conversion completed successfully')
      router.push('/dashboard')
    } catch (err) {
      console.error('Conversion error:', err)
      toast.error('Failed to complete conversion')
    } finally {
      setConverting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const usdWallet = getUsdWallet()
  const cadWallet = getCadWallet()
  const cadAmount = parseFloat(amount) * USD_TO_CAD_RATE || 0

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8">Convert USD to CAD</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Currency Conversion</CardTitle>
            <CardDescription>
              Convert your USD balance to CAD at the current exchange rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>USD Amount</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter USD amount"
                  />
                  <span className="text-gray-500">USD</span>
                </div>
                <p className="text-sm text-gray-500">
                  Available: ${usdWallet?.balance.toFixed(2) || '0.00'} USD
                </p>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRightLeft className="h-6 w-6 text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label>CAD Amount</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={cadAmount.toFixed(2)}
                    className="bg-gray-50"
                  />
                  <span className="text-gray-500">CAD</span>
                </div>
                <p className="text-sm text-gray-500">
                  Rate: 1 USD = {USD_TO_CAD_RATE.toFixed(2)} CAD
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleConvert}
                disabled={converting || !amount || parseFloat(amount) <= 0}
              >
                {converting ? 'Converting...' : 'Convert Currency'}
              </Button>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
                <h3 className="font-medium mb-2">Important Information</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Exchange rate is updated daily</li>
                  <li>Minimum conversion amount: $10 USD</li>
                  <li>Conversions are processed instantly</li>
                  <li>No conversion fees</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 