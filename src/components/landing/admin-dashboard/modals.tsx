import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { KeyIcon, CameraIcon, UserIcon, ChevronDownIcon } from './icons'

interface ChangePasswordModalProps {
  showChangePasswordModal: boolean
  setShowChangePasswordModal: (show: boolean) => void
  currentPassword: string
  setCurrentPassword: (password: string) => void
  newPassword: string
  setNewPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  handleChangePassword: () => void
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  showChangePasswordModal,
  setShowChangePasswordModal,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleChangePassword,
}) => {
  if (!showChangePasswordModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => setShowChangePasswordModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleChangePassword}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  )
}

interface ChangeProfilePictureModalProps {
  showChangeProfilePictureModal: boolean
  setShowChangeProfilePictureModal: (show: boolean) => void
  handleChangeProfilePicture: (file: File) => void
}

export const ChangeProfilePictureModal: React.FC<ChangeProfilePictureModalProps> = ({
  showChangeProfilePictureModal,
  setShowChangeProfilePictureModal,
  handleChangeProfilePicture,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  if (!showChangeProfilePictureModal) return null

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0]
    if (file) {
      handleChangeProfilePicture(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Profile Picture</h3>
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="w-10 h-10 text-gray-600" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label="Choose a new profile picture (JPG, PNG)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-sm text-gray-500 mt-2">Choose a new profile picture (JPG, PNG)</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => setShowChangeProfilePictureModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Upload Picture
          </button>
        </div>
      </div>
    </div>
  )
}

interface LogoutModalProps {
  showLogoutModal: boolean
  setShowLogoutModal: (show: boolean) => void
  handleLogout: () => void
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  showLogoutModal,
  setShowLogoutModal,
  handleLogout,
}) => {
  if (!showLogoutModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-teal-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-white mb-4">Confirm Logout</h3>
        <p className="text-white mb-6">Are you sure you want to logout?</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-white hover:bg-teal-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

interface UserDropdownProps {
  showChangePasswordModal: boolean
  setShowChangePasswordModal: (show: boolean) => void
  showChangeProfilePictureModal: boolean
  setShowChangeProfilePictureModal: (show: boolean) => void
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  showChangePasswordModal,
  setShowChangePasswordModal,
  showChangeProfilePictureModal,
  setShowChangeProfilePictureModal,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">Kalpesh Kamble</div>
          <div className="text-xs text-gray-500">Admin</div>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowChangePasswordModal(true)}
        >
          <KeyIcon className="w-4 h-4 text-pink-500" />
          <span>Change Password</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowChangeProfilePictureModal(true)}
        >
          <CameraIcon className="w-4 h-4 text-blue-500" />
          <span>Change Profile Picture</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface SessionSchedulingModalProps {
  showSessionModal: boolean
  setShowSessionModal: (show: boolean) => void
  selectedDate: Date | null
  onScheduleSessions: (date: Date, meetingLink: string) => Promise<void>
  onCancelAllSessions: (date: Date) => Promise<void>
  onToggleSession: (date: Date, sessionTime: string, status: 'scheduled' | 'cancelled', meetingLink?: string) => Promise<void>
  existingSessions: any[]
  loading: boolean
  individualSessionLoading: {[key: string]: boolean}
}

export const SessionSchedulingModal: React.FC<SessionSchedulingModalProps> = ({
  showSessionModal,
  setShowSessionModal,
  selectedDate,
  onScheduleSessions,
  onCancelAllSessions,
  onToggleSession,
  existingSessions,
  loading,
  individualSessionLoading,
}) => {
  const [meetingLink, setMeetingLink] = React.useState("")
  const [sessionStatusMap, setSessionStatusMap] = React.useState<Record<string, 'scheduled' | 'cancelled' | null>>({})
  const [statusMessage, setStatusMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Initialize sessionStatusMap from existingSessions
React.useEffect(() => {
  if (!selectedDate) return

  // ❗ DO NOT initialize if data not ready yet
  if (!existingSessions || existingSessions.length === 0) return

  const sessionTimes = ["06:30", "07:30", "08:30", "17:00", "18:00", "19:00"]

  const newState: Record<string, 'scheduled' | 'cancelled' | null> = {}

  sessionTimes.forEach((time) => {
    const session = existingSessions.find((s) => s.session_time === time)
    newState[time] = session ? session.status : null
  })

  setSessionStatusMap(newState)

}, [selectedDate, existingSessions])

  // Clear meeting link and messages when date changes
  React.useEffect(() => {
    if (showSessionModal && selectedDate) {
      setMeetingLink("")
      setStatusMessage(null)
    }
  }, [selectedDate, showSessionModal])

  React.useEffect(() => {
    if (!statusMessage) return
    const timeoutId = window.setTimeout(() => setStatusMessage(null), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [statusMessage])

 if (!showSessionModal) return null

  const sessionTimes = ["06:30", "07:30", "08:30", "17:00", "18:00", "19:00"]
  const scheduledSessions = sessionTimes.filter((time) => sessionStatusMap[time] === 'scheduled')
  const cancelledSessions = sessionTimes.filter((time) => sessionStatusMap[time] === 'cancelled')
  const notScheduledSessions = sessionTimes.filter((time) => sessionStatusMap[time] === null)
  const hasScheduledSessions = scheduledSessions.length > 0
  const allScheduled = scheduledSessions.length === sessionTimes.length
  const allCancelled = cancelledSessions.length === sessionTimes.length

  const handleSchedule = async () => {
    setStatusMessage(null)
    const prevStatus = { ...sessionStatusMap }
    setSessionStatusMap((prev) => {
      const next: Record<string, 'scheduled' | 'cancelled' | null> = { ...prev }
      sessionTimes.forEach((time) => {
        next[time] = 'scheduled'
      })
      return next
    })

   if (!selectedDate) return

try {
  await onScheduleSessions(selectedDate, meetingLink)
  setMeetingLink("")
  setStatusMessage({
    type: 'success',
    text: 'All sessions were scheduled successfully.',
  })
}catch (error) {
      setSessionStatusMap(prevStatus)
      setStatusMessage({
        type: 'error',
        text: 'Unable to schedule sessions. Please try again.',
      })
    }
  }

  const handleToggleSingleSession = async (time: string, targetStatus: 'scheduled' | 'cancelled') => {
    if (!selectedDate) return

    console.log(`[SessionModal] Clicking button for ${time}, target status: ${targetStatus}`)
    setStatusMessage(null)
    const previousStatus = sessionStatusMap[time] ?? null
    
    console.log(`[SessionModal] Current status for ${time}:`, previousStatus)
    console.log(`[SessionModal] Setting optimistic state for ${time} to:`, targetStatus)
    
    // Optimistic update - update UI immediately
    setSessionStatusMap(prev => {
      const updated = { ...prev, [time]: targetStatus }
      console.log(`[SessionModal] Updated sessionStatusMap:`, updated)
      return updated
    })

    try {
      console.log(`[SessionModal] Calling onToggleSession for ${time}`)
      await onToggleSession(selectedDate, time, targetStatus, meetingLink)
      console.log(`[SessionModal] onToggleSession completed successfully for ${time}`)
      
      setStatusMessage({
        type: 'success',
        text: `Session ${time} ${targetStatus === 'scheduled' ? 'scheduled' : 'cancelled'} successfully.`,
      })
    } catch (error) {
      console.error(`[SessionModal] Error toggling session ${time}:`, error)
      // Revert on error
      setSessionStatusMap(prev => ({ ...prev, [time]: previousStatus }))
      setStatusMessage({
        type: 'error',
        text: 'Unable to update the session status. Please try again.',
      })
    }
  }

  const handleCancelAll = async () => {
    setStatusMessage(null)
    const prevStatus = { ...sessionStatusMap }
    setSessionStatusMap((prev) => {
      const next: Record<string, 'scheduled' | 'cancelled' | null> = { ...prev }
      sessionTimes.forEach((time) => {
        next[time] = 'cancelled'
      })
      return next
    })
    if (!selectedDate) return

try {
  await onCancelAllSessions(selectedDate)
  setStatusMessage({
    type: 'success',
    text: 'All sessions were cancelled successfully.',
  })
}catch (error) {
      setSessionStatusMap(prevStatus)
      setStatusMessage({
        type: 'error',
        text: 'Unable to cancel all sessions. Please try again.',
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
         Schedule Sessions for {selectedDate ? selectedDate.toLocaleDateString() : ''}
        </h3>
        <div className="mb-4 text-sm text-gray-600">
          {scheduledSessions.length} scheduled · {cancelledSessions.length} cancelled · {notScheduledSessions.length} not scheduled
        </div>

        {statusMessage && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              statusMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Meeting Link (Optional)</label>
          <input
            type="url"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="https://meet.google.com/..."
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={handleCancelAll}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              allCancelled
                ? 'border border-red-600 text-red-600 bg-white hover:bg-red-50 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
            }`}
            disabled={!hasScheduledSessions || loading || allCancelled}
          >
            {allCancelled ? 'All Cancelled' : 'Cancel All Sessions'}
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Session Times:</h4>
            <div className="text-xs text-gray-500">
              {scheduledSessions.length} of {sessionTimes.length} scheduled
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {sessionTimes.map((time) => {
              const currentStatus = sessionStatusMap[time] ?? null
              const sessionKey = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}-${time}` : `${time}`
              const isLoading = individualSessionLoading[sessionKey] || false

              console.log(`[Render] Time: ${time}, currentStatus: ${currentStatus}, sessionStatusMap:`, sessionStatusMap)

              return (
                <div key={time} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{time}</span>
                      <span className={`px-2 py-1 text-[10px] font-semibold uppercase rounded-full ${
                        currentStatus === 'scheduled'
                          ? 'bg-green-100 text-green-800'
                          : currentStatus === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {currentStatus ? currentStatus.toUpperCase() : 'NOT SCHEDULED'}
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${
                      currentStatus === 'scheduled'
                        ? 'text-green-700'
                        : currentStatus === 'cancelled'
                        ? 'text-red-700'
                        : 'text-gray-500'
                    }`}>
                      {currentStatus === 'scheduled'
                        ? 'This session is scheduled.'
                        : currentStatus === 'cancelled'
                        ? 'This session is cancelled.'
                        : 'This session has not been scheduled yet.'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        console.log(`[Button Click] CANCEL button clicked for ${time}`)
                        handleToggleSingleSession(time, 'cancelled')
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        currentStatus === 'cancelled'
                          ? 'border border-red-600 text-red-600 bg-white hover:bg-red-50 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                      }`}
                      disabled={currentStatus === 'cancelled' || isLoading || loading}
                    >
                      {isLoading && currentStatus === 'scheduled' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Cancelling...
                        </>
                      ) : currentStatus === 'cancelled' ? (
                        'CANCELLED'
                      ) : (
                        'CANCEL'
                      )}
                    </button>

                    <button
                      onClick={() => {
                        console.log(`[Button Click] SCHEDULE button clicked for ${time}`)
                        handleToggleSingleSession(time, 'scheduled')
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        currentStatus === 'scheduled'
                          ? 'border border-teal-600 text-teal-600 bg-white hover:bg-teal-50 cursor-not-allowed'
                          : 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-400'
                      }`}
                      disabled={currentStatus === 'scheduled' || isLoading || loading}
                    >
                      {isLoading && currentStatus !== 'scheduled' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : currentStatus === 'scheduled' ? (
                        'SCHEDULED'
                      ) : (
                        'SCHEDULE'
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowSessionModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Close
          </button>
          {scheduledSessions.length > 0 && (
            <button
              onClick={handleCancelAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:bg-red-400"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  ✕ Cancel All Sessions
                </>
              )}
            </button>
          )}
          <button
            onClick={handleSchedule}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              allScheduled
                ? 'border border-teal-600 text-teal-600 bg-white hover:bg-teal-50 disabled:cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-400'
            }`}
            disabled={loading || allScheduled}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scheduling...
              </>
            ) : allScheduled ? (
              'Scheduled'
            ) : (
              <>
                ✓ Schedule All Sessions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export { SessionStateModal } from './SessionStateModal'