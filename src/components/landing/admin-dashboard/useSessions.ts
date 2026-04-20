import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Session, SessionSummary } from './types'

const FIXED_SESSION_TIMES = ["06:00", "07:00", "08:00", "17:30", "18:30", "19:30"]

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const fetchSessions = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from('sessions').select('*').order('session_date', { ascending: true })

      if (startDate) {
        query = query.gte('session_date', startDate)
      }
      if (endDate) {
        query = query.lte('session_date', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      setSessions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
      console.error('Error fetching sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSessionsForDate = async (selectedDate: Date) => {
    try {
      setLoading(true)
      setError(null)

      const sessionDate = selectedDate.toISOString().split('T')[0]

      // Check for existing sessions on this date
      const { data: existingSessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_date', sessionDate)

      const existingTimes = new Set(existingSessions?.map(s => s.session_time) || [])

      // Create new sessions for times that don't exist
      const sessionsToInsert = FIXED_SESSION_TIMES
        .filter(time => !existingTimes.has(time))
        .map(time => ({
          session_date: sessionDate,
          session_time: time,
          status: 'scheduled' as const,
          notified: false
        }))

      if (sessionsToInsert.length > 0) {
        const { data, error } = await supabase
          .from('sessions')
          .insert(sessionsToInsert)
          .select()

        if (error) throw error

        // Update local state
        setSessions(prev => [...prev, ...(data || [])])

        // Trigger n8n webhook
        await triggerN8nWebhook(sessionDate, 'scheduled')
      }

      return sessionsToInsert.length
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sessions')
      console.error('Error creating sessions:', err)
      return 0
    } finally {
      setLoading(false)
    }
  }

  const cancelSession = async (sessionId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? { ...session, status: 'cancelled' } : session
        )
      )

      // Trigger n8n webhook
      if (data) {
        await triggerN8nWebhook(data.session_date, 'cancelled')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel session')
      console.error('Error cancelling session:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const cancelAllSessionsForDate = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sessions')
        .update({ status: 'cancelled' })
        .eq('session_date', date)
        .eq('status', 'scheduled')
        .select()

      if (error) throw error

      // Update local state
      setSessions(prev =>
        prev.map(session =>
          session.session_date === date && session.status === 'scheduled'
            ? { ...session, status: 'cancelled' }
            : session
        )
      )

      // Trigger n8n webhook
      await triggerN8nWebhook(date, 'cancelled')

      return data?.length || 0
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel sessions')
      console.error('Error cancelling sessions:', err)
      return 0
    } finally {
      setLoading(false)
    }
  }

  const triggerN8nWebhook = async (sessionDate: string, type: 'scheduled' | 'cancelled') => {
    try {
      const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      if (!n8nUrl) {
        console.warn('NEXT_PUBLIC_N8N_WEBHOOK_URL is not set. Skipping webhook.')
        return
      }
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_date: sessionDate,
          type
        })
      })

      if (!response.ok) {
        console.warn('n8n webhook failed:', response.statusText)
      }
    } catch (err) {
      console.warn('Failed to trigger n8n webhook:', err)
    }
  }

  const getSessionSummaryForDate = (date: string): SessionSummary | null => {
    const dateSessions = sessions.filter(s => s.session_date === date)
    if (dateSessions.length === 0) return null

    const scheduled = dateSessions.filter(s => s.status === 'scheduled').length
    const cancelled = dateSessions.filter(s => s.status === 'cancelled').length

    return {
      date,
      totalSessions: dateSessions.length,
      scheduledSessions: scheduled,
      cancelledSessions: cancelled
    }
  }

  const getAllSessionSummaries = (): SessionSummary[] => {
    const dateGroups = sessions.reduce((acc, session) => {
      if (!acc[session.session_date]) {
        acc[session.session_date] = []
      }
      acc[session.session_date].push(session)
      return acc
    }, {} as Record<string, Session[]>)

    return Object.entries(dateGroups).map(([date, dateSessions]) => {
      const scheduled = dateSessions.filter(s => s.status === 'scheduled').length
      const cancelled = dateSessions.filter(s => s.status === 'cancelled').length

      return {
        date,
        totalSessions: dateSessions.length,
        scheduledSessions: scheduled,
        cancelledSessions: cancelled
      }
    })
  }

  useEffect(() => {
    setSessionSummaries(getAllSessionSummaries())
  }, [sessions])

  return {
    sessions,
    sessionSummaries,
    loading,
    error,
    fetchSessions,
    createSessionsForDate,
    cancelSession,
    cancelAllSessionsForDate,
    getSessionSummaryForDate,
    refreshSessions: () => fetchSessions()
  }
}