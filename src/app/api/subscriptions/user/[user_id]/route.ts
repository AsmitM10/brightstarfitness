import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:payment_plans(name, duration_months, price, features)
      `)
      .eq('user_id', user_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ subscription: data || null })
  } catch (err: any) {
    console.error('User subscription GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
