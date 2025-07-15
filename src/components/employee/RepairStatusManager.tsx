"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, CheckCircle, AlertCircle, XCircle, Play, Save, History, User, Calendar } from "lucide-react"
import { getCurrentUser } from "@/src/utils/auth-utils"
import { formatDate, formatTime } from "@/src/utils/format-utils"
import type { RepairService } from "@/src/types"

interface RepairStatusManagerProps {
  repair: RepairService
  onStatusUpdate: (repairId: string, newStatus: RepairService["status"], notes?: string) => void
  onClose?: () => void
}

export default function RepairStatusManager({ repair, onStatusUpdate, onClose }: RepairStatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState<RepairService["status"]>(repair.status)
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const currentUser = getCurrentUser()

  const statusOptions = [
    {
      value: "pending" as const,
      label: "Pending",
      description: "Repair is waiting to be started",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    {
      value: "in_progress" as const,
      label: "In Progress",
      description: "Repair work is currently being performed",
      icon: Play,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      value: "completed" as const,
      label: "Completed",
      description: "Repair work has been finished",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      value: "cancelled" as const,
      label: "Cancelled",
      description: "Repair has been cancelled",
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-200",
    },
  ]

  const handleStatusUpdate = async () => {
    if (!currentUser) {
      setError("User not authenticated")
      return
    }

    if (selectedStatus === repair.status && !notes.trim()) {
      setError("Please select a different status or add notes")
      return
    }

    setIsUpdating(true)
    setError("")
    setSuccess("")

    try {
      // Validate status transition
      const validTransitions = getValidTransitions(repair.status)
      if (selectedStatus !== repair.status && !validTransitions.includes(selectedStatus)) {
        throw new Error(`Cannot change status from ${repair.status} to ${selectedStatus}`)
      }

      onStatusUpdate(repair.id, selectedStatus, notes.trim() || undefined)
      setSuccess("Status updated successfully!")

      // Auto-close after success
      if (onClose) {
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (err) {
      console.error("Error updating status:", err)
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  const getValidTransitions = (currentStatus: RepairService["status"]): RepairService["status"][] => {
    switch (currentStatus) {
      case "pending":
        return ["in_progress", "cancelled"]
      case "in_progress":
        return ["completed", "pending", "cancelled"]
      case "completed":
        return ["in_progress"] // Allow reopening if needed
      case "cancelled":
        return ["pending"] // Allow reactivation
      default:
        return []
    }
  }

  const getCurrentStatusOption = () => {
    return statusOptions.find((option) => option.value === repair.status)
  }

  const getSelectedStatusOption = () => {
    return statusOptions.find((option) => option.value === selectedStatus)
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {getCurrentStatusOption() && (
              <>
                \{getCurrentStatusOption().icon && <getCurrentStatusOption().icon className="h-5 w-5" />}
                <Badge className={getCurrentStatusOption()?.color}>{getCurrentStatusOption()?.label}</Badge>
                <span className="text-sm text-gray-600">{getCurrentStatusOption()?.description}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={(value: RepairService["status"]) => setSelectedStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const isValid =
                    option.value === repair.status || getValidTransitions(repair.status).includes(option.value)
                  return (
                    <SelectItem key={option.value} value={option.value} disabled={!isValid}>
                      <div className="flex items-center gap-2">
                        {option.icon && <option.icon className="h-4 w-4" />}
                        <span>{option.label}</span>
                        {!isValid && <span className="text-xs text-gray-400">(Not allowed)</span>}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {getSelectedStatusOption() && (
              <p className="text-sm text-gray-600">{getSelectedStatusOption()?.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Status Update Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this status change (optional)..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{notes.length}/500 characters</p>
          </div>

          <div className="flex justify-end space-x-2">
            {onClose && (
              <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                Cancel
              </Button>
            )}
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating || (selectedStatus === repair.status && !notes.trim())}
            >
              {isUpdating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      {repair.statusHistory && repair.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Status History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repair.statusHistory
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((entry) => {
                  const statusOption = statusOptions.find((opt) => opt.value === entry.status)
                  return (
                    <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {statusOption && <statusOption.icon className="h-4 w-4 mt-1" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>
                            {statusOption?.label || entry.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(entry.timestamp)} at {formatTime(new Date(entry.timestamp))}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-3 w-3" />
                          <span>Updated by {entry.updatedBy}</span>
                        </div>
                        {entry.notes && <p className="text-sm text-gray-700 mt-1 italic">"{entry.notes}"</p>}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
