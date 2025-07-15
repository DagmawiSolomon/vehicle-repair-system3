import type { TimeEntry, TimeAdjustment } from "../types"

// Get all time entries from localStorage
export const getTimeEntries = (): TimeEntry[] => {
  if (typeof window === "undefined") return []

  const entries = localStorage.getItem("timeEntries")
  return entries ? JSON.parse(entries) : []
}

// Save time entries to localStorage
export const saveTimeEntries = (entries: TimeEntry[]): void => {
  if (typeof window === "undefined") return

  localStorage.setItem("timeEntries", JSON.stringify(entries))
}

// Get time adjustments from localStorage
export const getTimeAdjustments = (): TimeAdjustment[] => {
  if (typeof window === "undefined") return []

  const adjustments = localStorage.getItem("timeAdjustments")
  return adjustments ? JSON.parse(adjustments) : []
}

// Save time adjustments to localStorage
export const saveTimeAdjustments = (adjustments: TimeAdjustment[]): void => {
  if (typeof window === "undefined") return

  localStorage.setItem("timeAdjustments", JSON.stringify(adjustments))
}

// Get active time entry for a technician
export const getActiveTechnicianTimeEntry = (technicianId: string): TimeEntry | null => {
  const entries = getTimeEntries()
  return entries.find((entry) => entry.technicianId === technicianId && entry.status === "active") || null
}

