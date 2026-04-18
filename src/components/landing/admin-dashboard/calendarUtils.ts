export const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export const getFirstDayOfMonth = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1 // Monday start
}

export const formatCalendarMonth = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

export const navigateMonth = (
  direction: "prev" | "next",
  calendarDate: Date
): Date => {
  const newDate = new Date(calendarDate)
  newDate.setMonth(
    calendarDate.getMonth() + (direction === "next" ? 1 : -1)
  )
  return newDate
}

export const isToday = (day: number, calendarDate: Date) => {
  const today = new Date()
  return (
    day === today.getDate() &&
    calendarDate.getMonth() === today.getMonth() &&
    calendarDate.getFullYear() === today.getFullYear()
  )
}

export const formatDateKey = (date: Date, day: number) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`
}