import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id, payment_id, subscription_id } = body

    if (!user_id || !payment_id) {
      return NextResponse.json({ error: 'user_id and payment_id are required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Fetch payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, user:user4(username, whatsapp_no, email)')
      .eq('id', payment_id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Generate invoice number
    const invoiceNumber = `INV-${String(Date.now()).slice(-6)}`

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        user_id,
        payment_id,
        subscription_id: subscription_id || null,
        amount: payment.amount,
        tax: 0,
        total_amount: payment.amount,
        status: 'generated',
        generated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // TODO: Generate PDF invoice and upload to Supabase Storage
    // This would require a PDF generation library like jsPDF or puppeteer
    // For now, we'll just return the invoice record

    return NextResponse.json({
      success: true,
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
    })
  } catch (err: any) {
    console.error('Invoice generation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
