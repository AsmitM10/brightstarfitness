import React, { useState } from 'react'
import { ChevronDown, Mail, MessageCircle } from 'lucide-react'

interface AffectedUser {
  id: string
  username: string
  registration_date: string
  last_date: string
  affected_days: number
  new_last_date: string
}

interface HolidayPreviewModalProps {
  showPreview: boolean
  setShowPreview: (show: boolean) => void
  affectedUsers: AffectedUser[]
  holidayReason: string
  holidayFromDate: string
  holidayToDate: string
  calendarMonth: number
  calendarYear: number
  onConfirm: () => void
  isLoading: boolean
}

export const HolidayPreviewModal: React.FC<HolidayPreviewModalProps> = ({
  showPreview,
  setShowPreview,
  affectedUsers,
  holidayReason,
  holidayFromDate,
  holidayToDate,
  calendarMonth,
  calendarYear,
  onConfirm,
  isLoading,
}) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  if (!showPreview) return null

  const fromDay = Number.parseInt(holidayFromDate)
  const toDay = Number.parseInt(holidayToDate)
  const totalDays = toDay - fromDay + 1

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-gray-800 text-lg">Holiday Impact Preview</h3>
          <button
            onClick={() => setShowPreview(false)}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-xl disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Holiday Details */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">Holiday Details</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700">Period</p>
              <p className="font-semibold text-blue-900">{fromDay} - {toDay} {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Total Days</p>
              <p className="font-semibold text-blue-900">{totalDays} days</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Reason</p>
              <p className="font-semibold text-blue-900">{holidayReason}</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-2">How it works:</h4>
          <ol className="text-sm text-amber-900 space-y-1 list-decimal list-inside">
            <li>Users who lose free sessions during holidays will be identified</li>
            <li>Their membership end date will be automatically extended</li>
            <li>They will receive email & WhatsApp notifications about the extension</li>
            <li>No action needed from users - it's automatic compensation</li>
          </ol>
        </div>

        {/* Affected Users Summary */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-700 font-bold">{affectedUsers.length}</span>
            </div>
            <h4 className="font-semibold text-gray-800">Active Users Affected</h4>
          </div>

        {affectedUsers.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {affectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg hover:bg-gray-50 transition overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    className="w-full p-3 flex justify-between items-center hover:bg-gray-100"
                  >
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-800">{user.username}</p>
                      <p className="text-xs text-gray-600">
                        Registered: {new Date(user.registration_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          +{user.affected_days} days
                        </p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform ${expandedUser === user.id ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {expandedUser === user.id && (
                    <div className="px-3 pb-3 border-t border-gray-200 bg-gray-50 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current last date</span>
                          <p className="font-semibold text-gray-800">
                            {new Date(user.last_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">New last date</span>
                          <p className="font-semibold text-green-700">
                            {new Date(user.new_last_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-600 font-semibold mb-2">Notification to be sent:</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-700">
                            <Mail size={14} className="text-blue-600" />
                            <span>Email: Membership extended by {user.affected_days} days</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-700">
                            <MessageCircle size={14} className="text-green-600" />
                            <span>WhatsApp: Extension confirmation message</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
              No active users will be affected by this holiday.
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 border-t pt-4">
          <button
            onClick={() => setShowPreview(false)}
            disabled={isLoading}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Processing...' : 'Confirm & Add Holiday'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HolidayPreviewModal
