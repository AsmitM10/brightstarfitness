import React from "react"
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
  formatDateKey,
} from "./calendarUtils"

interface Session {
  id: string
  session_date: string
  session_time: string
  status: "scheduled" | "cancelled"
  meeting_link?: string
  notified: boolean
}

interface CalendarGridProps {
  calendarDate: Date
  sessions: Session[]
  holidays?: { date: Date; name: string }[]
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDate,
  sessions,
  holidays = [],
}) => {
  const getSessions = (day: number) => {
    const dateStr = formatDateKey(calendarDate, day)
    return sessions.filter((s) => s.session_date === dateStr)
  }

  const getHolidays = (day: number) => {
    return holidays.filter(
      (h) =>
        h.date.getDate() === day &&
        h.date.getMonth() === calendarDate.getMonth() &&
        h.date.getFullYear() === calendarDate.getFullYear()
    )
  }

  const renderGrid = () => {
    const daysInMonth = getDaysInMonth(calendarDate)
    const firstDay = getFirstDayOfMonth(calendarDate)
    const cells = []

    const prevMonth = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      0
    )

    // Prev days
    for (let i = 0; i < firstDay; i++) {
      const day = prevMonth.getDate() - firstDay + i + 1
      cells.push(
        <div key={`prev-${i}`} className="p-4 text-gray-400 text-center border">
          {day}
        </div>
      )
    }

    // Current days
    for (let day = 1; day <= daysInMonth; day++) {
      const daySessions = getSessions(day)
      const dayHolidays = getHolidays(day)

      const scheduled = daySessions.filter((s) => s.status === "scheduled").length
      const cancelled = daySessions.filter((s) => s.status === "cancelled").length

      cells.push(
        <div
          key={day}
          className={`p-4 border relative text-center hover:bg-gray-50
          ${isToday(day, calendarDate) ? "bg-blue-50" : ""}
          ${dayHolidays.length ? "bg-red-50" : ""}
        `}
        >
          <div
            className={`font-medium
            ${isToday(day, calendarDate) ? "text-blue-600" : ""}
            ${dayHolidays.length ? "text-red-600" : ""}
          `}
          >
            {day}
          </div>

          {/* Holidays */}
          {dayHolidays.map((h, i) => (
            <div key={i} className="text-xs bg-red-100 text-red-700 rounded mt-1 px-1">
              {h.name}
            </div>
          ))}

          {/* Sessions */}
          {daySessions.length > 0 && (
            <div className="mt-1 space-y-1">
              {scheduled > 0 && (
                <div className="text-xs bg-green-100 text-green-700 rounded px-1">
                  {scheduled} Scheduled
                </div>
              )}
              {cancelled > 0 && (
                <div className="text-xs bg-red-100 text-red-700 rounded px-1">
                  {cancelled} Cancelled
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    // Fill remaining
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
    const remaining = totalCells - (firstDay + daysInMonth)

    for (let i = 1; i <= remaining; i++) {
      cells.push(
        <div key={`next-${i}`} className="p-4 text-gray-400 text-center border">
          {i}
        </div>
      )
    }

    return cells
  }

  return (
    <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
      {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
        <div key={d} className="p-3 bg-gray-50 text-center text-sm font-medium border">
          {d}
        </div>
      ))}

      {renderGrid()}
    </div>
  )
}

interface MiniCalendarProps {
  calendarDate: Date
  sessions: Session[]
  onDateClick: (date: Date) => void
  holidays?: { date: Date; name: string }[]
  setHolidayFromDate?: (date: string) => void
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  calendarDate,
  sessions,
  onDateClick,
  holidays = [],
  setHolidayFromDate,
}) => {
  const getSessions = (day: number) => {
    const dateStr = formatDateKey(calendarDate, day)
    return sessions.filter((s) => s.session_date === dateStr)
  }

  const render = () => {
    const daysInMonth = getDaysInMonth(calendarDate)
    const firstDay = getFirstDayOfMonth(calendarDate)
    const cells = []

    const prevMonth = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      0
    )

    for (let i = 0; i < firstDay; i++) {
      const day = prevMonth.getDate() - firstDay + i + 1
      cells.push(<div key={`p-${i}`} className="text-gray-400 text-center">{day}</div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const daySessions = getSessions(day)
      const hasScheduled = daySessions.some((s) => s.status === "scheduled")
      const hasCancelled = daySessions.some((s) => s.status === "cancelled")

      cells.push(
        <div
          key={day}
          onClick={() => {
            const date = new Date(
              calendarDate.getFullYear(),
              calendarDate.getMonth(),
              day
            )
            onDateClick(date)
            setHolidayFromDate?.(formatDateKey(calendarDate, day))
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm
            ${hasScheduled ? "bg-green-500 text-white" : ""}
            ${hasCancelled ? "bg-red-500 text-white" : ""}
            ${isToday(day, calendarDate) ? "bg-blue-100 text-blue-700" : ""}
          `}
        >
          {day}
        </div>
      )
    }

    return cells
  }

  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="grid grid-cols-7 text-xs text-center mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{render()}</div>
    </div>
  )
}