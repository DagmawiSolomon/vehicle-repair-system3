"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { CompanySettings } from "../types"
import { getCompanySettings, updateCompanySettings, requestNotificationPermission } from "../utils/company-utils"
import { fileToBase64, validateImageFile, resizeImage } from "../utils/image-utils"
import { Settings, Upload, X, Plus, Bell, Save } from "lucide-react"

interface CompanySettingsProps {
  onClose: () => void
}

export default function CompanySettingsComponent({ onClose }: CompanySettingsProps) {
  const [settings, setSettings] = useState<CompanySettings>(getCompanySettings())
  const [logoError, setLogoError] = useState("")
  const [saveMessage, setSaveMessage] = useState("")
  const [newServiceType, setNewServiceType] = useState("")
  const [newVehicleCategory, setNewVehicleCategory] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) {
      setLogoError("Please upload a valid image file (JPEG, PNG, GIF, WEBP)")
      return
    }

    try {
      setLogoError("")
      const base64 = await fileToBase64(file)
      const resized = await resizeImage(base64, 300, 300)
      setSettings((prev) => ({ ...prev, logo: resized }))
    } catch (error) {
      console.error("Error processing image:", error)
      setLogoError("Failed to process image. Please try again.")
    }
  }

  const removeLogo = () => {
    setSettings((prev) => ({ ...prev, logo: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAddServiceType = () => {
    if (!newServiceType.trim()) return

    if (!settings.serviceTypes.includes(newServiceType.trim())) {
      setSettings((prev) => ({
        ...prev,
        serviceTypes: [...prev.serviceTypes, newServiceType.trim()],
      }))
    }

    setNewServiceType("")
  }

  const handleRemoveServiceType = (type: string) => {
    setSettings((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.filter((t) => t !== type),
    }))
  }

  const handleAddVehicleCategory = () => {
    if (!newVehicleCategory.trim()) return

    if (!settings.vehicleCategories.includes(newVehicleCategory.trim())) {
      setSettings((prev) => ({
        ...prev,
        vehicleCategories: [...prev.vehicleCategories, newVehicleCategory.trim()],
      }))
    }

    setNewVehicleCategory("")
  }

  const handleRemoveVehicleCategory = (category: string) => {
    setSettings((prev) => ({
      ...prev,
      vehicleCategories: prev.vehicleCategories.filter((c) => c !== category),
    }))
  }

  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setSettings((prev) => ({
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          enableBrowserNotifications: true,
        },
      }))
    } else {
      setSettings((prev) => ({
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          enableBrowserNotifications: false,
        },
      }))
    }
  }

  const handleSaveSettings = () => {
    updateCompanySettings(settings)
    setSaveMessage("Settings saved successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Settings className="h-6 w-6 mr-2 text-gray-500" />
          Company Settings
        </h2>
        <button onClick={onClose} className="px-3 py-1 border rounded hover:bg-gray-50">
          Close
        </button>
      </div>

      {saveMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">{saveMessage}</div>
      )}

      <div className="space-y-6">
        {/* Company Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Company Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={settings.name}
                  onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={settings.address}
                  onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded"
                    value={settings.phone}
                    onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded"
                    value={settings.email}
                    onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  className="w-full p-2 border rounded"
                  value={settings.website}
                  onChange={(e) => setSettings((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Company Logo</label>
              <div className="flex items-center space-x-4">
                {settings.logo ? (
                  <div className="relative">
                    <img
                      src={settings.logo || "/placeholder.svg"}
                      alt="Company logo"
                      className="w-32 h-32 object-contain rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                    <Settings className="h-8 w-8 mb-1" />
                    <span className="text-xs">No logo</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="company-logo"
                    className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {settings.logo ? "Change Logo" : "Upload Logo"}
                  </label>
                  <input
                    id="company-logo"
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF or WEBP (max. 5MB)</p>
                  {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Units and Currency Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Units and Currency</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Distance Unit</label>
              <select
                className="w-full p-2 border rounded"
                value={settings.distanceUnit}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    distanceUnit: e.target.value as "km" | "miles",
                  }))
                }
              >
                <option value="km">Kilometers (km)</option>
                <option value="miles">Miles</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Used for mileage and service intervals</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={settings.currencyCode}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        currencyCode: e.target.value,
                      }))
                    }
                    placeholder="ETB"
                    maxLength={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Currency code (e.g., ETB)</p>
                </div>

                <div>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={settings.currencySymbol}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        currencySymbol: e.target.value,
                      }))
                    }
                    placeholder="ETB"
                    maxLength={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Currency symbol</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Types */}
        <div>
          <h3 className="text-lg font-medium mb-4">Service Types</h3>

          <div className="mb-4">
            <div className="flex">
              <input
                type="text"
                className="flex-grow p-2 border rounded-l"
                value={newServiceType}
                onChange={(e) => setNewServiceType(e.target.value)}
                placeholder="Add new service type..."
              />
              <button
                onClick={handleAddServiceType}
                className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.serviceTypes.map((type, index) => (
              <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center group">
                <span className="text-sm">{type}</span>
                <button
                  onClick={() => handleRemoveServiceType(type)}
                  className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Categories */}
        <div>
          <h3 className="text-lg font-medium mb-4">Vehicle Categories</h3>

          <div className="mb-4">
            <div className="flex">
              <input
                type="text"
                className="flex-grow p-2 border rounded-l"
                value={newVehicleCategory}
                onChange={(e) => setNewVehicleCategory(e.target.value)}
                placeholder="Add new vehicle category..."
              />
              <button
                onClick={handleAddVehicleCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.vehicleCategories.map((category, index) => (
              <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center group">
                <span className="text-sm">{category}</span>
                <button
                  onClick={() => handleRemoveVehicleCategory(category)}
                  className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Notification Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable-browser-notifications"
                checked={settings.notificationSettings.enableBrowserNotifications}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      enableBrowserNotifications: e.target.checked,
                    },
                  }))
                }
                className="mr-2"
              />
              <label htmlFor="enable-browser-notifications" className="text-sm">
                Enable browser notifications
              </label>
              <button
                onClick={handleRequestNotificationPermission}
                className="ml-3 text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Bell className="h-3 w-3 mr-1" />
                Request Permission
              </button>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable-email-notifications"
                checked={settings.notificationSettings.enableEmailNotifications}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      enableEmailNotifications: e.target.checked,
                    },
                  }))
                }
                className="mr-2"
              />
              <label htmlFor="enable-email-notifications" className="text-sm">
                Enable email notifications
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Due Reminder Days</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={settings.notificationSettings.serviceDueReminderDays}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      serviceDueReminderDays: Number(e.target.value),
                    },
                  }))
                }
                min="1"
                max="30"
              />
              <p className="text-xs text-gray-500 mt-1">Send reminders this many days before service is due</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
