import { ChartData } from './types'

export const generateChartData = (selectedMonth: string, selectedYear: string): ChartData[] => {
  const daysInMonth = new Date(
    Number.parseInt(selectedYear),
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ].indexOf(selectedMonth) + 1,
    0,
  ).getDate()

  return Array.from({ length: 5 }, (_, i) => {
    const day = Math.floor((daysInMonth / 5) * (i + 1))
    const baseUsers = 3000 + i * 500
    const variation = Math.floor(Math.random() * 1000) - 500
    return {
      name: String(day).padStart(2, "0"),
      value: Math.max(baseUsers + variation, 1000),
      users: Math.max(baseUsers + variation, 1000),
    }
  })
}