import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id, plan_id } = body

    if (!user_id || !plan_id) {
      return NextResponse.json({ error: 'user_id and plan_id are required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Create Razorpay order
    const options = {
      amount: plan.price * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        user_id,
        plan_id,
      },
    }

    const order = await razorpay.orders.create(options)

    // Create pending payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id,
        amount: plan.price,
        currency: 'INR',
        payment_method: 'razorpay',
        payment_gateway_id: order.id,
        status: 'pending',
      })

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 })
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      plan: plan,
    })
  } catch (err: any) {
    console.error('Payment initiation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
