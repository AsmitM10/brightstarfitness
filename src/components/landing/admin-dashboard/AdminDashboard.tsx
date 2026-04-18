"use client"

import { useState, useEffect } from "react"
import { formatCalendarMonth, navigateMonth } from './calendarUtils'
import { calculateStats } from './statsCalculator'
import { generateChartData } from './chartGenerator'
import { UserData, ChartData } from './types'
import { Sidebar } from './Sidebar'
import { UserDropdown, ChangePasswordModal, ChangeProfilePictureModal, LogoutModal } from './modals'
import { StatsCard, ChartSection } from './DashboardComponents'
import { UsersTable } from './UsersTable'
import { CalendarGrid, MiniCalendar } from './CalendarComponents'
import { HolidayModal } from './HolidayModal'
import { HolidayPreviewModal } from './HolidayPreviewModal'
import { SessionSchedulingModal } from './modals'
import { UsersIcon, UserIcon, ChartIcon, ClockIcon } from './icons'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Search, Bell } from "lucide-react"
interface Session {
  id: string
  session_date: string
  session_time: string
  status: 'scheduled' | 'cancelled'
  meeting_link?: string
  notified: boolean
  created_at?: string
  updated_at?: string
}

// Transform Supabase user data to match UserData interface
const transformSupabaseUser = (user: any): UserData => {
  const regDate = new Date(user.registration_date)
  const today = new Date()
  const joinedDaysAgo = Math.floor((today.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24))

  // Parse attendance data from user4 table (P/A string or array)
  const attendanceRaw: string[] = []
  if (user.attendance) {
    if (typeof user.attendance === 'string') {
      attendanceRaw.push(...user.attendance.split(',').map((s: string) => s.trim().toUpperCase()))
    } else if (Array.isArray(user.attendance)) {
      attendanceRaw.push(...user.attendance.map((v: string) => String(v).trim().toUpperCase()))
    }
  }

  const attendance: ("present" | "absent" | "upcoming")[] = []
  for (let idx = 0; idx < 7; idx++) {
    const token = attendanceRaw[idx]
    if (token === 'P') {
      attendance.push('present')
    } else if (token === 'A') {
      attendance.push('absent')
    } else {
      attendance.push('upcoming')
    }
  }

  return {
    id: user.id,
    userId: user.id?.toString() || "",
    username: user.username || "Unknown",
    whatsapp: user.whatsapp_no || "N/A",
    regDate: regDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    lastDate: user.last_date ? new Date(user.last_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Never",
    attendance,
    joinedDaysAgo,
    email: user.email,
    name: user.username,
    status: user.status || "Active",
  }
}

// Safe date formatter - converts date to YYYY-MM-DD format (no timezone shift)
function toLocalDate(date: string | Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [selectedMonth, setSelectedMonth] = useState("August")
  const [selectedYear, setSelectedYear] = useState("2025")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [usersData, setUsersData] = useState<UserData[]>([])
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [holidayFromDate, setHolidayFromDate] = useState("")
  const [holidayToDate, setHolidayToDate] = useState("")
  const [holidayReason, setHolidayReason] = useState("")
  const [showHolidayPreviewModal, setShowHolidayPreviewModal] = useState(false)
  const [affectedUsers, setAffectedUsers] = useState<any[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showChangeProfilePictureModal, setShowChangeProfilePictureModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("All Users")

  const [totalUsers, setTotalUsers] = useState(0)
  const [totalUsersTrend, setTotalUsersTrend] = useState("0% Up")

  const [activeUsers, setActiveUsers] = useState(0)
  const [activeUsersTrend, setActiveUsersTrend] = useState("0% Up")

  const [attendanceRate, setAttendanceRate] = useState("0%")
  const [attendanceTrend, setAttendanceTrend] = useState("0% Up")

  const [newRegistrations, setNewRegistrations] = useState(0)
  const [newRegistrationsTrend, setNewRegistrationsTrend] = useState("0% Up")

  const [holidays, setHolidays] = useState<{ date: Date; name: string }[]>([
    { date: new Date(2025, 7, 9), name: "Rakshbandhan" },
    { date: new Date(2025, 7, 15), name: "Independence Day" },
    { date: new Date(2025, 7, 26), name: "Janmashtami" },
  ])
  const [sessions, setSessions] = useState<Session[]>([])
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [selectedSessionDate, setSelectedSessionDate] = useState<Date | null>(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [individualSessionLoading, setIndividualSessionLoading] = useState<{ [key: string]: boolean }>({})
  const [notifications, setNotifications] = useState<string[]>([])



  const SESSION_TIMES = ["06:30", "07:30", "08:30", "17:00", "18:00", "19:00"]

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]) // Keep only last 5 notifications
  }

  const computeGrowth = (todayValue: number, prevValue: number) => {
    if (prevValue === 0) {
      if (todayValue === 0) return "0% Up"
      return "100% Up"
    }
    const rate = ((todayValue - prevValue) / prevValue) * 100
    const direction = rate >= 0 ? "Up" : "Down"
    return `${Math.abs(rate).toFixed(1)}% ${direction}`
  }

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const dayBefore = new Date(today)
      dayBefore.setDate(today.getDate() - 2)

      const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      const yesterdayEnd = new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      const dayBeforeEnd = new Date(dayBefore.getTime() + 24 * 60 * 60 * 1000 - 1)

      const client = createSupabaseBrowserClient()

      // Total users now / yesterday / day before
      const [{ count: totalCount }, { count: totalYCount }, { count: totalPCount }] = await Promise.all([
        client.from("user4").select("*", { count: "exact", head: true }),
        client.from("user4").select("*", { count: "exact", head: true }).lt("registration_date", today.toISOString()),
        client.from("user4").select("*", { count: "exact", head: true }).lt("registration_date", yesterday.toISOString()),
      ])

      // Active users now / yesterday / day before
      const [{ count: activeCount }, { count: activeYCount }, { count: activePCount }] = await Promise.all([
        client.from("user4").select("*", { count: "exact", head: true }).gt("last_date", now.toISOString()),
        client.from("user4").select("*", { count: "exact", head: true }).gt("last_date", yesterdayEnd.toISOString()),
        client.from("user4").select("*", { count: "exact", head: true }).gt("last_date", dayBeforeEnd.toISOString()),
      ])

      // Ensure every active user with no yesterday attendance gets system 'A'
      const { data: activeUsersForAttendance } = await client
        .from("user4")
        .select("id")
        .gt("last_date", yesterdayEnd.toISOString())

      if (activeUsersForAttendance && Array.isArray(activeUsersForAttendance)) {
        for (const activeUser of activeUsersForAttendance) {
          if (!activeUser.id) continue
          const { count: existing } = await client
            .from("attendance")
            .select("id", { count: "exact", head: true })
            .eq("user_id", activeUser.id)
            .eq("attendance_date", toLocalDate(yesterday))

          if (!existing || existing === 0) {
            await client.from("attendance").insert({
              user_id: activeUser.id,
              attendance_date: toLocalDate(yesterday),
              status: "A",
              marked_by: "system",
            })
          }
        }
      }

      // Attendance rate for yesterday and day before
      const [{ count: attTotal }, { count: attPresent }, { count: attTotalP }, { count: attPresentP }] = await Promise.all([
        client.from("attendance").select("*", { count: "exact", head: true }).eq("attendance_date", toLocalDate(yesterday)),
        client.from("attendance").select("*", { count: "exact", head: true }).eq("attendance_date", toLocalDate(yesterday)).eq("status", "P"),
        client.from("attendance").select("*", { count: "exact", head: true }).eq("attendance_date", toLocalDate(dayBefore)),
        client.from("attendance").select("*", { count: "exact", head: true }).eq("attendance_date", toLocalDate(dayBefore)).eq("status", "P"),
      ])

      const attendanceRateToday = attTotal ? ((attPresent || 0) * 100) / attTotal : 0
      const attendanceRateDayBefore = attTotalP ? ((attPresentP || 0) * 100) / attTotalP : 0

      // New registrations for today / yesterday / day before
      const [{ count: newRegToday }, { count: newRegYesterday }, { count: newRegDayBefore }] = await Promise.all([
        client.from("user4").select("*", { count: "exact", head: true }).gte("registration_date", today.toISOString()).lte("registration_date", todayEnd.toISOString()),
        client.from("user4").select("*", { count: "exact", head: true }).gte("registration_date", yesterday.toISOString()).lte("registration_date", yesterdayEnd.toISOString()),
        client.from("user4").select("*", { count: "exact", head: true }).gte("registration_date", dayBefore.toISOString()).lte("registration_date", dayBeforeEnd.toISOString()),
      ])

      setTotalUsers(totalCount || 0)
      setTotalUsersTrend(computeGrowth(totalCount || 0, totalYCount || 0))

      setActiveUsers(activeCount || 0)
      setActiveUsersTrend(computeGrowth(activeCount || 0, activeYCount || 0))

      setAttendanceRate(`${attendanceRateToday.toFixed(1)}%`)
      setAttendanceTrend(computeGrowth(attendanceRateToday, attendanceRateDayBefore))

      setNewRegistrations(newRegToday || 0)
      setNewRegistrationsTrend(computeGrowth(newRegToday || 0, newRegYesterday || 0))
    }

    fetchDashboardMetrics()

    const interval = setInterval(() => {
      fetchDashboardMetrics()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchSessions()
    fetchHolidays()
  }, [])
