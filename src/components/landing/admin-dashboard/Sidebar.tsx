// import React from 'react'
// import { DashboardIcon, CalendarIcon, SessionsIcon, AttendanceIcon, LogoutIcon } from './icons'

// interface SidebarProps {
//   activeSection: string
//   setActiveSection: (section: string) => void
//   setShowLogoutModal: (show: boolean) => void
// }

// const menuItems = [
//   { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
//   { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
//   { id: 'sessions', label: 'Sessions', Icon: SessionsIcon },
//   { id: 'attendance', label: 'Attendance', Icon: AttendanceIcon },
// ]

// export const Sidebar: React.FC<SidebarProps> = ({
//   activeSection,
//   setActiveSection,
//   setShowLogoutModal,
// }) => {
//   return (
//     <div className="bg-white shadow-lg flex flex-col">
//       <div className="p-4 border-gray-200">
//         <img src="/logo.svg" alt="Bright Star Fitness" className="h-15 w-auto" />
//       </div>

//       <div className="p-4 space-y-1 flex-1 flex flex-col">
//         {menuItems.map(({ id, label, Icon }) => (
//           <button
//             key={id}
//             onClick={() => setActiveSection(id)}
//             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
//               activeSection === id
//                 ? 'bg-teal-600 text-white'
//                 : 'text-gray-600 hover:bg-gray-100'
//             }`}
//           >
//             <Icon className="w-5 h-5" />
//             <span>{label}</span>
//           </button>
//         ))}

//         <div className="flex-1" />

//         <button
//           onClick={() => setShowLogoutModal(true)}
//           className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-gray-600 hover:bg-gray-100"
//         >
//           <LogoutIcon className="w-5 h-5" />
//           <span>Logout</span>
//         </button>
//       </div>
//     </div>
//   )
// }
import React from 'react'
import { DashboardIcon, CalendarIcon, SessionsIcon, LogoutIcon } from './icons'

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  setShowLogoutModal: (show: boolean) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
  { id: 'sessions', label: 'Sessions', Icon: SessionsIcon },
]

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  setShowLogoutModal,
}) => {
  return (
    <div className="bg-white shadow-lg flex flex-col">
      <div className="p-4 border-gray-200">
        <img src="/logo.svg" alt="Bright Star Fitness" className="h-15 w-auto" />
      </div>

      <div className="p-4 space-y-1 flex-1 flex flex-col">
        {menuItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeSection === id
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}

        <div className="flex-1" />

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