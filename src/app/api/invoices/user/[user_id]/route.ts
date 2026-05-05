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
      .from('invoices')
      .select('*')
      .eq('user_id', user_id)
      .order('generated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invoices: data || [] })
  } catch (err: any) {
    console.error('User invoices GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
