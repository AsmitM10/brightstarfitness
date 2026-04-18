import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type SessionPayload = {
  action: 'scheduleAll' | 'toggleSession' | 'cancelAll'
  session_date: string
  session_time?: string
  status?: 'scheduled' | 'cancelled'
  meeting_link?: string | null
  sessions?: Array<{
    session_date: string
    session_time: string
    status: 'scheduled' | 'cancelled'
    meeting_link?: string | null
    notified: boolean
  }>
}

export async function POST(req: Request) {
  try {
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

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('Session API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
