import { UserData } from './types'

export const calculateStats = (usersData: UserData[]) => {
  const totalUsers = usersData.length
  const activeUsers = usersData.filter(
    (user) => user.joinedDaysAgo <= 7 && user.attendance.filter((day) => day === "present").length >= 3,
  ).length

  const totalAttendanceDays = usersData.reduce(
    (acc, user) => acc + user.attendance.filter((day) => day === "present").length,
    0,
  )
  const totalPossibleDays = usersData.reduce(
    (acc, user) => acc + user.attendance.filter((day) => day !== "upcoming").length,
    0,
  )
  const attendanceRate = totalPossibleDays > 0 ? Math.round((totalAttendanceDays / totalPossibleDays) * 100) : 0

  const sessionsToday = Math.floor(Math.random() * 50) + 20 // Random sessions for today

  return {
    totalUsers: totalUsers.toLocaleString(),
    activeUsers: activeUsers.toLocaleString(),
    attendanceRate: `${attendanceRate}%`,
    sessionsToday: sessionsToday.toString(),
  }
}