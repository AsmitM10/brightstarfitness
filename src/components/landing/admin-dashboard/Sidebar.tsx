import React from 'react'
import { DashboardIcon, CalendarIcon, LogoutIcon } from './icons'

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  setShowLogoutModal: (show: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  setShowLogoutModal,
}) => {
  return (
    <div className="bg-white shadow-lg flex flex-col">
      <div className="p-4  border-gray-200">
        <img src="/logo.svg" alt="Bright Star Fitness" className="h-15 w-auto" />
      </div>

      {/* Sidebar content */}
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <button
          onClick={() => setActiveSection("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeSection === "dashboard" ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          <DashboardIcon className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSection("calendar")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeSection === "calendar" ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span>Calendar</span>
        </button>

        
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-gray-600 hover:bg-gray-100"
        >
          <LogoutIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}