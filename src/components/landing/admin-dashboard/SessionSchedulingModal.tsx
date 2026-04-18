import React, { useEffect, useState } from 'react'

interface Session {
  session_time: string
  status: 'scheduled' | 'cancelled'
}

interface SessionSchedulingModalProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  selectedDate: Date | null
  existingSessions: Session[]
  onScheduleSessions: (date: Date, times: string[]) => Promise<void>
  loading: boolean
}

export const SessionSchedulingModal: React.FC<SessionSchedulingModalProps> = ({
  showModal,
  setShowModal,
  selectedDate,
  existingSessions,
  onScheduleSessions,
  loading
}) => {
  const sessionTimes = ["06:00", "07:00", "08:00", "17:30", "18:30", "19:30"]

  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Prefill already scheduled sessions
  useEffect(() => {
    if (existingSessions) {
      const active = existingSessions
        .filter(s => s.status === 'scheduled')
        .map(s => s.session_time)

      setSelectedTimes(active)
    }
  }, [existingSessions])

  if (!showModal || !selectedDate) return null

  const toggleTime = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time) // cancel
        : [...prev, time] // schedule
    )
  }

  const handleSchedule = async () => {
    await onScheduleSessions(selectedDate, selectedTimes)
    setShowModal(false)
  }

  const handleScheduleAll = async () => {
    try {
      setSuccessMessage(null)
      await onScheduleSessions(selectedDate, sessionTimes)
      setSuccessMessage('All sessions scheduled successfully!')
      setSelectedTimes(sessionTimes)
      // Auto-clear message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      setSuccessMessage('Error scheduling sessions. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md w-full mx-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 text-lg">
            Manage Sessions
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Date */}
        <p className="text-gray-600 mb-4">
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Bulk Actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleScheduleAll}
            disabled={loading}
            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule All'}
          </button>

          <button
            onClick={() => setSelectedTimes([])}
            className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded"
          >
            Cancel All
          </button>
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {sessionTimes.map((time) => {
            const isSelected = selectedTimes.includes(time)

            return (
              <div
                key={time}
                onClick={() => toggleTime(time)}
                className={`cursor-pointer px-3 py-2 rounded-lg text-sm border transition text-center
                  ${isSelected
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                `}
              >
                {time}
              </div>
            )
          })}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSchedule}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400"
          >
            {loading
              ? 'Updating...'
              : selectedTimes.length === 0
              ? 'Cancel All Sessions'
              : 'Update Sessions'}
          </button>
        </div>

      </div>
    </div>
  )
}
export default SessionSchedulingModal;