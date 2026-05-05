import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('is_active', true)
      .order('duration_months', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ plans: data || [] })
  } catch (err: any) {
    console.error('Payment plans GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
