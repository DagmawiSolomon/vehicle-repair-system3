"use client"

import { useState, useEffect } from "react"
import {
  getTechnicianTimeEntries,
  formatTime,
  formatDate,
  formatDuration,
  getWeeklySummary,
} from "../../utils/time-utils"
import type { TimeEntry, User } from "../../types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, ChevronLeft, ChevronRight, BarChart2, AlertCircle } from "lucide-react"
import ClockInOutButton from "./ClockInOutButton"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns"

interface TechnicianTimeTrackerProps {
  user: User
}

export default function TechnicianTimeTracker({ user }: TechnicianTimeTrackerProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [weekSummary, setWeekSummary] = useState<{
    totalHours: number
    entries: TimeEntry[]
    dailyHours: { [key: string]: number }
  } | null>(null)
  const [activeTab, setActiveTab] = useState("current")

  // Load time entries
  useEffect(() => {
    if (user && user.id) {
      loadTimeEntries()
      loadWeekSummary()
    }
  }, [user, currentWeekStart])

  // Refresh data when clock in/out status changes
  const handleStatusChange = () => {
    loadTimeEntries()
    loadWeekSummary()
  }

  // Load time entries for the technician
  const loadTimeEntries = () => {
    const entries = getTechnicianTimeEntries(user.id)
    setTimeEntries(entries)
  }

  // Load weekly summary
  const loadWeekSummary = () => {
    const summary = getWeeklySummary(user.id, currentWeekStart)
    setWeekSummary(summary)
  }

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1))
  }

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  // Format week range for display
  const formatWeekRange = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
    return `${format(currentWeekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
  }

  // Get day name from date
  const getDayName = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { weekday: "short" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <ClockInOutButton user={user} onStatusChange={handleStatusChange} />
        </div>

        <div className="md:w-2/3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-blue-500" />
                  Weekly Summary
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{formatWeekRange()}</span>
                  <Button variant="outline" size="icon" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>Your work hours for the selected week</CardDescription>
            </CardHeader>
            <CardContent>
              {weekSummary ? (
                <>
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {weekSummary.totalHours.toFixed(2)} hours
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-500">Total hours this week</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mt-4">
                    {Object.entries(weekSummary.dailyHours).map(([date, hours]) => (
                      <div key={date} className="flex flex-col items-center">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{getDayName(date)}</div>
                        <div className="mt-1 w-full bg-gray-100 dark:bg-gray-700 rounded-sm">
                          <div
                            className="bg-blue-500 h-16 rounded-sm flex items-end justify-center"
                            style={{
                              height: `${Math.min(hours * 10, 64)}px`,
                              minHeight: hours > 0 ? "4px" : "0",
                            }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs font-medium">{hours.toFixed(1)}h</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No time entries for this week</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Time Entry History
          </CardTitle>
          <CardDescription>View and manage your time entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="current">Current Week</TabsTrigger>
              <TabsTrigger value="all">All Entries</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              {weekSummary && weekSummary.entries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Break</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weekSummary.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.clockInTime)}</TableCell>
                        <TableCell>{formatTime(entry.clockInTime)}</TableCell>
                        <TableCell>{entry.clockOutTime ? formatTime(entry.clockOutTime) : "Active"}</TableCell>
                        <TableCell>{entry.breakDuration} min</TableCell>
                        <TableCell>{entry.totalHours ? formatDuration(entry.totalHours) : "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">No time entries for the current week</div>
              )}
            </TabsContent>

            <TabsContent value="all">
              {timeEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Break</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.clockInTime)}</TableCell>
                        <TableCell>{formatTime(entry.clockInTime)}</TableCell>
                        <TableCell>{entry.clockOutTime ? formatTime(entry.clockOutTime) : "Active"}</TableCell>
                        <TableCell>{entry.breakDuration} min</TableCell>
                        <TableCell>{entry.totalHours ? formatDuration(entry.totalHours) : "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">No time entries found</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
