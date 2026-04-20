import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/auth'

type HolidayPayload = {
  action: 'add' | 'get'
  start_date?: string
  end_date?: string
  reason?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HolidayPayload
    const supabase = createSupabaseServerClient()

    if (body.action === 'add') {
      // Verify admin authentication for adding holidays
      const authError = await requireAdminAuth()
      if (authError) return authError

      if (!body.start_date || !body.end_date || !body.reason) {
        return NextResponse.json({ error: 'Missing holiday data' }, { status: 400 })
      }

      const { error } = await supabase.from('holidays').insert({
        start_date: body.start_date,
        end_date: body.end_date,
        reason: body.reason,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (body.action === 'get') {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ holidays: data })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('Holiday API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}