import React from 'react'
import { Mail, MessageCircle, Check } from 'lucide-react'

interface UserNotificationTemplateProps {
  username: string
  affectedDays: number
  holidayReason: string
  holidayStartDate: string
  holidayEndDate: string
  originalLastDate: string
  newLastDate: string
}

export const UserNotificationTemplate: React.FC<UserNotificationTemplateProps> = ({
  username,
  affectedDays,
  holidayReason,
  holidayStartDate,
  holidayEndDate,
  originalLastDate,
  newLastDate,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-green-200">
      <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
        <Check className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-green-900">Membership Extension Notification</h3>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Hi <span className="font-semibold">{username}</span>,
        </p>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 mb-2">
            Due to the holiday <span className="font-semibold">"{holidayReason}"</span> from{' '}
            <span className="font-semibold">{holidayStartDate}</span> to{' '}
            <span className="font-semibold">{holidayEndDate}</span>, your membership has been automatically extended!
          </p>
          <p className="text-sm text-gray-700">
            You lost <span className="font-semibold text-amber-600">{affectedDays} days</span> of your free sessions, so we've extended your membership by{' '}
            <span className="font-semibold text-green-600">{affectedDays} days</span> as compensation.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="text-xs text-gray-600 mb-1">Original Last Date</p>
            <p className="font-semibold text-gray-800">{originalLastDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">New Last Date</p>
            <p className="font-semibold text-green-700">{newLastDate}</p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-900">
            📌 <span className="font-semibold">No action needed from you!</span> Your account has been automatically updated. You can continue enjoying your sessions as usual.
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>Email notification sent</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp message sent</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserNotificationTemplate
