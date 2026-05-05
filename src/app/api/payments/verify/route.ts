import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, plan_id } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_id || !plan_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify Razorpay signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Fetch payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_gateway_id', razorpay_order_id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Calculate subscription dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + plan.duration_months)

    // Create subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id,
        plan_id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
        auto_renew: true,
      })
      .select()
      .single()

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }

    // Update payment with subscription_id
    await supabase
      .from('payments')
      .update({ subscription_id: subscription.id })
      .eq('id', payment.id)

    // Generate invoice
    const invoiceNumber = `INV-${String(Date.now()).slice(-6)}`
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        user_id,
        payment_id: payment.id,
        subscription_id: subscription.id,
        amount: payment.amount,
        tax: 0,
        total_amount: payment.amount,
        status: 'generated',
        generated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Invoice generation error:', invoiceError)
    }

    // Trigger n8n webhook for payment success notification
    try {
      const n8nUrl = process.env.NEXT_PUBLIC_N8N_PAYMENT_WEBHOOK_URL
      if (n8nUrl) {
        await fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id,
            payment_id: payment.id,
            invoice_id: invoice?.id,
            amount: payment.amount,
            plan_name: plan.name,
            invoice_number: invoiceNumber,
          }),
        })
      }
    } catch (webhookError) {
      console.warn('Failed to trigger n8n webhook:', webhookError)
    }

    return NextResponse.json({
      success: true,
      subscription_id: subscription.id,
      invoice_id: invoice?.id,
      invoice_number: invoiceNumber,
    })
  } catch (err: any) {
    console.error('Payment verification error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
