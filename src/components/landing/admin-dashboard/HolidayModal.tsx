import React from 'react'
import { getDaysInMonth, navigateMonth } from './calendarUtils'

interface HolidayModalProps {
  showHolidayModal: boolean
  setShowHolidayModal: (show: boolean) => void
  holidayFromDate: string
  setHolidayFromDate: (date: string) => void
  holidayToDate: string
  setHolidayToDate: (date: string) => void
  holidayReason: string
  setHolidayReason: (reason: string) => void
  addHoliday: () => Promise<void>
  onPreview: () => Promise<void>
  calendarDate: Date
  previewLoading?: boolean
}

export const HolidayModal: React.FC<HolidayModalProps> = ({
  showHolidayModal,
  setShowHolidayModal,
  holidayFromDate,
  setHolidayFromDate,
  holidayToDate,
  setHolidayToDate,
  holidayReason,
  setHolidayReason,
  addHoliday,
  onPreview,
  calendarDate,
  previewLoading = false,
}) => {
  if (!showHolidayModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 text-lg">Add Holiday</h3>
          <button onClick={() => setShowHolidayModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">From</label>
              <input
                type="number"
                min="1"
                max={getDaysInMonth(calendarDate)}
                value={holidayFromDate}
                onChange={(e) => setHolidayFromDate(e.target.value)}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">To</label>
              <input
                type="number"
                min={holidayFromDate || "1"}
                max={getDaysInMonth(calendarDate)}
                value={holidayToDate}
                onChange={(e) => setHolidayToDate(e.target.value)}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Reason</label>
            <input
              type="text"
              value={holidayReason}
              onChange={(e) => setHolidayReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter holiday reason"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowHolidayModal(false)}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onPreview}
              disabled={!holidayFromDate || !holidayReason || previewLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {previewLoading ? 'Loading...' : 'Preview Impact'}
            </button>
            <button
              onClick={addHoliday}
              disabled={!holidayFromDate || !holidayReason}
              className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add Directly
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}