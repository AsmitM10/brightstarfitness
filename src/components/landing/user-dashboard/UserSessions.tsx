'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Session } from '../admin-dashboard/types'

// Utility function to check if a session is ongoing (within 1 hour of start time)
const isSessionOngoing = (sessionDate: string, sessionTime: string): boolean => {
  const now = new Date()
  const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`)
  
  const oneHourAfterStart = new Date(sessionDateTime.getTime() + 60 * 60 * 1000)
  
  return now >= sessionDateTime && now <= oneHourAfterStart
}

// Utility function to check if session time has been reached
const isSessionTimeReached = (sessionDate: string, sessionTime: string): boolean => {
  const now = new Date()
  const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`)
  return now >= sessionDateTime
}

// Utility function to filter sessions within next 7 days
const filterSessionsWithin7Days = (sessions: Session[]): Session[] => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  const sevenDaysLater = new Date(now)
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
  sevenDaysLater.setHours(23, 59, 59, 999)
  
  return sessions.filter(session => {
    const sessionDate = new Date(session.session_date)
    sessionDate.setHours(0, 0, 0, 0)
    
    // Include session if:
    // 1. It's within the next 7 days
    // 2. OR it's today and time has been reached/passed
    const isWithin7Days = sessionDate >= now && sessionDate <= sevenDaysLater
    const isTodayAndTimeReached = sessionDate.getTime() === now.getTime() && isSessionTimeReached(session.session_date, session.session_time)
    
    return isWithin7Days || isTodayAndTimeReached
  })
}

// Utility function to sort sessions by date and time ascending
const sortSessionsByDateTime = (sessions: Session[]): Session[] => {
  return [...sessions].sort((a, b) => {
    const dateCompare = a.session_date.localeCompare(b.session_date)
    if (dateCompare !== 0) return dateCompare
    return a.session_time.localeCompare(b.session_time)
  })
}

export const UserSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/sessions')
      const data = await res.json()
      
      if (res.ok) {
        const allSessions = data.sessions || []
        // Filter to only show sessions within next 7 days or already reached
        const filteredSessions = filterSessionsWithin7Days(allSessions)
        // Sort by date and time ascending
        const sortedSessions = sortSessionsByDateTime(filteredSessions)
        setSessions(sortedSessions)
      } else {
        setError(data.error || 'Failed to fetch sessions')
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError('Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Real-time polling every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions()
    }, 45000) // 45 seconds

    return () => clearInterval(interval)
  }, [fetchSessions])

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Sessions</h1>
        <p className="text-sm text-gray-500 mt-1">View your upcoming yoga sessions (next 7 days)</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm text-gray-500">Loading sessions...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">
            <p className="text-lg font-medium">Error loading sessions</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">No sessions scheduled</p>
            <p className="text-sm mt-1">Check back later for upcoming sessions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Meeting Link</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map(session => {
                  const isOngoing = isSessionOngoing(session.session_date, session.session_time)
                  const isScheduled = session.status === 'scheduled'
                  const hasValidLink = session.meeting_link && isValidUrl(session.meeting_link)
                  
                  return (
                    <tr 
                      key={session.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        isOngoing ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {formatDate(session.session_date)}
                        {isOngoing && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                            Live
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{session.session_time}</td>
                      <td className="px-4 py-3 text-sm">
                        {isScheduled && hasValidLink ? (
                          <a 
                            href={session.meeting_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-teal-600 hover:underline truncate block max-w-[200px]"
                          >
                            {session.meeting_link}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          session.status === 'scheduled'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      {!loading && !error && sessions.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Sessions auto-refresh every 45 seconds
        </p>
      )}
    </div>
  )
}
