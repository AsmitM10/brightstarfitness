import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    const sessionId = searchParams.get('session_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createSupabaseServerClient()

    // User-wise attendance summary
    if (searchParams.get('summary') === 'true') {
      const { data: users, error: usersError } = await supabase
        .from('user4')
        .select('id, username, whatsapp_no, registration_date, last_date')
        .order('username')

      if (usersError) {
        return NextResponse.json({ error: usersError.message }, { status: 500 })
      }

      let sessionsQuery = supabase
        .from('sessions')
        .select('id, session_date')
        .eq('status', 'scheduled')

      if (startDate) sessionsQuery = sessionsQuery.gte('session_date', startDate)
      if (endDate) sessionsQuery = sessionsQuery.lte('session_date', endDate)

      const { data: allSessions } = await sessionsQuery

      const { data: allAttendance } = await supabase
        .from('session_attendance')
        .select('user_id, session_id, status')

      const sessionIds = new Set((allSessions || []).map(s => s.id))
      const attendanceMap = new Map<string, { attended: number; total: number }>()

      for (const user of (users || [])) {
        attendanceMap.set(user.id, { attended: 0, total: 0 })
      }

      for (const att of (allAttendance || [])) {
        if (!sessionIds.has(att.session_id)) continue
        const entry = attendanceMap.get(att.user_id)
        if (entry) {
          entry.total++
          if (att.status === 'attended') entry.attended++
        }
      }

      const summaries = (users || []).map(user => {
        const entry = attendanceMap.get(user.id) || { attended: 0, total: 0 }
        const totalSessions = allSessions?.length || 0
        return {
          user_id: user.id,
          username: user.username,
          registration_date: user.registration_date,
          last_date: user.last_date,
          total_sessions: totalSessions,
          attended: entry.attended,
          missed: totalSessions - entry.attended,
          attendance_percentage: totalSessions > 0
            ? Math.round((entry.attended / totalSessions) * 100)
            : 0,
        }
      })

      return NextResponse.json({ summaries })
    }

    // Individual records
    let query = supabase
      .from('session_attendance')
      .select('*, session:sessions(*), user:user4(username, whatsapp_no, userpage_slug)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (userId) query = query.eq('user_id', userId)
    if (sessionId) query = query.eq('session_id', sessionId)

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If filtering by date, filter after join
    let filtered = data || []
    if (startDate || endDate) {
      filtered = filtered.filter((row: any) => {
        const sessionDate = row.session?.session_date
        if (!sessionDate) return false
        if (startDate && sessionDate < startDate) return false
        if (endDate && sessionDate > endDate) return false
        return true
      })
    }

    return NextResponse.json({
      records: filtered,
      total: count || 0,
      page,
      limit,
    })
  } catch (err: any) {
    console.error('Attendance GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, user_id, session_id, status } = body
    const supabase = createSupabaseServerClient()

    if (action === 'mark') {
      if (!user_id || !session_id || !status) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('session_attendance')
        .upsert(
          {
            user_id,
            session_id,
            status,
            joined_at: status === 'attended' ? new Date().toISOString() : null,
          },
          { onConflict: 'user_id,session_id' }
        )
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    if (action === 'bulk_mark') {
      const { records } = body
      if (!records || !Array.isArray(records)) {
        return NextResponse.json({ error: 'Missing records array' }, { status: 400 })
      }

      const { error } = await supabase
        .from('session_attendance')
        .upsert(records, { onConflict: 'user_id,session_id' })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const { id } = body
      if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      }

      const { error } = await supabase
        .from('session_attendance')
        .delete()
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('Attendance POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
