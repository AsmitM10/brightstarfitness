import React, { useState, useEffect } from 'react'

interface SessionStateModalProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  sessionTime: string // e.g., "19:00"
  status: 'not-scheduled' | 'scheduled' | 'cancelled' // States
  onSchedule: () => void | Promise<void>
  onCancel: () => void | Promise<void>
  loading?: boolean
}

export const SessionStateModal: React.FC<SessionStateModalProps> = ({
  showModal,
  setShowModal,
  sessionTime,
  status,
  onSchedule,
  onCancel,
  loading = false
}) => {
  const [currentStatus, setCurrentStatus] = useState<'not-scheduled' | 'scheduled' | 'cancelled'>(status)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setCurrentStatus(status)
  }, [status])

  if (!showModal) return null

  const handleScheduleClick = async () => {
    setIsLoading(true)
    try {
      await onSchedule()
      setCurrentStatus('scheduled')
    } catch (error) {
      console.error('Error scheduling session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelClick = async () => {
    setIsLoading(true)
    try {
      await onCancel()
      setCurrentStatus('cancelled')
    } catch (error) {
      console.error('Error cancelling session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Determine message and styling based on current status
  const getStateConfig = () => {
    switch (currentStatus) {
      case 'not-scheduled':
        return {
          timeText: sessionTime,
          statusText: 'Not scheduled',
          message: 'This session has not been scheduled yet.',
          containerBg: 'bg-white',
          borderColor: 'border-gray-300',
          timeColor: 'text-gray-700',
          statusColor: 'text-gray-600',
          buttonLayout: [
            { label: 'CANCEL', color: 'bg-red-600 border border-red-600 text-white hover:bg-red-700', onClick: () => setShowModal(false), disabled: false },
            { label: 'SCHEDULE', color: 'bg-teal-600 border border-teal-600 text-white hover:bg-teal-700', onClick: handleScheduleClick, disabled: false }
          ]
        }
      case 'scheduled':
        return {
          timeText: sessionTime,
          statusText: 'This session has been scheduled',
          message: '',
          containerBg: 'bg-white',
          borderColor: 'border-teal-300',
          timeColor: 'text-teal-600',
          statusColor: 'text-teal-600',
          buttonLayout: [
            { label: 'CANCEL', color: 'bg-red-600 border border-red-600 text-white hover:bg-red-700', onClick: handleCancelClick, disabled: false },
            { label: 'SCHEDULED', color: 'bg-white border border-teal-400 text-teal-600 hover:bg-teal-50 cursor-not-allowed', onClick: () => {}, disabled: true }
          ]
        }
      case 'cancelled':
        return {
          timeText: sessionTime,
          statusText: 'This session has been cancelled',
          message: '',
          containerBg: 'bg-white',
          borderColor: 'border-red-300',
          timeColor: 'text-gray-700',
          statusColor: 'text-red-600',
          buttonLayout: [
            { label: 'CANCELLED', color: 'bg-white border border-red-400 text-red-600 hover:bg-red-50 cursor-not-allowed', onClick: () => {}, disabled: true },
            { label: 'SCHEDULE', color: 'bg-teal-600 border border-teal-600 text-white hover:bg-teal-700', onClick: handleScheduleClick, disabled: false }
          ]
        }
      default:
        return {
          timeText: sessionTime,
          statusText: '',
          message: '',
          containerBg: 'bg-white',
          borderColor: 'border-gray-300',
          timeColor: 'text-gray-700',
          statusColor: 'text-gray-600',
          buttonLayout: []
        }
    }
  }

  const config = getStateConfig()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${config.containerBg} rounded-lg shadow-lg border-2 ${config.borderColor} p-6 max-w-md w-full mx-4`}>
        
        {/* Header with Time and Status */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-lg ${config.timeColor}`}>{config.timeText}</span>
            <span className={`font-semibold text-sm ${config.statusColor}`}>{config.statusText}</span>
          </div>
        </div>

        {/* Message (optional) */}
        {config.message && (
          <p className="text-gray-600 text-sm mb-4">
            {config.message}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          {config.buttonLayout.map((button, idx) => (
            <button
              key={idx}
              onClick={button.onClick}
              disabled={button.disabled || isLoading}
              className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-colors ${button.color} ${button.disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  {button.label}
                </div>
              ) : (
                button.label
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SessionStateModal
