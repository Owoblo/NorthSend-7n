'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function DepositSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'success' | 'processing' | 'error'>('processing')

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent')
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')
    const redirectStatus = searchParams.get('redirect_status')

    if (redirectStatus === 'succeeded') {
      setStatus('success')
    } else if (redirectStatus === 'processing') {
      setStatus('processing')
    } else {
      setStatus('error')
    }
  }, [searchParams])

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl">
              {status === 'success' && (
                <>
                  <CheckCircle2 className="h-8 w-8 text-green-500 mr-2" />
                  Deposit Successful
                </>
              )}
              {status === 'processing' && 'Processing Deposit'}
              {status === 'error' && 'Deposit Failed'}
            </CardTitle>
            <CardDescription className="text-center">
              {status === 'success' && 'Your deposit has been successfully processed'}
              {status === 'processing' && 'Your deposit is being processed. This may take a few minutes.'}
              {status === 'error' && 'There was an error processing your deposit. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 