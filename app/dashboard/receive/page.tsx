'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getWallets, type Wallet } from '@/lib/wallet'
import { createUsdPaymentIntent, processUsdDeposit, getAvailablePaymentMethods, getMinimumAmount, getRequiredFields, type PaymentMethod } from '@/lib/payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Copy, CheckCircle2, CreditCard, Building2, Wallet as WalletIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PayPalButtons } from "@paypal/react-paypal-js"

// Payment method configurations
const PAYMENT_METHODS = {
  PAYPAL: {
    name: 'PayPal',
    icon: <WalletIcon className="h-6 w-6" />,
    description: 'Send money via PayPal',
    details: {
      type: 'email',
      label: 'PayPal Email',
      value: process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL || 'your-paypal@email.com', // Replace with your PayPal business email
      copyText: 'Copy PayPal Email',
      instructions: [
        'Share this email with the sender',
        'They can send money via PayPal',
        'Make sure they include your NorthSend email in the note',
        'Payment will be credited to your account within 24 hours'
      ]
    }
  },
  BANK_TRANSFER: {
    name: 'Bank Transfer',
    icon: <Building2 className="h-6 w-6" />,
    description: 'Send money via ACH or Wire Transfer',
    details: {
      type: 'bank',
      label: 'Bank Details',
      value: {
        accountName: 'NorthSend Inc.',
        accountNumber: '1234567890',
        routingNumber: '987654321',
        bankName: 'Chase Bank'
      },
      copyText: 'Copy Bank Details',
      instructions: [
        'Share these bank details with the sender',
        'They can send money via ACH (1-2 business days) or Wire (same day)',
        'Make sure they include your NorthSend email in the reference',
        'Wire transfers are credited same day, ACH within 1-2 business days'
      ]
    }
  },
  CASHAPP: {
    name: 'Cash App',
    icon: <WalletIcon className="h-6 w-6" />,
    description: 'Send money via Cash App',
    details: {
      type: 'username',
      label: 'Cash App Username',
      value: '$northsend', // Replace with your Cash App username
      copyText: 'Copy Username',
      instructions: [
        'Share this username with the sender',
        'They can send money via Cash App',
        'Make sure they include your NorthSend email in the note',
        'Payment will be credited to your account within 24 hours'
      ]
    }
  },
  ZELLE: {
    name: 'Zelle',
    icon: <WalletIcon className="h-6 w-6" />,
    description: 'Send money via Zelle',
    details: {
      type: 'email',
      label: 'Zelle Email',
      value: 'payments@northsend.com', // Replace with your Zelle email
      copyText: 'Copy Zelle Email',
      instructions: [
        'Share this email with the sender',
        'They can send money via Zelle through their bank',
        'Make sure they include your NorthSend email in the memo',
        'Payment will be credited to your account within 24 hours'
      ]
    }
  }
}

export default function ReceivePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [selectedMethod, setSelectedMethod] = useState<keyof typeof PAYMENT_METHODS>('PAYPAL')
  const [copied, setCopied] = useState(false)
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

  const handleCopy = (text: string | { accountName: string; accountNumber: string; routingNumber: string; bankName: string }) => {
    const textToCopy = typeof text === 'string' ? text : JSON.stringify(text)
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  const handlePayPalPayment = async (data: any, actions: any) => {
    try {
      const order = await actions.order.create({
        purchase_units: [
          {
            amount: {
              value: amount,
              currency_code: "USD"
            }
          }
        ]
      })
      return order
    } catch (err) {
      console.error('PayPal order creation error:', err)
      toast.error('Failed to create PayPal order')
    }
  }

  const handlePayPalApprove = async (data: any, actions: any) => {
    try {
      const order = await actions.order.capture()
      // Process the payment
      const { success, error } = await processUsdDeposit(
        usdWallet.id,
        parseFloat(amount),
        order.id,
        'PAYPAL'
      )

      if (success) {
        toast.success('Payment received successfully')
        router.push('/dashboard/receive/success')
      } else {
        toast.error(error || 'Failed to process payment')
      }
    } catch (err) {
      console.error('PayPal payment error:', err)
      toast.error('Payment failed')
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
  const selectedPaymentMethod = PAYMENT_METHODS[selectedMethod]

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

        <h1 className="text-3xl font-bold mb-8">Receive USD</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Payment Methods */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Choose how you want to receive USD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                    <Button
                      key={key}
                      variant={selectedMethod === key ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedMethod(key as keyof typeof PAYMENT_METHODS)}
                    >
                      {method.icon}
                      <span className="ml-2">{method.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{selectedPaymentMethod.name}</CardTitle>
                <CardDescription>{selectedPaymentMethod.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Balance */}
                  <div className="space-y-2">
                    <Label>Current Balance</Label>
                    <p className="text-2xl font-bold">
                      ${usdWallet?.balance.toFixed(2) || '0.00'} USD
                    </p>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <Label>{selectedPaymentMethod.details.label}</Label>
                    
                    {selectedMethod === 'PAYPAL' && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            readOnly
                            value={selectedPaymentMethod.details.value}
                            className="bg-gray-50"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopy(selectedPaymentMethod.details.value)}
                          >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedPaymentMethod.details.type === 'bank' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Account Name</Label>
                            <Input
                              readOnly
                              value={selectedPaymentMethod.details.value.accountName}
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <Label>Bank Name</Label>
                            <Input
                              readOnly
                              value={selectedPaymentMethod.details.value.bankName}
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Account Number</Label>
                            <Input
                              readOnly
                              value={selectedPaymentMethod.details.value.accountNumber}
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <Label>Routing Number</Label>
                            <Input
                              readOnly
                              value={selectedPaymentMethod.details.value.routingNumber}
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleCopy(selectedPaymentMethod.details.value)}
                        >
                          {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                          {selectedPaymentMethod.details.copyText}
                        </Button>
                      </div>
                    )}

                    {selectedPaymentMethod.details.type === 'username' && (
                      <div className="flex items-center space-x-2">
                        <Input
                          readOnly
                          value={selectedPaymentMethod.details.value}
                          className="bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(selectedPaymentMethod.details.value)}
                        >
                          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">How to Receive Money</h3>
                      <ul className="text-sm text-blue-800 space-y-2">
                        {selectedPaymentMethod.details.instructions.map((instruction, index) => (
                          <li key={index}>• {instruction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Coming Soon Section */}
                  <div className="border-t pt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Coming Soon</h3>
                      <p className="text-sm text-gray-600">
                        We're working on adding more ways to receive money, including:
                      </p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• Credit/Debit Card Funding</li>
                        <li>• Apple Pay</li>
                        <li>• Google Pay</li>
                        <li>• More payment methods</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 