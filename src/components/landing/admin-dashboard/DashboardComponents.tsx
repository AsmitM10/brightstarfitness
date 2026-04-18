import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartData } from './types'

interface StatsCardProps {
  title: string
  value: number | string
  trend: string
  isUp: boolean
  bgColor: string
  iconColor: string
  icon: React.ComponentType<{ className?: string }>
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  isUp,
  bgColor,
  iconColor,
  icon: Icon,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <h3 className="text-sm text-gray-600 font-medium mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mb-2">{value}</p>
      {trend && (
        <div
          className={`flex items-center text-xs font-medium ${isUp ? "text-teal-600" : "text-red-500"}`}
        >
          <span className="mr-1">{isUp ? "↗" : "↘"}</span>
          {trend}
        </div>
      )}
    </div>
  )
}

interface ChartSectionProps {
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  selectedYear: string
  setSelectedYear: (year: string) => void
  chartData: ChartData[]
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  chartData,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">New Registrations</h3>
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1 border text-black border-gray-300 rounded-md text-sm"
          >
            <option>August</option>
            <option>September</option>
            <option>October</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1 border text-black border-gray-300 rounded-md text-sm"
          >
            <option>2025</option>
            <option>2024</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#14b8a6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}