'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface AttendanceSummary {
  user_id: string
  username: string
  registration_date: string
  last_date: string
  total_sessions: number
  attended: number
  missed: number
  attendance_percentage: number
}

interface AttendanceRecord {
  id: string
  user_id: string
  session_id: string
  status: 'attended' | 'missed'
  joined_at?: string
  session?: {
    session_date: string
    session_time: string
    status: string
    meeting_link?: string
  }
  user?: {
    username: string
  }
}

export const AttendanceSection: React.FC = () => {
  const [view, setView] = useState<'summary' | 'detail'>('summary')
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AttendanceSummary | null>(null)

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchSummaries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ summary: 'true' })
      if (startDate) params.set('start_date', startDate)
      if (endDate) params.set('end_date', endDate)

      const res = await fetch(`/api/attendance?${params}`)
      const data = await res.json()
      if (res.ok) {
        setSummaries(data.summaries || [])
      }
    } catch (err) {
      console.error('Error fetching attendance summaries:', err)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  const fetchUserRecords = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ user_id: userId, limit: '100' })
      if (startDate) params.set('start_date', startDate)
      if (endDate) params.set('end_date', endDate)

      const res = await fetch(`/api/attendance?${params}`)
      const data = await res.json()
      if (res.ok) {
        setRecords(data.records || [])
      }
    } catch (err) {
      console.error('Error fetching user records:', err)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    if (view === 'summary') fetchSummaries()
  }, [fetchSummaries, view])

  const viewUserDetail = (user: AttendanceSummary) => {
    setSelectedUser(user)
    setView('detail')
    fetchUserRecords(user.user_id)
  }

  const backToSummary = () => {
    setSelectedUser(null)
    setView('summary')
  }

  const filteredSummaries = summaries.filter(s =>
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort helpers
  const mostActive = [...filteredSummaries].sort((a, b) => b.attendance_percentage - a.attendance_percentage).slice(0, 5)
  const lowAttendance = [...filteredSummaries].sort((a, b) => a.attendance_percentage - b.attendance_percentage).slice(0, 5)

  const avgRate = filteredSummaries.length > 0
    ? Math.round(filteredSummaries.reduce((sum, s) => sum + s.attendance_percentage, 0) / filteredSummaries.length)
    : 0

  const isActive = (lastDate: string) => new Date(lastDate) > new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {view === 'detail' && selectedUser ? (
            <div className="flex items-center gap-3">
              <button onClick={backToSummary} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{selectedUser.username}</h1>
                <p className="text-sm text-gray-500">Attendance Details</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800">Attendance Tracking</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor user-wise session attendance</p>
            </>
          )}
        </div>
      </div>

      {view === 'summary' && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredSummaries.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Avg Attendance</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">{avgRate}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Most Active</p>
              <p className="text-lg font-bold text-green-600 mt-1 truncate">
                {mostActive[0]?.username || '—'}
              </p>
              {mostActive[0] && <p className="text-xs text-gray-500">{mostActive[0].attendance_percentage}% rate</p>}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Needs Attention</p>
              <p className="text-lg font-bold text-red-600 mt-1 truncate">
                {lowAttendance.find(u => u.attendance_percentage < 50)?.username || '—'}
              </p>
              {lowAttendance[0] && lowAttendance[0].attendance_percentage < 50 && (
                <p className="text-xs text-gray-500">{lowAttendance[0].attendance_percentage}% rate</p>
              )}
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">🏆 Most Active Users</h3>
              <div className="space-y-2">
                {mostActive.map((u, i) => (
                  <div key={u.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}>{i + 1}</span>
                      <span className="text-sm text-gray-800">{u.username}</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{u.attendance_percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">⚠️ Low Attendance Users</h3>
              <div className="space-y-2">
                {lowAttendance.filter(u => u.total_sessions > 0).map((u, i) => (
                  <div key={u.user_id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-800">{u.username}</span>
                    <span className={`text-sm font-semibold ${
                      u.attendance_percentage < 30 ? 'text-red-600' : 'text-yellow-600'
                    }`}>{u.attendance_percentage}%</span>
                  </div>
                ))}
                {lowAttendance.filter(u => u.total_sessions > 0).length === 0 && (
                  <p className="text-sm text-gray-500">No data yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Search User</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm('') }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-3 text-sm text-gray-500">Loading attendance data...</p>
              </div>
            ) : filteredSummaries.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg font-medium">No attendance data</p>
                <p className="text-sm mt-1">Attendance will appear here once sessions are tracked.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Sessions</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Attended</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Missed</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSummaries.map(user => (
                      <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            isActive(user.last_date) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isActive(user.last_date) ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{user.total_sessions}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">{user.attended}</td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">{user.missed}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  user.attendance_percentage >= 70 ? 'bg-green-500' :
                                  user.attendance_percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${user.attendance_percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{user.attendance_percentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => viewUserDetail(user)}
                            className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail View */}
      {view === 'detail' && selectedUser && (
        <>
          {/* User Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{selectedUser.total_sessions}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Attended</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{selectedUser.attended}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Missed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{selectedUser.missed}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">{selectedUser.attendance_percentage}%</p>
            </div>
          </div>

          {/* Detail Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p>No attendance records found for this user.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map(record => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.session?.session_date
                            ? new Date(record.session.session_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.session?.session_time || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'attended' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status === 'attended' ? 'Attended' : 'Missed'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {record.joined_at
                            ? new Date(record.joined_at).toLocaleString('en-IN')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
