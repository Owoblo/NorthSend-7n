import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const headersList = headers()
    const paypalSignature = headersList.get('paypal-transmission-sig')
    
    // Verify webhook signature (you'll need to implement this)
    // const isValid = await verifyPayPalWebhook(req.body, paypalSignature)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const body = await req.json()
    const event = body.event_type

    if (event === 'PAYMENT.CAPTURE.COMPLETED') {
      const payment = body.resource
      const amount = parseFloat(payment.amount.value)
      const payerEmail = payment.payer.email_address
      const note = payment.custom_id // This should contain the user's NorthSend email

      // Find the user's wallet
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', note)
        .single()

      if (!user) {
        console.error('User not found for email:', note)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Get user's USD wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', 'USD')
        .single()

      if (!wallet) {
        console.error('USD wallet not found for user:', user.id)
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
      }

      // Create transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'DEPOSIT',
          amount,
          currency: 'USD',
          status: 'COMPLETED',
          payment_method: 'PAYPAL',
          payment_details: {
            paypal_payment_id: payment.id,
            payer_email: payerEmail
          },
          description: `USD deposit via PayPal from ${payerEmail}`
        })

      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
      }

      // Update wallet balance
      const { error: balanceError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance + amount })
        .eq('id', wallet.id)

      if (balanceError) {
        console.error('Error updating wallet balance:', balanceError)
        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
} 