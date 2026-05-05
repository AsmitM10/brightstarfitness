import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const authError = await requireAdminAuth()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('invoices')
      .select(`
        *,
        user:user4(username, whatsapp_no, email),
        payment:payments(amount, status, paid_at),
        subscription:user_subscriptions(
          plan:payment_plans(name)
        )
      `, { count: 'exact' })
      .order('generated_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      invoices: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (err: any) {
    console.error('Admin invoices GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdminAuth()
    if (authError) return authError

    const body = await req.json()
    const { action, invoice_id, user_id, amount, description } = body

    const supabase = createSupabaseServerClient()

    if (action === 'resend') {
      if (!invoice_id) {
        return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 })
      }

      // Fetch invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, user:user4(chat_id)')
        .eq('id', invoice_id)
        .single()

      if (invoiceError || !invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      // Trigger n8n webhook to resend invoice
      try {
        const n8nUrl = process.env.NEXT_PUBLIC_N8N_PAYMENT_WEBHOOK_URL
        if (n8nUrl && invoice.user?.chat_id) {
          await fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'resend_invoice',
              invoice_id: invoice.id,
              invoice_number: invoice.invoice_number,
              user_id: invoice.user_id,
              amount: invoice.total_amount,
              chat_id: invoice.user.chat_id,
            }),
          })
        }
      } catch (webhookError) {
        console.warn('Failed to trigger n8n webhook:', webhookError)
      }

      // Update invoice status
      await supabase
        .from('invoices')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', invoice_id)

      return NextResponse.json({ success: true })
    }

    if (action === 'generate') {
      if (!user_id || !amount) {
        return NextResponse.json({ error: 'user_id and amount are required' }, { status: 400 })
      }

      // Generate invoice number
      const invoiceNumber = `INV-${String(Date.now()).slice(-6)}`

      // Create manual invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          user_id,
          amount,
          tax: 0,
          total_amount: amount,
          status: 'generated',
          generated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (invoiceError) {
        return NextResponse.json({ error: invoiceError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, invoice_id: invoice.id, invoice_number })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('Admin invoices POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
