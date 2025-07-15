"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { Vehicle } from "../types"
import { fileToBase64, validateImageFile, resizeImage } from "../utils/image-utils"
import { parseDistance } from "../utils/format-utils"
import { getCompanySettings } from "../utils/company-utils"
import { Upload, X, ImageIcon, Calendar } from "lucide-react"

interface VehicleFormProps {
  onSubmit: (vehicle: Vehicle) => void
  onCancel: () => void
  initialData?: Vehicle
}

export function VehicleForm({ onSubmit, onCancel, initialData }: VehicleFormProps) {
  const [make, setMake] = useState(initialData?.make || "")
  const [model, setModel] = useState(initialData?.model || "")
  const [year, setYear] = useState(initialData?.year?.toString() || "")
  const [vin, setVin] = useState(initialData?.vin || "")
  const [licensePlate, setLicensePlate] = useState(initialData?.licensePlate || "")
  const [color, setColor] = useState(initialData?.color || "")
  const [mileage, setMileage] = useState(initialData?.mileage?.toLocaleString() || "")
  const [type, setType] = useState(initialData?.type || "car")
  const [ownerName, setOwnerName] = useState(initialData?.owner?.name || "")
  const [ownerEmail, setOwnerEmail] = useState(initialData?.owner?.email || "")
  const [ownerPhone, setOwnerPhone] = useState(initialData?.owner?.phone || "")
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice?.toLocaleString() || "")
  const [marketValue, setMarketValue] = useState(initialData?.marketValue?.toLocaleString() || "")
  const [lastServiceDate, setLastServiceDate] = useState(initialData?.lastServiceDate || "")
  const [serviceInterval, setServiceInterval] = useState(initialData?.serviceInterval?.toString() || "90") // Default: 90 days
  const [distanceInterval, setDistanceInterval] = useState(initialData?.distanceInterval?.toLocaleString() || "5000") // Default: 5000 km
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [image, setImage] = useState<string | undefined>(initialData?.image)
  const [imageError, setImageError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const settings = getCompanySettings()
  const distanceUnit = settings.distanceUnit || "km"

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) {
      setImageError("Please upload a valid image file (JPEG, PNG, GIF, WEBP)")
      return
    }

    try {
      setImageError("")
      const base64 = await fileToBase64(file)
      const resized = await resizeImage(base64)
      setImage(resized)
    } catch (error) {
      console.error("Error processing image:", error)
      setImageError("Failed to process image. Please try again.")
    }
  }

  const removeImage = () => {
    setImage(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const vehicle: Vehicle = {
      id: initialData?.id || `vehicle-${Date.now()}`,
      make,
      model,
      year: Number.parseInt(year),
      vin,
      licensePlate,
      color,
      mileage: parseDistance(mileage),
      lastServiceDate: lastServiceDate || undefined,
      serviceInterval: serviceInterval ? Number.parseInt(serviceInterval) : undefined,
      distanceInterval: distanceInterval ? parseDistance(distanceInterval) : undefined,
      type: type as "car" | "truck" | "suv" | "van" | "motorcycle",
      owner: {
        name: ownerName,
        email: ownerEmail,
        phone: ownerPhone,
      },
      status: initialData?.status || "active", // Default to 'active' for new vehicles
      purchasePrice: purchasePrice ? Number.parseFloat(purchasePrice.replace(/,/g, "")) : undefined,
      marketValue: marketValue ? Number.parseFloat(marketValue.replace(/,/g, "")) : undefined,
      image,
      notes,
      lastUpdated: initialData?.lastUpdated || new Date().toISOString(),
    }

    onSubmit(vehicle)
  }

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="text-lg font-semibold mb-4">{initialData ? "Edit Vehicle" : "Add New Vehicle"}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Vehicle Image</label>
          <div className="flex items-center space-x-4">
            {image ? (
              <div className="relative">
                <img
                  src={image || "/placeholder.svg"}
                  alt="Vehicle preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="h-8 w-8 mb-1" />
                <span className="text-xs">No image</span>
              </div>
            )}

            <div>
              <label
                htmlFor="vehicle-image"
                className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                {image ? "Change Image" : "Upload Image"}
              </label>
              <input
                id="vehicle-image"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF or WEBP (max. 5MB)</p>
              {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Make</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="1900"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">VIN</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">License Plate</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mileage ({distanceUnit})</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={mileage}
              onChange={(e) => {
                // Allow only numbers and commas
                const value = e.target.value.replace(/[^\d,]/g, "")
                setMileage(value)
              }}
              placeholder="e.g. 50,000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Type</label>
            <select
              className="w-full p-2 border rounded"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Last Service Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full p-2 border rounded pl-9"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Interval (days)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={serviceInterval}
              onChange={(e) => setServiceInterval(e.target.value)}
              min="1"
              placeholder="e.g. 90"
            />
            <p className="text-xs text-gray-500 mt-1">Recommend service every {serviceInterval || 90} days</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Distance Interval ({distanceUnit})</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={distanceInterval}
              onChange={(e) => {
                // Allow only numbers and commas
                const value = e.target.value.replace(/[^\d,]/g, "")
                setDistanceInterval(value)
              }}
              placeholder="e.g. 5,000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommend service every {distanceInterval || "5,000"} {distanceUnit}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Price ({settings.currencyCode})</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={purchasePrice}
              onChange={(e) => {
                // Allow only numbers and commas
                const value = e.target.value.replace(/[^\d,]/g, "")
                setPurchasePrice(value)
              }}
              placeholder="e.g. 500,000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Current Market Value ({settings.currencyCode})</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={marketValue}
              onChange={(e) => {
                // Allow only numbers and commas
                const value = e.target.value.replace(/[^\d,]/g, "")
                setMarketValue(value)
              }}
              placeholder="e.g. 450,000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="w-full p-2 border rounded"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any additional notes about this vehicle..."
          />
        </div>

        <div>
          <h4 className="font-medium mb-2">Owner Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                className="w-full p-2 border rounded"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {initialData ? "Update Vehicle" : "Add Vehicle"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VehicleForm