// Clock in a technician
export const clockInTechnician = (technicianId: string, technicianName: string, notes?: string): TimeEntry => {
  const entries = getTimeEntries()

  // Check if technician is already clocked in
  const activeEntry = getActiveTechnicianTimeEntry(technicianId)
  if (activeEntry) {
    throw new Error("Technician is already clocked in")
  }

  // Create new time entry
  const newEntry: TimeEntry = {
    id: `time-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    technicianId,
    technicianName,
    clockInTime: new Date().toISOString(),
    breakDuration: 0,
    status: "active",
    notes: notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Save to localStorage
  saveTimeEntries([...entries, newEntry])

  // Log activity
  logTimeActivity(technicianId, technicianName, "clock-in")

  return newEntry
}

// Clock out a technician
export const clockOutTechnician = (
  technicianId: string,
  technicianName: string,
  breakDuration?: number,
  notes?: string,
  associatedRepairIds?: string[],
): TimeEntry => {
  const entries = getTimeEntries()

  // Find active time entry
  const activeEntryIndex = entries.findIndex(
    (entry) => entry.technicianId === technicianId && entry.status === "active",
  )

  if (activeEntryIndex === -1) {
    throw new Error("No active time entry found for this technician")
  }

  // Update the entry
  const clockOutTime = new Date().toISOString()
  const updatedEntry = {
    ...entries[activeEntryIndex],
    clockOutTime,
    breakDuration: breakDuration !== undefined ? breakDuration : entries[activeEntryIndex].breakDuration,
    notes: notes ? `${entries[activeEntryIndex].notes} ${notes}`.trim() : entries[activeEntryIndex].notes,
    status: "completed" as const,
    associatedRepairIds: associatedRepairIds || entries[activeEntryIndex].associatedRepairIds,
    totalHours: calculateTotalHours(
      new Date(entries[activeEntryIndex].clockInTime),
      new Date(clockOutTime),
      breakDuration !== undefined ? breakDuration : entries[activeEntryIndex].breakDuration,
    ),
    updatedAt: new Date().toISOString(),
  }

  // Update entries array
  entries[activeEntryIndex] = updatedEntry
  saveTimeEntries(entries)

  // Log activity
  logTimeActivity(technicianId, technicianName, "clock-out")

  return updatedEntry
}

// Calculate total hours worked
export const calculateTotalHours = (clockIn: Date, clockOut: Date, breakDuration: number): number => {
  // Calculate total milliseconds
  const totalMilliseconds = clockOut.getTime() - clockIn.getTime()

  // Convert to hours and subtract break
  const totalHours = totalMilliseconds / (1000 * 60 * 60)
  const breakHours = breakDuration / 60

  // Return with 2 decimal places
  return Math.round((totalHours - breakHours) * 100) / 100
}

// Format duration in hours and minutes
export const formatDuration = (hours: number): string => {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (wholeHours === 0) {
    return `${minutes} min`
  } else if (minutes === 0) {
    return `${wholeHours} hr`
  } else {
    return `${wholeHours} hr ${minutes} min`
  }
}

// Format time for display
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
}

// Log time tracking activity
const logTimeActivity = (technicianId: string, technicianName: string, action: string): void => {
  if (typeof window === "undefined") return

  const logs = localStorage.getItem("activityLogs")
  const activityLogs = logs ? JSON.parse(logs) : []

  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action: action === "clock-in" ? "Clock In" : "Clock Out",
    category: "Time Tracking",
    description: `${technicianName} ${action === "clock-in" ? "clocked in" : "clocked out"}`,
    user: technicianName,
    ipAddress: "local",
  }

  localStorage.setItem("activityLogs", JSON.stringify([newLog, ...activityLogs]))
}

// Get time entries for a specific technician
export const getTechnicianTimeEntries = (technicianId: string): TimeEntry[] => {
  const entries = getTimeEntries()
  return entries.filter((entry) => entry.technicianId === technicianId)
}

// Get time entries for a date range
export const getTimeEntriesForDateRange = (startDate: Date, endDate: Date): TimeEntry[] => {
  const entries = getTimeEntries()
  return entries.filter((entry) => {
    const clockInDate = new Date(entry.clockInTime)
    return clockInDate >= startDate && clockInDate <= endDate
  })
}

// Adjust a time entry (for admin use)
export const adjustTimeEntry = (
  timeEntryId: string,
  adjustedBy: string,
  updates: {
    clockInTime?: string
    clockOutTime?: string
    breakDuration?: number
    notes?: string
  },
  reason: string,
): { timeEntry: TimeEntry; adjustment: TimeAdjustment } => {
  const entries = getTimeEntries()
  const adjustments = getTimeAdjustments()

  // Find the entry to adjust
  const entryIndex = entries.findIndex((entry) => entry.id === timeEntryId)
  if (entryIndex === -1) {
    throw new Error("Time entry not found")
  }

  const originalEntry = entries[entryIndex]

  // Create adjustment record
  const adjustment: TimeAdjustment = {
    id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timeEntryId,
    adjustedBy,
    previousClockIn: originalEntry.clockInTime,
    newClockIn: updates.clockInTime,
    previousClockOut: originalEntry.clockOutTime,
    newClockOut: updates.clockOutTime,
    previousBreakDuration: originalEntry.breakDuration,
    newBreakDuration: updates.breakDuration,
    reason,
    timestamp: new Date().toISOString(),
  }

  // Update the entry
  const updatedEntry: TimeEntry = {
    ...originalEntry,
    clockInTime: updates.clockInTime || originalEntry.clockInTime,
    clockOutTime: updates.clockOutTime || originalEntry.clockOutTime,
    breakDuration: updates.breakDuration !== undefined ? updates.breakDuration : originalEntry.breakDuration,
    notes: updates.notes ? `${originalEntry.notes} [ADJUSTED: ${updates.notes}]` : originalEntry.notes,
    status: "adjusted",
    updatedAt: new Date().toISOString(),
  }

  // Recalculate total hours if both clock times are present
  if (updatedEntry.clockInTime && updatedEntry.clockOutTime) {
    updatedEntry.totalHours = calculateTotalHours(
      new Date(updatedEntry.clockInTime),
      new Date(updatedEntry.clockOutTime),
      updatedEntry.breakDuration,
    )
  }

  // Save changes
  entries[entryIndex] = updatedEntry
  saveTimeEntries(entries)
  saveTimeAdjustments([...adjustments, adjustment])

  // Log activity
  const activityLogs = localStorage.getItem("activityLogs")
  const logs = activityLogs ? JSON.parse(activityLogs) : []

  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action: "Time Entry Adjusted",
    category: "Time Tracking",
    description: `Time entry for ${originalEntry.technicianName} was adjusted by ${adjustedBy}`,
    user: adjustedBy,
    ipAddress: "local",
  }

  localStorage.setItem("activityLogs", JSON.stringify([newLog, ...logs]))

  return { timeEntry: updatedEntry, adjustment }
}

// Get weekly summary for a technician
export const getWeeklySummary = (
  technicianId: string,
  weekStartDate: Date,
): {
  totalHours: number
  entries: TimeEntry[]
  dailyHours: { [key: string]: number }
} => {
  // Clone the date to avoid modifying the original
  const startDate = new Date(weekStartDate)

  // Ensure we're starting from the beginning of the day
  startDate.setHours(0, 0, 0, 0)

  // Calculate end date (7 days later)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 7)
  endDate.setHours(23, 59, 59, 999)

  // Get entries for the week
  const allEntries = getTimeEntries()
  const weekEntries = allEntries.filter((entry) => {
    const entryDate = new Date(entry.clockInTime)
    return (
      entry.technicianId === technicianId && entryDate >= startDate && entryDate <= endDate && entry.status !== "active" // Only include completed entries
    )
  })

  // Calculate total hours
  const totalHours = weekEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0)

  // Calculate daily hours
  const dailyHours: { [key: string]: number } = {}

  // Initialize all days of the week with 0 hours
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate)
    day.setDate(day.getDate() + i)
    const dayKey = day.toISOString().split("T")[0]
    dailyHours[dayKey] = 0
  }

  // Fill in actual hours
  weekEntries.forEach((entry) => {
    const dayKey = new Date(entry.clockInTime).toISOString().split("T")[0]
    dailyHours[dayKey] = (dailyHours[dayKey] || 0) + (entry.totalHours || 0)
  })

  return {
    totalHours,
    entries: weekEntries,
    dailyHours,
  }
}
