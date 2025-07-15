"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Vehicle, StatusHistory } from "../types"
import { getStatusName, getStatusColorClass, getVehicleStatusHistory } from "../utils/vehicle-utils"
import { AlertTriangle, Info } from "lucide-react"

interface StatusUpdateFormProps {
  vehicle: Vehicle
  onUpdate: (vehicleId: string, newStatus: Vehicle["status"], notes?: string) => void
  onCancel: () => void
}

export default function StatusUpdateForm({ vehicle, onUpdate, onCancel }: StatusUpdateFormProps) {
  const [status, setStatus] = useState<Vehicle["status"]>(vehicle.status)
  const [notes, setNotes] = useState("")
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [hasCompletedStatus, setHasCompletedStatus] = useState(false)

  // Load status history to check for completed status
  useEffect(() => {
    const history = getVehicleStatusHistory(vehicle.id)
    setStatusHistory(history)

    // Check if vehicle has ever been marked as completed
    const completedStatus = history.some(
      (entry) => entry.newStatus === "repaired" || entry.newStatus === "ready_for_pickup",
    )
    setHasCompletedStatus(completedStatus)
  }, [vehicle.id])

  const statusOptions = [
    { value: "active", label: "Active", description: "Vehicle is in normal operation" },
    { value: "inactive", label: "Inactive", description: "Vehicle is not currently in use" },
    { value: "maintenance", label: "Maintenance", description: "Vehicle is undergoing maintenance" },
    { value: "in_repair", label: "In Repair", description: "Vehicle is currently being repaired" },
    { value: "repaired", label: "Repaired", description: "Vehicle has been repaired" },
    { value: "ready_for_pickup", label: "Ready for Pickup", description: "Vehicle is repaired and ready for pickup" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(vehicle.id, status, notes)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Update Vehicle Status</h3>

      {hasCompletedStatus && vehicle.status !== "repaired" && vehicle.status !== "ready_for_pickup" && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-700">
              This vehicle has previously been marked as completed. You are now creating a follow-up action.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This is useful for recording additional work or new issues that have arisen since the original repair was
              completed.
            </p>
          </div>
        </div>
      )}

      {(vehicle.status === "repaired" || vehicle.status === "ready_for_pickup") && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-700 font-medium">This vehicle is currently marked as completed.</p>
            <p className="text-xs text-yellow-600 mt-1">
              To maintain record integrity, you can only change the status to another completed state or create a new
              repair entry for follow-up work.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Current Status</label>
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColorClass(vehicle.status)}`}></span>
              <span className="font-medium">{getStatusName(vehicle.status)}</span>
            </div>
          </div>

          <label className="block text-sm font-medium mb-2">New Status</label>
          <div className="space-y-2">
            {statusOptions.map((option) => {
              // If current status is completed, only allow changing to another completed status
              const isDisabled =
                (vehicle.status === "repaired" || vehicle.status === "ready_for_pickup") &&
                option.value !== "repaired" &&
                option.value !== "ready_for_pickup"

              return (
                <div
                  key={option.value}
                  className={`border rounded-lg p-3 transition-colors ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed border-gray-200"
                      : status === option.value
                        ? "border-blue-500 bg-blue-50 cursor-pointer"
                        : "border-gray-200 hover:border-gray-300 cursor-pointer"
                  }`}
                  onClick={() => !isDisabled && setStatus(option.value as Vehicle["status"])}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`status-${option.value}`}
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={() => !isDisabled && setStatus(option.value as Vehicle["status"])}
                      disabled={isDisabled}
                      className="mr-2"
                    />
                    <div>
                      <label
                        htmlFor={`status-${option.value}`}
                        className={`font-medium ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {option.label}
                      </label>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this status change..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            These notes will be saved in the status history for future reference.
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={status === vehicle.status}
          >
            Update Status
          </button>
        </div>
      </form>
    </div>
  )
}
