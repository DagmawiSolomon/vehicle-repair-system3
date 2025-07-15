"use client"

import { useState } from "react"
import { getCompanySettings, updateCompanySettings } from "../utils/company-utils"
import { Save, RefreshCw, Database, Shield } from "lucide-react"

interface AdminSettingsProps {
  logActivity: (action: string, category: string, description: string) => void
}

export default function AdminSettings({ logActivity }: AdminSettingsProps) {
  const [settings, setSettings] = useState(getCompanySettings())
  const [backupFrequency, setBackupFrequency] = useState("weekly")
  const [saveMessage, setSaveMessage] = useState("")
  const [isBackingUp, setIsBackingUp] = useState(false)

  const handleSaveSettings = () => {
    updateCompanySettings(settings)
    setSaveMessage("Settings saved successfully!")
    logActivity("Update settings", "Settings", "Updated company settings")

    setTimeout(() => {
      setSaveMessage("")
    }, 3000)
  }

  const handleBackupData = () => {
    setIsBackingUp(true)

    // Simulate backup process
    setTimeout(() => {
      // Create backup data
      const backupData = {
        timestamp: new Date().toISOString(),
        vehicles: localStorage.getItem("vehicles") || "[]",
        repairs: localStorage.getItem("vehicleRepairs") || "[]",
        statusHistory: localStorage.getItem("statusHistory") || "[]",
        users: localStorage.getItem("users") || "[]",
        settings: localStorage.getItem("companySettings") || "{}",
      }

      // Convert to JSON string
      const backupString = JSON.stringify(backupData)

      // Create download link
      const blob = new Blob([backupString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `garage_system_backup_${new Date().toISOString().split("T")[0]}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsBackingUp(false)
      logActivity("Backup data", "Settings", "Created system data backup")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Settings</h2>

      {saveMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{saveMessage}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Company Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Currency Code</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={settings.currencyCode}
                  onChange={(e) => setSettings({ ...settings, currencyCode: e.target.value })}
                  maxLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Distance Unit</label>
                <select
                  className="w-full p-2 border rounded"
                  value={settings.distanceUnit}
                  onChange={(e) => setSettings({ ...settings, distanceUnit: e.target.value as "km" | "miles" })}
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="miles">Miles</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Due Reminder (days)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={settings.notificationSettings.serviceDueReminderDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationSettings: {
                      ...settings.notificationSettings,
                      serviceDueReminderDays: Number(e.target.value),
                    },
                  })
                }
                min="1"
                max="30"
              />
              <p className="text-xs text-gray-500 mt-1">Number of days before service is due to show reminders</p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveSettings}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-gray-500" />
            Data Backup & Restore
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Backup Frequency</label>
              <select
                className="w-full p-2 border rounded"
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="manual">Manual Only</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">How often the system should remind you to backup data</p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleBackupData}
                disabled={isBackingUp}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Backing Up...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Backup Now
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2">Creates a downloadable JSON file with all system data</p>
            </div>

            <div className="pt-4 mt-4 border-t">
              <h4 className="font-medium mb-2">Restore from Backup</h4>
              <div className="flex items-center">
                <input
                  type="file"
                  accept=".json"
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload a previously created backup file to restore system data
              </p>
              <button
                onClick={() => {
                  alert("In a production system, this would restore data from the uploaded backup file")
                  logActivity("Restore attempt", "Settings", "Attempted to restore from backup")
                }}
                className="mt-3 flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Restore Data
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-gray-500" />
            Security Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admin Password</label>
              <div className="flex">
                <input type="password" className="flex-grow p-2 border rounded-l" placeholder="••••••••" disabled />
                <button
                  onClick={() => {
                    alert("In a production system, this would allow changing the admin password")
                    logActivity("Password change attempt", "Security", "Attempted to change admin password")
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-r border-t border-r border-b"
                >
                  Change
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">For demo purposes, the password is fixed as "admin123"</p>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="enable-session-timeout" className="mr-2" />
              <label htmlFor="enable-session-timeout" className="text-sm">
                Enable session timeout after inactivity
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
              <input type="number" className="w-full p-2 border rounded" defaultValue={30} min="5" max="120" />
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  alert("Security settings would be saved in a production system")
                  logActivity("Security settings", "Security", "Updated security settings")
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">System Information</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Version:</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Backup:</span>
              <span className="text-sm font-medium">Never</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Database Size:</span>
              <span className="text-sm font-medium">
                {Math.round(
                  ((localStorage.getItem("vehicles")?.length || 0) +
                    (localStorage.getItem("vehicleRepairs")?.length || 0) +
                    (localStorage.getItem("statusHistory")?.length || 0) +
                    (localStorage.getItem("users")?.length || 0) +
                    (localStorage.getItem("companySettings")?.length || 0) +
                    (localStorage.getItem("activityLogs")?.length || 0)) /
                    1024,
                )}{" "}
                KB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Browser Storage:</span>
              <span className="text-sm font-medium">LocalStorage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Environment:</span>
              <span className="text-sm font-medium">Development</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear all system data? This cannot be undone!")) {
                  alert("In a production system, this would clear all data after additional confirmation")
                  logActivity("System reset attempt", "Settings", "Attempted to reset system data")
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset System Data
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Warning: This will permanently delete all vehicles, repairs, and other system data
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
