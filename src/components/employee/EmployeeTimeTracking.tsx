"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, CheckCircle, XCircle } from "lucide-react"
import { formatDate, formatTime } from "@/src/utils/format-utils"
import { getCurrentUser } from "@/src/utils/auth-utils"
import type { User, TimeEntry } from "@/src/types"

export default function EmployeeTimeTracking() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [weeklyHours, setWeeklyHours] = useState(0)
  const [todayHours, setTodayHours] = useState(0)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
      loadTimeEntries(user.id)
    }
  }, [])

  const loadTimeEntries = (userId: string) => {
    try {
      setIsLoading(true)
      // Load time entries from localStorage
      const storedEntries = localStorage.getItem("timeEntries")
      let entries: TimeEntry[] = []

      if (storedEntries) {
        entries = JSON.parse(storedEntries).filter((entry: TimeEntry) => entry.userId === userId)
        setTimeEntries(entries)

        // Check if user is currently clocked in
        const activeEntry = entries.find((entry) => entry.clockOutTime === null)
        if (activeEntry) {
          setIsClockedIn(true)
          setCurrentEntry(activeEntry)
        }

        // Calculate hours
        calculateHours(entries)
      }
    } catch (error) {
      console.error("Error loading time entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateHours = (entries: TimeEntry[]) => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    let weeklyTotal = 0
    let todayTotal = 0

    entries.forEach((entry) => {
      const clockInDate = new Date(entry.clockInTime)
      const clockOutDate = entry.clockOutTime ? new Date(entry.clockOutTime) : new Date()
      const durationMs = clockOutDate.getTime() - clockInDate.getTime()
      const durationHours = durationMs / (1000 * 60 * 60)

      if (clockInDate >= startOfWeek) {
        weeklyTotal += durationHours
      }

      if (clockInDate >= startOfToday) {
        todayTotal += durationHours
      }
    })

    setWeeklyHours(Number.parseFloat(weeklyTotal.toFixed(2)))
    setTodayHours(Number.parseFloat(todayTotal.toFixed(2)))
  }

  const handleClockIn = () => {
    if (!currentUser) return

    const newEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      userId: currentUser.id,
      clockInTime: new Date().toISOString(),
      clockOutTime: null,
      notes: "",
    }

    // Save to localStorage
    const storedEntries = localStorage.getItem("timeEntries")
    const allEntries: TimeEntry[] = storedEntries ? JSON.parse(storedEntries) : []
    allEntries.push(newEntry)
    localStorage.setItem("timeEntries", JSON.stringify(allEntries))

    // Update state
    setIsClockedIn(true)
    setCurrentEntry(newEntry)
    loadTimeEntries(currentUser.id)
  }

  const handleClockOut = () => {
    if (!currentUser || !currentEntry) return

    // Update the current entry with clock out time
    const storedEntries = localStorage.getItem("timeEntries")
    if (storedEntries) {
      const allEntries: TimeEntry[] = JSON.parse(storedEntries)
      const updatedEntries = allEntries.map((entry) => {
        if (entry.id === currentEntry.id) {
          return {
            ...entry,
            clockOutTime: new Date().toISOString(),
          }
        }
        return entry
      })

      localStorage.setItem("timeEntries", JSON.stringify(updatedEntries))

      // Update state
      setIsClockedIn(false)
      setCurrentEntry(null)
      loadTimeEntries(currentUser.id)
    }
  }

  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    const start = new Date(clockIn).getTime()
    const end = clockOut ? new Date(clockOut).getTime() : Date.now()
    const durationMs = end - start

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clock In/Out Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Time Clock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-4xl font-bold">
                {isClockedIn ? (
                  <span className="text-green-600">On Duty</span>
                ) : (
                  <span className="text-gray-600">Off Duty</span>
                )}
              </div>

              {isClockedIn && currentEntry && (
                <div className="text-sm text-gray-500">
                  Clocked in at {formatTime(new Date(currentEntry.clockInTime))}
                </div>
              )}

              <Button
                className="w-full"
                variant={isClockedIn ? "destructive" : "default"}
                onClick={isClockedIn ? handleClockOut : handleClockIn}
              >
                {isClockedIn ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Clock Out
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Clock In
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Time Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-700 font-medium">Today</div>
                <div className="text-2xl font-bold">{todayHours} hours</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-700 font-medium">This Week</div>
                <div className="text-2xl font-bold">{weeklyHours} hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries.length > 0 ? (
            <div className="space-y-4">
              {timeEntries
                .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())
                .slice(0, 10)
                .map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{formatDate(new Date(entry.clockInTime))}</div>
                      <div className="text-sm text-gray-500">
                        {formatTime(new Date(entry.clockInTime))} -{" "}
                        {entry.clockOutTime ? formatTime(new Date(entry.clockOutTime)) : "Active"}
                      </div>
                    </div>
                    <div className="font-medium">{calculateDuration(entry.clockInTime, entry.clockOutTime)}</div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">No time entries found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
