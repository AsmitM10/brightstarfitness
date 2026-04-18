"use client"

import { Search, Bell, ChevronDown } from "lucide-react"

export default function HeaderBar({ profile }: any) {

  return (
    <div className="bg-white border-b px-8 py-4 flex justify-between">

      <div className="relative w-96">

        <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />

        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />

      </div>

      <div className="flex items-center gap-6">

        <Bell className="w-5 h-5 text-gray-600" />

        <div className="flex items-center gap-3">

          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-9 h-9 rounded-full"
          />

          <div>
            <p className="text-sm font-semibold">{profile.name}</p>
            <p className="text-xs text-gray-500">{profile.role}</p>
          </div>

          <ChevronDown className="w-4 h-4 text-gray-500" />

        </div>

      </div>

    </div>
  )
}