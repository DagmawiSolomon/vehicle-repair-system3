"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock, LogIn, LogOut, Coffee, AlertCircle } from "lucide-react"
import { getActiveTechnicianTimeEntry, clockInTechnician, clockOutTechnician, formatTime } from "../../utils/time-utils"
import type { TimeEntry, User } from "../../types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ClockInOutButtonProps {
  user: User
  onStatusChange?: () => void
  compact?: boolean
}

export default function ClockInOutButton({ user, onStatusChange, compact = false }: ClockInOutButtonProps) {
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null)
  const [showClockInDialog, setShowClockInDialog] = useState(false)
  const [showClockOutDialog, setShowClockOutDialog] = useState(false)
  const [notes, setNotes] = useState("")
  const [breakDuration, setBreakDuration] = useState(0)
  const [clockInTime, setClockInTime] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is clocked in
  useEffect(() => {
    if (user && user.id) {
      const entry = getActiveTechnicianTimeEntry(user.id)
      setActiveTimeEntry(entry)

      if (entry) {
        setClockInTime(formatTime(entry.clockInTime))
      }
    }
  }, [user])

  // Handle clock in
  const handleClockIn = () => {
    setShowClockInDialog(true)
  }

  // Handle clock out
  const handleClockOut = () => {
    setShowClockOutDialog(true)
  }

  // Submit clock in
  const submitClockIn = () => {
    setLoading(true)
    setError(null)

    try {
      const newEntry = clockInTechnician(user.id, user.name, notes)
      setActiveTimeEntry(newEntry)
      setClockInTime(formatTime(newEntry.clockInTime))
      setShowClockInDialog(false)
      setNotes("")
      if (onStatusChange) onStatusChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Submit clock out
  const submitClockOut = () => {
    setLoading(true)
    setError(null)

    try {
      clockOutTechnician(user.id, user.name, breakDuration, notes)
      setActiveTimeEntry(null)
      setShowClockOutDialog(false)
      setNotes("")
      setBreakDuration(0)
      if (onStatusChange) onStatusChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <>
        {activeTimeEntry ? (
          <Button variant="destructive" size="sm" onClick={handleClockOut} className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Clock Out</span>
          </Button>
        ) : (
          <Button variant="default" size="sm" onClick={handleClockIn} className="flex items-center gap-1">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Clock In</span>
          </Button>
        )}

        {/* Clock In Dialog */}
        <Dialog open={showClockInDialog} onOpenChange={setShowClockInDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clock In</DialogTitle>
              <DialogDescription>You are about to clock in. Add any notes if needed.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Starting work on..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
              <Button variant="outline" onClick={() => setShowClockInDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitClockIn} disabled={loading}>
                {loading ? "Processing..." : "Clock In"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clock Out Dialog */}
        <Dialog open={showClockOutDialog} onOpenChange={setShowClockOutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clock Out</DialogTitle>
              <DialogDescription>
                You are about to clock out. Please enter any breaks taken and notes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                <Input
                  id="breakDuration"
                  type="number"
                  min="0"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number.parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clockOutNotes">Notes (optional)</Label>
                <Textarea
                  id="clockOutNotes"
                  placeholder="Completed tasks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
              <Button variant="outline" onClick={() => setShowClockOutDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitClockOut} disabled={loading}>
                {loading ? "Processing..." : "Clock Out"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Time Tracking
        </h3>

        {activeTimeEntry && <div className="text-sm text-gray-500 dark:text-gray-400">Clocked in at {clockInTime}</div>}
      </div>

      <div className="flex flex-col space-y-4">
        {activeTimeEntry ? (
          <>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-100 dark:border-green-800">
              <div className="flex items-center text-green-700 dark:text-green-400">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Currently clocked in</span>
              </div>
            </div>

            <Button variant="destructive" onClick={handleClockOut} className="w-full">
              <LogOut className="h-5 w-5 mr-2" />
              Clock Out
            </Button>

            <Button variant="outline" onClick={() => setShowClockOutDialog(true)} className="w-full">
              <Coffee className="h-5 w-5 mr-2" />
              Clock Out with Break
            </Button>
          </>
        ) : (
          <Button variant="default" onClick={handleClockIn} className="w-full">
            <LogIn className="h-5 w-5 mr-2" />
            Clock In
          </Button>
        )}
      </div>

      {/* Clock In Dialog */}
      <Dialog open={showClockInDialog} onOpenChange={setShowClockInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clock In</DialogTitle>
            <DialogDescription>You are about to clock in. Add any notes if needed.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Starting work on..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
            <Button variant="outline" onClick={() => setShowClockInDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitClockIn} disabled={loading}>
              {loading ? "Processing..." : "Clock In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clock Out Dialog */}
      <Dialog open={showClockOutDialog} onOpenChange={setShowClockOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clock Out</DialogTitle>
            <DialogDescription>You are about to clock out. Please enter any breaks taken and notes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                min="0"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clockOutNotes">Notes (optional)</Label>
              <Textarea
                id="clockOutNotes"
                placeholder="Completed tasks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
            <Button variant="outline" onClick={() => setShowClockOutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitClockOut} disabled={loading}>
              {loading ? "Processing..." : "Clock Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
