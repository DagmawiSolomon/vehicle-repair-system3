"use client"

import { useState } from "react"
import type { Vehicle } from "../types"
import { isServiceDue, calculateNextServiceDate, getServiceDueInfo } from "../utils/vehicle-utils"
import { formatDate, formatDistance } from "../utils/format-utils"
import { getCompanySettings } from "../utils/company-utils"
import { Bell, Calendar, AlertTriangle, CheckCircle, Settings, Clock } from "lucide-react"

interface ServiceNotificationsProps {
  vehicle: Vehicle
  onUpdateServiceSettings: (serviceInterval: number, distanceInterval: number) => void
}

export default function ServiceNotifications({ vehicle, onUpdateServiceSettings }: ServiceNotificationsProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [serviceInterval, setServiceInterval] = useState(vehicle.serviceInterval || 90) // Default: 90 days
  const [distanceInterval, setDistanceInterval] = useState(vehicle.distanceInterval?.toLocaleString() || "5000") // Default: 5000 km

  const settings = getCompanySettings()
  const distanceUnit = settings.distanceUnit || "km"

  const serviceDue = isServiceDue(vehicle)
  const nextServiceDate = calculateNextServiceDate(vehicle)
  const { daysUntilDue, distanceUntilDue } = getServiceDueInfo(vehicle)

  const handleSaveSettings = () => {
    onUpdateServiceSettings(serviceInterval, Number.parseFloat(distanceInterval.replace(/,/g, "")) || 5000)
    setShowSettings(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <Bell className="h-5 w-5 mr-2 text-gray-500" />
          Service Notifications
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Settings className="h-4 w-4 mr-1" />
          {showSettings ? "Cancel" : "Configure"}
        </button>
      </div>

      {showSettings ? (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-3">Service Interval Settings</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Time-based Interval (days)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={serviceInterval}
                onChange={(e) => setServiceInterval(Number(e.target.value))}
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Recommend service every {serviceInterval} days</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Distance-based Interval ({distanceUnit})</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={distanceInterval}
                onChange={(e) => {
                  // Allow only numbers and commas
                  const value = e.target.value.replace(/[^\d,]/g, "")
                  setDistanceInterval(value)
                }}
                placeholder={`e.g. 5,000 ${distanceUnit}`}
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommend service every {distanceInterval} {distanceUnit}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`p-4 rounded-lg ${serviceDue ? "bg-red-50 border border-red-200" : "bg-white border border-gray-200"}`}
        >
          <div className="flex items-start">
            {serviceDue ? (
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
            )}

            <div>
              <h4 className={`font-medium ${serviceDue ? "text-red-700" : "text-green-700"}`}>
                {serviceDue ? "Service Due" : "Service Status: Up to Date"}
              </h4>

              <div className="mt-2 space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Last service: {formatDate(vehicle.lastServiceDate)}</span>
                </div>

                {nextServiceDate && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Next recommended service: {formatDate(nextServiceDate)}</span>
                  </div>
                )}

                {daysUntilDue !== null && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className={daysUntilDue <= 0 ? "text-red-600 font-medium" : ""}>
                      {daysUntilDue <= 0
                        ? `Overdue by ${Math.abs(daysUntilDue)} days`
                        : `${daysUntilDue} days until next service`}
                    </span>
                  </div>
                )}

                {distanceUntilDue !== null && vehicle.distanceInterval && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className={distanceUntilDue <= 0 ? "text-red-600 font-medium" : ""}>
                      {distanceUntilDue <= 0
                        ? `Overdue by ${Math.abs(distanceUntilDue).toLocaleString()} ${distanceUnit}`
                        : `${distanceUntilDue.toLocaleString()} ${distanceUnit} until next service`}
                    </span>
                  </div>
                )}

                {vehicle.serviceInterval && (
                  <p className="text-sm text-gray-600">Service interval: Every {vehicle.serviceInterval} days</p>
                )}

                {vehicle.distanceInterval && (
                  <p className="text-sm text-gray-600">
                    Distance interval: Every {vehicle.distanceInterval.toLocaleString()} {distanceUnit}
                  </p>
                )}
              </div>

              {serviceDue && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-sm text-red-700">
                    This vehicle is due for service. Please schedule maintenance as soon as possible.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service History Summary */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium mb-3 flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          Service History Summary
        </h4>

        {vehicle.lastServiceDate ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Service Date:</span>
              <span className="font-medium">{formatDate(vehicle.lastServiceDate)}</span>
            </div>

            {nextServiceDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Service Due:</span>
                <span className="font-medium">{formatDate(nextServiceDate)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Mileage:</span>
              <span className="font-medium">{formatDistance(vehicle.mileage)}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Service records are automatically updated when repair records are marked as completed.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No service history available. Add a repair record and mark it as completed to update service history.
          </p>
        )}
      </div>
    </div>
  )
}
