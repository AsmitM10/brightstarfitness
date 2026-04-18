import React from 'react'
import { UserData } from './types'

interface UsersTableProps {
  usersData: UserData[]
  searchTerm: string
  onSearchChange: (value: string) => void
  filterType: string
  onFilterChange: (value: string) => void
}

export const UsersTable: React.FC<UsersTableProps> = ({
  usersData,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange
}) => {
  // Filter users based on search term and filter type
  const filteredUsers = usersData.filter(user => {
    // Search filter
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    let matchesFilter = true
    if (filterType === 'Active Users') {
      // Active users: last_date is in the future or "Never"
      matchesFilter = user.lastDate === 'Never' || new Date(user.lastDate) > new Date()
    } else if (filterType === 'Inactive Users') {
      // Inactive users: last_date is in the past
      matchesFilter = user.lastDate !== 'Never' && new Date(user.lastDate) <= new Date()
    }
    // "All Users" doesn't filter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Users Details</h3>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-400"></div>
            <span className="text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-gray-600">Upcoming</span>
          </div>
        </div>
      </div>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-3 py-2 text-black border border-gray-300 rounded-md text-sm"
        />
        <select
          value={filterType}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 text-black border border-gray-300 rounded-md text-sm"
        >
          <option>All Users</option>
          <option>Active Users</option>
          <option>Inactive Users</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">User ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Username</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Whatsapp Number</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Registration Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Last date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice(0, 10).map((user, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">{user.userId}</td>
                <td className="px-4 py-4 text-sm text-gray-900 font-medium">{user.username}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{user.whatsapp}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{user.regDate}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{user.lastDate}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-1">
                    {user.attendance.slice(0, 7).map((status, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full border ${status === "present"
                            ? "bg-teal-400 border-teal-500"
                            : status === "absent"
                              ? "bg-red-400 border-red-500"
                              : "bg-white border-black"
                          }`}
                        title={`Day ${idx + 1}: ${status === "present" ? "P" : status === "absent" ? "A" : "-"}`}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">Showing 1-{Math.min(10, filteredUsers.length)} of {filteredUsers.length} users</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  )
}