import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const authError = await requireAdminAuth()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('payments')
      .select(`
        *,
        user:user4(username, whatsapp_no, email),
        subscription:user_subscriptions(
          plan:payment_plans(name)
        ),
        invoice:invoices(invoice_number, status)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      payments: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (err: any) {
    console.error('Admin payments GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdminAuth()
    if (authError) return authError

    const body = await req.json()
    const { action, payment_id } = body

    const supabase = createSupabaseServerClient()

    if (action === 'approve') {
      if (!payment_id) {
        return NextResponse.json({ error: 'payment_id is required' }, { status: 400 })
      }

      // Fetch payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment_id)
        .single()

      if (paymentError || !payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString(),
        })
        .eq('id', payment_id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Create subscription (if not exists)
      if (!payment.subscription_id) {
        // TODO: Create subscription based on plan
        // This would need plan_id from payment notes or separate logic
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'reject') {
      if (!payment_id) {
        return NextResponse.json({ error: 'payment_id is required' }, { status: 400 })
      }

      const { error } = await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment_id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('Admin payments POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
