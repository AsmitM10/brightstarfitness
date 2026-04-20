import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/auth'

type SessionPayload = {
  action: 'scheduleAll' | 'toggleSession' | 'cancelAll' | 'delete' | 'update'
  session_date: string
  session_time?: string
  status?: 'scheduled' | 'cancelled'
  meeting_link?: string | null
  session_id?: string
  sessions?: Array<{
    session_date: string
    session_time: string
    status: 'scheduled' | 'cancelled'
    meeting_link?: string | null
    notified: boolean
  }>
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createSupabaseServerClient()
    let query = supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .order('session_date', { ascending: false })
      .order('session_time', { ascending: true })

    if (startDate) query = query.gte('session_date', startDate)
    if (endDate) query = query.lte('session_date', endDate)
    if (status && status !== 'all') query = query.eq('status', status)

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      sessions: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (err: any) {
    console.error('Session GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdminAuth()
    if (authError) return authError

    const body = (await req.json()) as SessionPayload
    const supabase = createSupabaseServerClient()

    if (body.action === 'scheduleAll') {
      if (!body.sessions || body.sessions.length === 0) {
        return NextResponse.json({ error: 'No sessions provided' }, { status: 400 })
      }

      const { error } = await supabase.from('sessions').upsert(body.sessions, {
        onConflict: 'session_date,session_time',
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (body.action === 'toggleSession') {
      if (!body.session_date || !body.session_time || !body.status) {
        return NextResponse.json({ error: 'Missing session data' }, { status: 400 })
      }

      const { error } = await supabase.from('sessions').upsert(
        {
          session_date: body.session_date,
          session_time: body.session_time,
          status: body.status,
          meeting_link: body.meeting_link || null,
          notified: false,
        },
        { onConflict: 'session_date,session_time' },
      )

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (body.action === 'cancelAll') {
      if (!body.session_date) {
        return NextResponse.json({ error: 'Missing session_date' }, { status: 400 })
      }

      const { error } = await supabase
        .from('sessions')
        .update({ status: 'cancelled' })
        .eq('session_date', body.session_date)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (body.action === 'update') {
      if (!body.session_id) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
      }

      const updateData: Record<string, any> = {}
      if (body.status) updateData.status = body.status
      if (body.meeting_link !== undefined) updateData.meeting_link = body.meeting_link
      if (body.session_date) updateData.session_date = body.session_date
      if (body.session_time) updateData.session_time = body.session_time

      const { error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', body.session_id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (body.action === 'delete') {
      if (!body.session_id) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
      }

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', body.session_id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('Session API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