//   useEffect(() => {
//   if (!selectedSessionDate) return

//   console.log("Selected Date:", formatDate(selectedSessionDate))
//   console.log(
//     "Sessions for that date:",
//     sessions.filter(
//       s => s.session_date === formatDate(selectedSessionDate)
//     )
//   )
// }, [selectedSessionDate, sessions])

  const fetchUsers = async () => {
    const { data, error } = await createSupabaseBrowserClient()
      .from("user4")
      .select("*")
      .order("registration_date", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
    } else if (data) {
      // Transform Supabase data to UserData format
      const transformedUsers = data.map(transformSupabaseUser);
      setUsersData(transformedUsers);
    }
  };

  useEffect(() => {
    fetchUsers();

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      // Refresh user data every 5 minutes
      fetchUsers();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [])

  // Refetch sessions when modal is opened to show latest data
  useEffect(() => {
    if (showSessionModal) {
      fetchSessions()
    }
  }, [showSessionModal])

  const stats = calculateStats(usersData)

  const statsData = [
    {
      title: "Total Users",
      value: totalUsers,
      trend: totalUsersTrend,
      isUp: !totalUsersTrend.includes("Down"),
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      icon: UsersIcon,
    },
    {
      title: "Active Users",
      value: activeUsers,
      trend: activeUsersTrend,
      isUp: !activeUsersTrend.includes("Down"),
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      icon: UserIcon,
    },
    {
      title: "Attendance Rate",
      value: attendanceRate,
      trend: attendanceTrend,
      isUp: !attendanceTrend.includes("Down"),
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      icon: ChartIcon,
    },
    {
      title: "New Registrations",
      value: newRegistrations,
      trend: newRegistrationsTrend,
      isUp: !newRegistrationsTrend.includes("Down"),
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600",
      icon: ClockIcon,
    },
  ]

  const chartData = generateChartData(selectedMonth, selectedYear)

  const fetchSessions = async () => {
    try {
      const client = createSupabaseBrowserClient()
      const { data, error } = await client
        .from('sessions')
        .select('*')
        .order('session_date', { ascending: true })
        .order('session_time', { ascending: true })

      if (error) {
        console.error('Error fetching sessions:', error)
        return
      }

      setSessions((data as Session[]) || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const fetchHolidays = async () => {
    try {
      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get' }),
      })

      const result = await response.json()
      if (!response.ok) {
        console.error('Error fetching holidays:', result.error)
        return
      }

      if (result.holidays) {
        const holidayObjects: { date: Date; name: string }[] = []
        result.holidays.forEach((h: any) => {
          const startDate = new Date(h.start_date)
          const endDate = new Date(h.end_date)

          // Add holiday for each day in the range
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            holidayObjects.push({
              date: new Date(d),
              name: h.reason,
            })
          }
        })
        setHolidays(holidayObjects)
      }
    } catch (error) {
      console.error('Error fetching holidays:', error)
    }
  }

  const triggerN8nWebhook = async (
    sessionDate: string,
    type: 'scheduled' | 'cancelled' | 'holiday',
    sessionTime?: string,
    meetingLink?: string,
    additionalPayload?: any,
  ) => {
    try {
      const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://your-n8n-url/webhook/session-update'
      const payload: Record<string, any> = {
        session_date: sessionDate,
        type,
      }

      if (sessionTime) {
        payload.session_time = sessionTime
      }

      if (meetingLink) {
        payload.meeting_link = meetingLink
      }

      if (additionalPayload) {
        Object.assign(payload, additionalPayload)
      }

      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.warn('n8n webhook failed:', response.statusText)
      }
    } catch (error) {
      console.warn('Failed to trigger n8n webhook:', error)
    }
  }

  const scheduleAllSessions = async (date: Date, meetingLink: string) => {
    setSessionLoading(true)
    try {
      const dateStr = toLocalDate(date)
      const sessionsToUpsert = SESSION_TIMES.map((time) => ({
        session_date: dateStr,
        session_time: time,
        status: 'scheduled' as const,
        meeting_link: meetingLink || null,
        notified: false,
      }))

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'scheduleAll',
          session_date: dateStr,
          sessions: sessionsToUpsert,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        console.error('Error scheduling all sessions:', result.error)
        throw new Error(result.error || 'Failed to schedule sessions')
      }

      await triggerN8nWebhook(dateStr, 'scheduled', undefined, meetingLink)
      await fetchSessions()
      addNotification(`All sessions on ${date.toLocaleDateString()} have been scheduled by admin.`)
    } catch (error) {
      console.error('Error scheduling all sessions:', error)
      alert('Failed to schedule sessions. Please try again.')
    } finally {
      setSessionLoading(false)
    }
  }

  const toggleSessionStatus = async (
    date: Date,
    sessionTime: string,
    status: 'scheduled' | 'cancelled',
    meetingLink?: string,
  ) => {
    const sessionKey = `${toLocalDate(date)}-${sessionTime}`
    setIndividualSessionLoading(prev => ({ ...prev, [sessionKey]: true }))

    try {
      const client = createSupabaseBrowserClient()
      const dateStr = toLocalDate(date)

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggleSession',
          session_date: dateStr,
          session_time: sessionTime,
          status,
          meeting_link: meetingLink || null,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        console.error('Supabase Error:', result.error)
        throw new Error(result.error || 'Database error while updating session')
      }

      // Only run webhook if DB success
      await triggerN8nWebhook(dateStr, status, sessionTime, meetingLink)

      // Wait a moment for DB to fully write, then fetch fresh data
      await new Promise(resolve => setTimeout(resolve, 300))
      await fetchSessions()

      addNotification(`Session at ${sessionTime} on ${date.toLocaleDateString()} has been ${status === 'scheduled' ? 'scheduled' : 'cancelled'} by admin.`)
    } catch (err: any) {
      console.error('Unexpected Error:', err?.message || err)
      alert('Something went wrong. Try again.')
    } finally {
      setIndividualSessionLoading(prev => ({ ...prev, [sessionKey]: false }))
    }
  }

  const cancelAllSessions = async (date: Date) => {
    setSessionLoading(true)
    try {
      const dateStr = toLocalDate(date)

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancelAll',
          session_date: dateStr,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel sessions')
      }

      await triggerN8nWebhook(dateStr, 'cancelled')
      await fetchSessions()

      // ✅ KEEP MODAL OPEN
      addNotification(`All sessions on ${date.toLocaleDateString()} have been cancelled by admin.`)

    } catch (error) {
      console.error('Error cancelling all sessions:', error)
      alert('Failed to cancel sessions. Please try again.')
    } finally {
      setSessionLoading(false)
    }
  }

  const handleDateClick = async (date: Date) => {
    await fetchSessions()
    setSelectedSessionDate(date)
    setShowSessionModal(true)
  }

  const calculateAffectedUsers = async (holidayStart: Date, holidayEnd: Date) => {
    try {
      setPreviewLoading(true)
      const client = createSupabaseBrowserClient()
      const { data, error } = await client
        .from('user4')
        .select('id, registration_date, last_date, username')

      if (error) {
        console.error('Error fetching users for preview:', error)
        return
      }

      const users = data as Array<{ id: string; registration_date: string; last_date: string; username: string }>
      const affected: any[] = []

      for (const user of users) {
        if (!user.id || !user.registration_date || !user.last_date) continue

        const registrationDate = new Date(user.registration_date)
        const lastDate = new Date(user.last_date)
        if (Number.isNaN(registrationDate.getTime()) || Number.isNaN(lastDate.getTime())) continue

        if (lastDate < holidayStart || registrationDate > holidayEnd) continue

        const overlapStart = registrationDate > holidayStart ? registrationDate : holidayStart
        const overlapEnd = lastDate < holidayEnd ? lastDate : holidayEnd
        const overlapDays = Math.max(
          0,
          Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        )

        if (overlapDays > 0) {
          const newLastDate = new Date(lastDate)
          newLastDate.setDate(newLastDate.getDate() + overlapDays)

          affected.push({
            id: user.id,
            username: user.username,
            registration_date: user.registration_date,
            last_date: user.last_date,
            affected_days: overlapDays,
            new_last_date: toLocalDate(newLastDate),
          })
        }
      }

      setAffectedUsers(affected)
      setShowHolidayPreviewModal(true)
    } catch (error) {
      console.error('Error calculating affected users:', error)
      alert('Failed to calculate affected users. Please try again.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const extendHolidayLastDates = async (holidayStart: Date, holidayEnd: Date) => {
    try {
      const client = createSupabaseBrowserClient()
      const { data, error } = await client
        .from('user4')
        .select('id, registration_date, last_date')

      if (error) {
        console.error('Error fetching users for holiday extension:', error)
        return
      }

      const users = data as Array<{ id: string; registration_date: string; last_date: string }>
      for (const user of users) {
        if (!user.id || !user.registration_date || !user.last_date) continue

        const registrationDate = new Date(user.registration_date)
        const lastDate = new Date(user.last_date)
        if (Number.isNaN(registrationDate.getTime()) || Number.isNaN(lastDate.getTime())) continue

        if (lastDate < holidayStart || registrationDate > holidayEnd) continue

        const overlapStart = registrationDate > holidayStart ? registrationDate : holidayStart
        const overlapEnd = lastDate < holidayEnd ? lastDate : holidayEnd
        const overlapDays = Math.max(
          0,
          Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        )

        if (overlapDays > 0) {
          const newLastDate = new Date(lastDate)
          newLastDate.setDate(newLastDate.getDate() + overlapDays)

          const { error: updateError } = await client
            .from('user4')
            .update({ last_date: toLocalDate(newLastDate) })
            .eq('id', user.id)

          if (updateError) {
            console.error('Error updating last_date for user:', user.id, updateError)
          }
        }
      }
    } catch (error) {
      console.error('Error extending holiday last dates:', error)
    }
  }

  const notifyUsersAboutHoliday = async (startDate: Date, endDate: Date, reason: string) => {
    try {
      const client = createSupabaseBrowserClient()
      const { data, error } = await client
        .from('user4')
        .select('id, whatsapp_no, username')
        .gt('last_date', new Date().toISOString())

      if (error) {
        console.error('Error fetching active users for notification:', error)
        return
      }

      const activeUsers = data as Array<{ id: string; whatsapp_no: string; username: string }>

      // Send notification via n8n webhook
      const notificationPayload = {
        session_date: toLocalDate(startDate),
        type: 'holiday',
        holiday_end_date: toLocalDate(endDate),
        holiday_reason: reason,
        active_users: activeUsers.map(user => ({
          id: user.id,
          whatsapp: user.whatsapp_no,
          name: user.username,
        })),
      }

      await triggerN8nWebhook(toLocalDate(startDate), 'holiday', undefined, undefined, notificationPayload)

    } catch (error) {
      console.error('Error notifying users about holiday:', error)
    }
  }

  const handlePreviewHoliday = async () => {
    if (holidayFromDate && holidayReason) {
      const fromDay = Number.parseInt(holidayFromDate)
      const toDay = holidayToDate ? Number.parseInt(holidayToDate) : fromDay

      const startDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), fromDay)
      const endDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), toDay)

      await calculateAffectedUsers(startDate, endDate)
    }
  }

  const confirmHolidayAddition = async () => {
    if (holidayFromDate && holidayReason) {
      const fromDay = Number.parseInt(holidayFromDate)
      const toDay = holidayToDate ? Number.parseInt(holidayToDate) : fromDay

      const startDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), fromDay)
      const endDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), toDay)

      // Save to database
      try {
        const response = await fetch('/api/holidays', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'add',
            start_date: toLocalDate(startDate),
            end_date: toLocalDate(endDate),
            reason: holidayReason,
          }),
        })

        const result = await response.json()
        if (!response.ok) {
          console.error('Error saving holiday:', result.error)
          alert('Failed to save holiday. Please try again.')
          return
        }
      } catch (error) {
        console.error('Error saving holiday:', error)
        alert('Failed to save holiday. Please try again.')
        return
      }

      // Update local state
      const newHolidays: { date: Date; name: string }[] = []
      for (let day = fromDay; day <= toDay; day++) {
        const holidayDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
        newHolidays.push({ date: holidayDate, name: holidayReason })
      }

      setHolidays((prev) => [...prev, ...newHolidays])
      setHolidayFromDate("")
      setHolidayToDate("")
      setHolidayReason("")
      setShowHolidayModal(false)
      setShowHolidayPreviewModal(false)

      // Extend user last dates
      await extendHolidayLastDates(startDate, endDate)

      // Refresh user data to reflect the changes
      fetchUsers()

      // Notify active users
      await notifyUsersAboutHoliday(startDate, endDate, holidayReason)

      addNotification(`Holiday "${holidayReason}" declared from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`)
    }
  }

  const addHoliday = async () => {
    await confirmHolidayAddition()
  }

  const removeHoliday = (dateToRemove: Date) => {
    setHolidays((prev: any) => prev.filter((holiday: any) => holiday.date.toDateString() !== dateToRemove.toDateString()))
  }

  const handleLogout = () => {
    setShowLogoutModal(false)
    // Add logout logic here (redirect to login, clear session, etc.)
    window.location.href = "/admin/login"
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!")
      return
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long!")
      return
    }
    // Here you would typically make an API call to change the password
    alert("Password changed successfully!")
    setShowChangePasswordModal(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleChangeProfilePicture = (file: File) => {
    // Here you would typically handle file upload
    alert("Profile picture change functionality would be implemented here!")
    setShowChangeProfilePictureModal(false)
  }

  console.log("ALL SESSIONS:", sessions)

if (selectedSessionDate) {
  console.log(
    "FILTERED:",
    sessions.filter(
      s => toLocalDate(s.session_date) === toLocalDate(selectedSessionDate)
    )
  )
}

  return (
    <div className="min-h-screen bg-gray-50 grid grid-cols-[12rem_1fr]">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <HeaderBar
          showChangePasswordModal={showChangePasswordModal}
          setShowChangePasswordModal={setShowChangePasswordModal}
          showChangeProfilePictureModal={showChangeProfilePictureModal}
          setShowChangeProfilePictureModal={setShowChangeProfilePictureModal}
        />

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mx-8 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Recent Activity</h4>
              <div className="space-y-1">
                {notifications.map((notification, index) => (
                  <p key={index} className="text-sm text-blue-700">{notification}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-8">
          <ChangePasswordModal
            showChangePasswordModal={showChangePasswordModal}
            setShowChangePasswordModal={setShowChangePasswordModal}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handleChangePassword={handleChangePassword}
          />

          <ChangeProfilePictureModal
            showChangeProfilePictureModal={showChangeProfilePictureModal}
            setShowChangeProfilePictureModal={setShowChangeProfilePictureModal}
            handleChangeProfilePicture={handleChangeProfilePicture}
          />

          <LogoutModal
            showLogoutModal={showLogoutModal}
            setShowLogoutModal={setShowLogoutModal}
            handleLogout={handleLogout}
          />

          <HolidayModal
            showHolidayModal={showHolidayModal}
            setShowHolidayModal={setShowHolidayModal}
            holidayFromDate={holidayFromDate}
            setHolidayFromDate={setHolidayFromDate}
            holidayToDate={holidayToDate}
            setHolidayToDate={setHolidayToDate}
            holidayReason={holidayReason}
            setHolidayReason={setHolidayReason}
            addHoliday={addHoliday}
            onPreview={handlePreviewHoliday}
            calendarDate={calendarDate}
            previewLoading={previewLoading}
          />

          <HolidayPreviewModal
            showPreview={showHolidayPreviewModal}
            setShowPreview={setShowHolidayPreviewModal}
            affectedUsers={affectedUsers}
            holidayReason={holidayReason}
            holidayFromDate={holidayFromDate}
            holidayToDate={holidayToDate}
            calendarMonth={calendarDate.getMonth()}
            calendarYear={calendarDate.getFullYear()}
            onConfirm={confirmHolidayAddition}
            isLoading={previewLoading}
          />

          <SessionSchedulingModal
            key={selectedSessionDate ? selectedSessionDate.toDateString() : "no-date"}
            showSessionModal={showSessionModal}
            setShowSessionModal={setShowSessionModal}
            selectedDate={selectedSessionDate}
            onScheduleSessions={scheduleAllSessions}
            onCancelAllSessions={cancelAllSessions}
            onToggleSession={toggleSessionStatus}
            existingSessions={
              selectedSessionDate
                ? sessions.filter(
                    (s) => toLocalDate(s.session_date) === toLocalDate(selectedSessionDate)
                  )
                : []
            }
            loading={sessionLoading}
            individualSessionLoading={individualSessionLoading}
          />

          {activeSection === "dashboard" && (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsData.map((stat, index) => (
                  <StatsCard key={index} {...stat} />
                ))}
              </div>

              <ChartSection
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                chartData={chartData}
              />

              <UsersTable
                usersData={usersData}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterType={filterType}
                onFilterChange={setFilterType}
              />
            </>
          )}

          {/* Calendar view */}
          {activeSection === "calendar" && (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
                  <p className="text-sm text-gray-500">View and manage sessions and holidays in one place.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowHolidayModal(true)}
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Add Holiday
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSessionDate(new Date())
                      setShowSessionModal(true)
                    }}
                    className="rounded-full bg-teal-600 px-5 py-2c text-sm font-semibold text-white hover:bg-teal-700 transition"
                  >
                    Schedule Session
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current month</p>
                    <h2 className="text-xl font-semibold text-gray-900">{formatCalendarMonth(calendarDate)}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCalendarDate(navigateMonth("prev", calendarDate))}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarDate(navigateMonth("next", calendarDate))}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                  <div className="space-y-6">
                    <CalendarGrid
                      calendarDate={calendarDate}
                      sessions={sessions}
                      holidays={holidays}
                    />
                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Today&apos;s Overview</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-sm text-gray-500">Sessions</p>
                          <p className="mt-2 text-2xl font-bold text-gray-900">{sessions.length}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-sm text-gray-500">Holidays</p>
                          <p className="mt-2 text-2xl font-bold text-gray-900">{holidays.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <MiniCalendar
                      calendarDate={calendarDate}
                      sessions={sessions}
                      onDateClick={(date) => {
                        setSelectedSessionDate(date)
                        setShowSessionModal(true)
                      }}
                      holidays={holidays}
                    />

                    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Upcoming Sessions</h3>
                        <span className="text-sm text-gray-500">{sessions.length}</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {sessions.length > 0 ? (
                          sessions.slice(0, 5).map((session) => (
                            <div key={`${session.session_date}-${session.session_time}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{session.session_time}</p>
                                  <p className="text-xs text-gray-500">{session.session_date}</p>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${session.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {session.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No sessions scheduled yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const HeaderBar = ({
  showChangePasswordModal,
  setShowChangePasswordModal,
  showChangeProfilePictureModal,
  setShowChangeProfilePictureModal,
}: {
  showChangePasswordModal: boolean
  setShowChangePasswordModal: (show: boolean) => void
  showChangeProfilePictureModal: boolean
  setShowChangeProfilePictureModal: (show: boolean) => void
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search for users,sessions ,etc ..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notification */}
        <button className="p-2 rounded-full hover:bg-gray-100" title="Notifications">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        {/* Profile Dropdown */}
        <UserDropdown
          showChangePasswordModal={showChangePasswordModal}
          setShowChangePasswordModal={setShowChangePasswordModal}
          showChangeProfilePictureModal={showChangeProfilePictureModal}
          setShowChangeProfilePictureModal={setShowChangeProfilePictureModal}
        />
      </div>
    </div>
  )
}

export default AdminDashboard