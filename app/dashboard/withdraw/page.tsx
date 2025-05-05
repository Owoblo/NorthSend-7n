'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getWallets, type Wallet } from '@/lib/wallet'
import { processCadWithdrawal, getAvailablePaymentMethods, getMinimumAmount, type PaymentMethod } from '@/lib/payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Mail, Building2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function WithdrawPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<'INTERAC' | 'BANK_TRANSFER'>('INTERAC')
  const [interacEmail, setInteracEmail] = useState('')
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [accountDetails, setAccountDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    routingNumber: '',
    email: '',
    additionalInfo: ''
  })

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
        // Set default Interac email from user profile
        setInteracEmail(user.email || '')
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  const getCadWallet = () => {
    return wallets.find(w => w.currency === 'CAD')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleEmailChange = async () => {
    if (!interacEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interacEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsVerifying(true)
    try {
      await sendVerificationCode(interacEmail)
      toast.success('Verification code sent')
      setIsChangingEmail(false)
      setIsVerifying(true)
    } catch (err) {
      toast.error('Failed to send verification code')
      setIsVerifying(false)
    }
  }

  const handleVerification = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code')
      return
    }

    try {
      const verified = await verifyEmailCode(interacEmail, verificationCode)
      if (verified) {
        toast.success('Email verified successfully')
        setIsVerifying(false)
        setVerificationCode('')
      } else {
        toast.error('Invalid verification code')
      }
    } catch (err) {
      toast.error('Failed to verify email')
    }
  }

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const cadWallet = getCadWallet()
    if (!cadWallet) {
      toast.error('CAD wallet not found')
      return
    }

    if (parseFloat(amount) > cadWallet.balance) {
      toast.error('Insufficient balance')
      return
    }

    setProcessing(true)
    try {
      const { success, error } = await processCadWithdrawal(
        cadWallet.id,
        parseFloat(amount),
        selectedMethod,
        selectedMethod === 'INTERAC' 
          ? { email: interacEmail }
          : {
              accountName: accountDetails.accountName,
              accountNumber: accountDetails.accountNumber,
              bankName: accountDetails.bankName,
              routingNumber: accountDetails.routingNumber
            }
      )

      if (success) {
        toast.success('Withdrawal request submitted')
        router.push('/dashboard/transactions')
      } else {
        toast.error(error || 'Failed to process withdrawal')
      }
    } catch (err) {
      toast.error('Failed to process withdrawal')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const cadWallet = getCadWallet()
  const availableMethods = getAvailablePaymentMethods('CAD')

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

        <h1 className="text-3xl font-bold mb-8">Withdraw CAD</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Withdrawal Methods */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Methods</CardTitle>
                <CardDescription>Choose how you want to withdraw CAD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    variant={selectedMethod === 'INTERAC' ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedMethod('INTERAC')}
                  >
                    <Mail className="h-6 w-6 mr-2" />
                    Interac e-Transfer
                  </Button>
                  <Button
                    variant={selectedMethod === 'BANK_TRANSFER' ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedMethod('BANK_TRANSFER')}
                  >
                    <Building2 className="h-6 w-6 mr-2" />
                    Bank Transfer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Withdrawal Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedMethod === 'INTERAC' ? 'Interac e-Transfer' : 'Bank Transfer'}
                </CardTitle>
                <CardDescription>
                  {selectedMethod === 'INTERAC' 
                    ? 'Withdraw CAD to your email via Interac e-Transfer'
                    : 'Withdraw CAD directly to your bank account'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Balance */}
                  <div className="space-y-2">
                    <Label>Current Balance</Label>
                    <p className="text-2xl font-bold">
                      ${cadWallet?.balance.toFixed(2) || '0.00'} CAD
                    </p>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (CAD)</Label>
                    <Input
                      id="amount"
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Interac Email */}
                  {selectedMethod === 'INTERAC' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Interac e-Transfer Email</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            readOnly={!isChangingEmail}
                            value={interacEmail}
                            onChange={(e) => setInteracEmail(e.target.value)}
                            className="bg-gray-50"
                          />
                          {!isChangingEmail && (
                            <Button
                              variant="outline"
                              onClick={() => setIsChangingEmail(true)}
                            >
                              Change
                            </Button>
                          )}
                        </div>
                      </div>

                      {isChangingEmail && (
                        <div className="space-y-4">
                          <Button
                            className="w-full"
                            onClick={handleEmailChange}
                          >
                            Send Verification Code
                          </Button>
                        </div>
                      )}

                      {isVerifying && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Verification Code</Label>
                            <Input
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="Enter verification code"
                            />
                          </div>
                          <Button
                            className="w-full"
                            onClick={handleVerification}
                          >
                            Verify Email
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank Transfer Details */}
                  {selectedMethod === 'BANK_TRANSFER' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Input
                          value={accountDetails.accountName}
                          onChange={(e) => setAccountDetails(prev => ({ ...prev, accountName: e.target.value }))}
                          placeholder="Enter account holder name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input
                          value={accountDetails.accountNumber}
                          onChange={(e) => setAccountDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                          placeholder="Enter account number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          value={accountDetails.bankName}
                          onChange={(e) => setAccountDetails(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="Enter bank name"
                        />
                      </div>

                      {selectedMethod === 'WIRE_TRANSFER' && (
                        <div className="space-y-2">
                          <Label>Routing Number</Label>
                          <Input
                            value={accountDetails.routingNumber}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                            placeholder="Enter routing number"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Withdraw Button */}
                  <Button
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    Withdraw CAD
                  </Button>

                  {/* Important Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li>• Minimum withdrawal amount: $10 CAD</li>
                      <li>• Interac e-Transfers are typically processed within 24 hours</li>
                      <li>• Bank transfers may take 1-2 business days</li>
                      <li>• Contact support if you don't receive your funds</li>
                    </ul>
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