"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

interface AttendanceTrackerProps {
  attendance?: string[]
  created_at: string
  userpage_slug: string
  registration_date: string
  last_date: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AttendanceTracker({ 
  attendance: initialAttendance = [], 
  created_at,
  userpage_slug,
  registration_date,
  last_date
}: AttendanceTrackerProps) {
  const [attendance, setAttendance] = useState(initialAttendance)
  const [isLoading, setIsLoading] = useState(false)

  /* -------------------------
     Date Helpers
  --------------------------*/
  const getDatesArray = () => {
    // Trial starts the day AFTER registration
    const registrationDay = new Date(registration_date)
    registrationDay.setHours(0, 0, 0, 0)
    
    const trialStart = new Date(registrationDay)
    trialStart.setDate(trialStart.getDate() + 1) // Next day after registration
    
    const end = new Date(last_date)
    end.setHours(0, 0, 0, 0)
    
    const dates = []
    const current = new Date(trialStart)
    
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const dates = getDatesArray()
  const totalDays = dates.length

  const getTodayDateObj = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }

  const getTodayIndex = () => {
    const today = getTodayDateObj()
    return dates.findIndex(date => {
      const dateObj = new Date(date)
      dateObj.setHours(0, 0, 0, 0)
      return dateObj.getTime() === today.getTime()
    })
  }

  const isCurrentDay = (index: number) => {
    return index === getTodayIndex()
  }

  const isPastDay = (index: number) => {
    return index < getTodayIndex()
  }

  const isFutureDay = (index: number) => {
    return index > getTodayIndex()
  }

  const getDateString = (index: number) => {
    if (index < 0 || index >= dates.length) return ""
    const date = new Date(dates[index])
    return date.getDate().toString()
  }

  const getStatus = (index: number) => {
    const value = attendance[index]
    if (value === "P") return "present"
    if (value === "A") return "absent"
    return "not-marked"
  }

  const getStatusColor = (index: number) => {
    const status = getStatus(index)

    switch (status) {
      case "present":
        return "bg-cyan-400 border-2 border-cyan-500"
      case "absent":
        return "bg-red-400 border-2 border-red-500"
      default:
        return isFutureDay(index) 
          ? "bg-white border-2 border-gray-300 cursor-not-allowed" 
          : "bg-white border-2 border-gray-300"
    }
  }

  const getStatusCursorClass = (index: number) => {
    if (isCurrentDay(index)) return "cursor-pointer hover:bg-opacity-80"
    return "cursor-not-allowed"
  }

  /* -------------------------
     Auto-mark absent at 12:00 AM
  --------------------------*/
  useEffect(() => {
    const syncAttendance = async () => {
      const todayIndex = getTodayIndex()
      
      // Only sync if today is within the challenge dates
      if (todayIndex === -1 || todayIndex >= totalDays) return

      const newAttendance = [...attendance]
      let changed = false

      // Mark all past days that aren't marked yet as absent
      for (let i = 0; i < todayIndex; i++) {
        if (!newAttendance[i]) {
          newAttendance[i] = "A"
          changed = true
        }
      }

      if (changed) {
        setAttendance(newAttendance)
        try {
          await supabase
            .from("user4")
            .update({ attendance: newAttendance })
            .eq("userpage_slug", userpage_slug)
        } catch (error) {
          console.error("Failed to sync attendance:", error)
        }
      }
    }

    syncAttendance()

    // Check for new day at midnight
    const now = new Date()
    const nextMidnight = new Date(now)
    nextMidnight.setDate(nextMidnight.getDate() + 1)
    nextMidnight.setHours(0, 0, 0, 0)
    
    const timeUntilMidnight = nextMidnight.getTime() - now.getTime()
    const timeoutId = setTimeout(() => {
      syncAttendance()
    }, timeUntilMidnight)

    return () => clearTimeout(timeoutId)
  }, [registration_date, last_date, userpage_slug, totalDays])

  /* -------------------------
     Mark Present
  --------------------------*/
  const markPresent = async (index: number) => {
    // Only allow marking current day
    if (!isCurrentDay(index)) return

    setIsLoading(true)
    try {
      const newAttendance = [...attendance]
      newAttendance[index] = "P"
      setAttendance(newAttendance)

      await supabase
        .from("user4")
        .update({ attendance: newAttendance })
        .eq("userpage_slug", userpage_slug)
    } catch (error) {
      console.error("Failed to mark present:", error)
      // Revert on error
      setAttendance(initialAttendance)
    } finally {
      setIsLoading(false)
    }
  }

  /* -------------------------
     Stats
  --------------------------*/
  const presentDays = attendance.filter((d) => d === "P").length
  const todayIndex = getTodayIndex()
  const daysLeft = todayIndex === -1 ? totalDays : Math.max(0, totalDays - todayIndex - 1)

  /* -------------------------
     Render
  --------------------------*/
  return (
    <div className="p-0">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Track Your Attendance
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">
            Days left in Challenge :
          </span>
          <span className="text-gray-800 font-semibold">
            {daysLeft} Days
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">
            Total Active Days :
          </span>
          <span className="text-gray-800 font-semibold">
            {presentDays} Day{presentDays !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          7 Day Challenge
        </h4>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: totalDays }).map((_, index) => {
            const dateObj = new Date(dates[index])
            const monthStr = dateObj.toLocaleString('default', { month: 'short' })
            const dateStr = dateObj.getDate()
            
            return (
              <div
                key={index}
                className="text-center text-sm font-medium text-gray-600 mb-2"
              >
                <div>{monthStr}</div>
                <div className="text-xs">{dateStr}</div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: totalDays }).map((_, index) => {
            const status = getStatus(index)
            const canClick = isCurrentDay(index) && !isLoading
            const isCurrent = isCurrentDay(index)

            return (
              <div key={index} className="text-center">
                <button
                  onClick={() => markPresent(index)}
                  disabled={!isCurrent || isLoading}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-gray-800 transition-all ${getStatusColor(
                    index
                  )} ${getStatusCursorClass(index)} ${
                    isCurrent && status === "not-marked" ? "animate-pulse" : ""
                  } disabled:opacity-75`}
                  title={
                    isCurrent && status === "not-marked"
                      ? "Click to mark present"
                      : isCurrent && status === "present"
                      ? "Marked present"
                      : isFutureDay(index)
                      ? "Coming soon"
                      : status === "present"
                      ? "Marked present"
                      : "Marked absent"
                  }
                >
                  {getDateString(index)}
                </button>

                {status === "present" && (
                  <div className="text-xs text-green-600 font-semibold mt-1">
                    ✓
                  </div>
                )}
                {status === "absent" && (
                  <div className="text-xs text-red-600 font-semibold mt-1">
                    ✗
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
          <span className="text-sm text-gray-600">PRESENT</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-400 rounded-full"></div>
          <span className="text-sm text-gray-600">ABSENT</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
          <span className="text-sm text-gray-600">NOT ACTIVE</span>
        </div>
      </div>
    </div>
  )
}