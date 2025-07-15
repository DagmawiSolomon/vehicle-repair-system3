"use client"

import { useState, useEffect } from "react"
import {
  getTimeAdjustments,
  adjustTimeEntry,
  formatTime,
  formatDate,
  formatDuration,
  getTimeEntriesForDateRange,
} from "../../utils/time-utils"
import type { TimeEntry, TimeAdjustment, User } from "../../types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Clock, FileText, Edit, ChevronLeft, ChevronRight, AlertCircle, Search, Download } from "lucide-react"
import { format, addWeeks, subDays } from "date-fns"

interface TimeManagementProps {
  currentUser: User
  allUsers: User[]
}

export default function TimeManagement({ currentUser, allUsers }: TimeManagementProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([])
  const [adjustments, setAdjustments] = useState<TimeAdjustment[]>([])
  const [selectedTechnician, setSelectedTechnician] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: subDays(new Date(), 7),
    end: new Date(),
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [showAdjustDialog, setShowAdjustDialog] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [adjustmentData, setAdjustmentData] = useState({
    clockInTime: "",
    clockOutTime: "",
    breakDuration: 0,
    reason: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load time entries
  useEffect(() => {
    loadTimeEntries()
    loadAdjustments()
  }, [dateRange])

  // Filter entries when filters change
  useEffect(() => {
    filterEntries()
  }, [timeEntries, selectedTechnician, searchQuery])

  // Load time entries for the date range
  const loadTimeEntries = () => {
    const entries = getTimeEntriesForDateRange(dateRange.start, dateRange.end)
    setTimeEntries(entries)
  }

  // Load time adjustments
  const loadAdjustments = () => {
    const allAdjustments = getTimeAdjustments()
    setAdjustments(allAdjustments)
  }

  // Filter entries based on selected filters
  const filterEntries = () => {
    let filtered = [...timeEntries]

    // Filter by technician
    if (selectedTechnician !== "all") {
      filtered = filtered.filter((entry) => entry.technicianId === selectedTechnician)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.technicianName.toLowerCase().includes(query) ||
          (entry.notes && entry.notes.toLowerCase().includes(query)),
      )
    }

    setFilteredEntries(filtered)
  }

  // Set date range to previous period
  const goToPreviousPeriod = () => {
    const daysInRange = Math.round((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    setDateRange({
      start: subDays(dateRange.start, daysInRange),
      end: subDays(dateRange.end, daysInRange),
    })
  }

  // Set date range to next period
  const goToNextPeriod = () => {
    const daysInRange = Math.round((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    setDateRange({
      start: addWeeks(dateRange.start, 1),
      end: addWeeks(dateRange.end, 1),
    })
  }

  // Format date range for display
  const formatDateRange = () => {
    return `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d, yyyy")}`
  }

  // Open adjustment dialog
  const openAdjustDialog = (entry: TimeEntry) => {
    setSelectedEntry(entry)
    setAdjustmentData({
      clockInTime: entry.clockInTime.substring(0, 16), // Format for datetime-local input
      clockOutTime: entry.clockOutTime ? entry.clockOutTime.substring(0, 16) : "",
      breakDuration: entry.breakDuration,
      reason: "",
    })
    setShowAdjustDialog(true)
  }

  // Submit time adjustment
  const submitAdjustment = () => {
    if (!selectedEntry) return

    setLoading(true)
    setError(null)

    try {
      adjustTimeEntry(
        selectedEntry.id,
        currentUser.name,
        {
          clockInTime: adjustmentData.clockInTime,
          clockOutTime: adjustmentData.clockOutTime,
          breakDuration: adjustmentData.breakDuration,
        },
        adjustmentData.reason,
      )

      setShowAdjustDialog(false)
      loadTimeEntries()
      loadAdjustments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Export time data to CSV
  const exportToCSV = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Add headers
    csvContent += "Technician,Date,Clock In,Clock Out,Break (min),Total Hours,Notes,Status\n"

    // Add data rows
    filteredEntries.forEach((entry) => {
      const row = [
        entry.technicianName,
        formatDate(entry.clockInTime),
        formatTime(entry.clockInTime),
        entry.clockOutTime ? formatTime(entry.clockOutTime) : "Active",
        entry.breakDuration,
        entry.totalHours || "",
        entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : "",
        entry.status,
      ]

      csvContent += row.join(",") + "\n"
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `time-entries-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)

    // Trigger download
    link.click()

    // Clean up
    document.body.removeChild(link)
  }

  // Calculate total hours for filtered entries
  const calculateTotalHours = () => {
    return filteredEntries.reduce((total, entry) => {
      return total + (entry.totalHours || 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Time Management
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={goToPreviousPeriod}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{formatDateRange()}</span>
              <Button variant="outline" size="icon" onClick={goToNextPeriod}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Manage and review technician time entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search technicians or notes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-64">
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {allUsers
                    .filter((user) => user.role === "technician")
                    .map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 flex flex-col md:flex-row justify-between">
            <div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Hours</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {calculateTotalHours().toFixed(2)} hours
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Entries</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{filteredEntries.length}</div>
            </div>
            <div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Active Sessions</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {filteredEntries.filter((e) => e.status === "active").length}
              </div>
            </div>
          </div>

          {filteredEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Break</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.technicianName}</TableCell>
                    <TableCell>{formatDate(entry.clockInTime)}</TableCell>
                    <TableCell>{formatTime(entry.clockInTime)}</TableCell>
                    <TableCell>{entry.clockOutTime ? formatTime(entry.clockOutTime) : "-"}</TableCell>
                    <TableCell>{entry.breakDuration} min</TableCell>
                    <TableCell>{entry.totalHours ? formatDuration(entry.totalHours) : "-"}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          entry.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : entry.status === "adjusted"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {entry.status === "active" ? "Active" : entry.status === "adjusted" ? "Adjusted" : "Completed"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openAdjustDialog(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No time entries found for the selected filters</div>
          )}
        </CardContent>
      </Card>

      {/* Adjustment History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Adjustment History
          </CardTitle>
          <CardDescription>Review time entry adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          {adjustments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Adjusted By</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>{formatDate(adjustment.timestamp)}</TableCell>
                    <TableCell>{adjustment.adjustedBy}</TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {adjustment.previousClockIn !== adjustment.newClockIn && (
                          <div>
                            Clock In: {formatTime(adjustment.previousClockIn || "")} →{" "}
                            {formatTime(adjustment.newClockIn || "")}
                          </div>
                        )}
                        {adjustment.previousClockOut !== adjustment.newClockOut && (
                          <div>
                            Clock Out: {adjustment.previousClockOut ? formatTime(adjustment.previousClockOut) : "None"}{" "}
                            → {adjustment.newClockOut ? formatTime(adjustment.newClockOut) : "None"}
                          </div>
                        )}
                        {adjustment.previousBreakDuration !== adjustment.newBreakDuration && (
                          <div>
                            Break: {adjustment.previousBreakDuration} min → {adjustment.newBreakDuration} min
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{adjustment.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No adjustments have been made</div>
          )}
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Time Entry</DialogTitle>
            <DialogDescription>Make changes to the time entry. All adjustments are logged.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clockInTime">Clock In Time</Label>
              <Input
                id="clockInTime"
                type="datetime-local"
                value={adjustmentData.clockInTime}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, clockInTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clockOutTime">Clock Out Time</Label>
              <Input
                id="clockOutTime"
                type="datetime-local"
                value={adjustmentData.clockOutTime}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, clockOutTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                min="0"
                value={adjustmentData.breakDuration}
                onChange={(e) =>
                  setAdjustmentData({ ...adjustmentData, breakDuration: Number.parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Adjustment</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this adjustment is needed..."
                value={adjustmentData.reason}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitAdjustment} disabled={loading || !adjustmentData.reason}>
              {loading ? "Processing..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
