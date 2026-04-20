export interface UserData {
  id?: number
  userId: string
  username: string
  whatsapp: string
  regDate: string
  lastDate: string
  attendance: ("present" | "absent" | "upcoming")[]
  joinedDaysAgo: number
  email?: string
  name?: string
  status?: string
}

export interface ChartData {
  name: string
  value: number
  users: number
}

export interface Profile {
  name: string
  avatar: string
}

export interface Session {
  id: string
  session_date: string
  session_time: string
  status: "scheduled" | "cancelled"
  meeting_link?: string
  notified: boolean
}

export interface SessionSummary {
  date: string
  totalSessions: number
  scheduledSessions: number
  cancelledSessions: number
}

export interface SessionAttendance {
  id: string
  user_id: string
  session_id: string
  status: 'attended' | 'missed'
  joined_at?: string
  created_at?: string
  // Joined fields
  user?: { username: string; whatsapp_no: string; userpage_slug: string }
  session?: Session
}

export interface UserAttendanceSummary {
  user_id: string
  username: string
  total_sessions: number
  attended: number
  missed: number
  attendance_percentage: number
}

