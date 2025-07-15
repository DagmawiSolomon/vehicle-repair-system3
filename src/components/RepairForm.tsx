"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Vehicle, RepairService } from "../types"
import { fileToBase64, validateImageFile, resizeImage } from "../utils/image-utils"
import { getVehicleStatusHistory } from "../utils/vehicle-utils"
import { getCompanySettings } from "../utils/company-utils"
import { Upload, X, Plus, Info, Receipt } from "lucide-react"

interface RepairFormProps {
  vehicle: Vehicle
  onSubmit: (repairData: RepairService, updateStatus: boolean, statusNotes?: string) => void
  onCancel: () => void
  initialData?: RepairService
}

export function RepairForm({ vehicle, onSubmit, onCancel, initialData }: RepairFormProps) {
  const [description, setDescription] = useState(initialData?.description || "")
  const [cost, setCost] = useState(initialData?.cost?.toLocaleString() || "")
  const [serviceDate, setServiceDate] = useState(initialData?.serviceDate || new Date().toISOString().split("T")[0])
  const [technician, setTechnician] = useState(initialData?.technician || "")
  const [parts, setParts] = useState(initialData?.parts?.join(", ") || "")
  const [laborHours, setLaborHours] = useState(initialData?.laborHours?.toString() || "")
  const [status, setStatus] = useState(initialData?.status || "pending")
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [receiptImage, setReceiptImage] = useState<string>(initialData?.receiptImage || "")
  const [imageError, setImageError] = useState("")
  const [receiptError, setReceiptError] = useState("")
  const [updateVehicleStatus, setUpdateVehicleStatus] = useState(false)
  const [statusNotes, setStatusNotes] = useState("")
  const [isFollowUpRepair, setIsFollowUpRepair] = useState(false)
  const [isEditingCompleted, setIsEditingCompleted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  const settings = getCompanySettings()

  // Check if this is a follow-up repair
  useEffect(() => {
    const statusHistory = getVehicleStatusHistory(vehicle.id)
    const hasCompletedStatus = statusHistory.some(
      (entry) => entry.newStatus === "repaired" || entry.newStatus === "ready_for_pickup",
    )

    setIsFollowUpRepair(hasCompletedStatus && !initialData)

    // Check if editing a completed repair
    if (initialData && initialData.status === "completed") {
      setIsEditingCompleted(true)
    }
  }, [vehicle.id, initialData])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!validateImageFile(file)) {
        setImageError("Please upload valid image files (JPEG, PNG, GIF, WEBP)")
        continue
      }

      try {
        const base64 = await fileToBase64(file)
        const resized = await resizeImage(base64)
        setImages((prev) => [...prev, resized])
        setImageError("")
      } catch (error) {
        console.error("Error processing image:", error)
        setImageError("Failed to process image. Please try again.")
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0] // Only take the first file

    if (!validateImageFile(file)) {
      setReceiptError("Please upload a valid image file (JPEG, PNG, GIF, WEBP)")
      return
    }

    try {
      const base64 = await fileToBase64(file)
      const resized = await resizeImage(base64, 1200, 1600) // Higher resolution for receipt
      setReceiptImage(resized)
      setReceiptError("")
    } catch (error) {
      console.error("Error processing receipt image:", error)
      setReceiptError("Failed to process receipt image. Please try again.")
    }

    // Reset file input
    if (receiptInputRef.current) {
      receiptInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeReceiptImage = () => {
    setReceiptImage("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // If editing a completed repair, only allow updating notes and images
    let updatedRepairData: RepairService

    if (isEditingCompleted) {
      // Preserve original data, only update notes and images
      updatedRepairData = {
        ...initialData!,
        notes,
        images,
        receiptImage,
        updatedAt: new Date().toISOString(),
      }
    } else {
      // Normal update or new repair
      updatedRepairData = {
        id: initialData?.id || `repair-${Date.now()}`,
        vehicleId: vehicle.id,
        description,
        cost: Number.parseFloat(cost.replace(/,/g, "")) || 0,
        serviceDate,
        technician,
        parts: parts
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
        laborHours: Number.parseFloat(laborHours) || 0,
        status,
        notes,
        images,
        receiptImage,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    onSubmit(updatedRepairData, updateVehicleStatus, statusNotes)
  }

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        {initialData
          ? isEditingCompleted
            ? "Update Completed Repair Record"
            : "Edit Repair Record"
          : isFollowUpRepair
            ? "Add Follow-up Repair"
            : "Add Repair Record"}
      </h3>

      {isFollowUpRepair && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-700">
              This vehicle has previously been marked as completed. You are now creating a follow-up repair.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This is useful for recording additional work or new issues that have arisen since the original repair was
              completed.
            </p>
          </div>
        </div>
      )}

      {isEditingCompleted && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> This repair has been marked as completed. To maintain record integrity, you can only
            update notes and images.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className={`w-full p-2 border rounded ${isEditingCompleted ? "bg-gray-100" : ""}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            disabled={isEditingCompleted}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cost ({settings.currencyCode})</label>
            <input
              type="text"
              className={`w-full p-2 border rounded ${isEditingCompleted ? "bg-gray-100" : ""}`}
              value={cost}
              onChange={(e) => {
                // Allow only numbers and commas
                const value = e.target.value.replace(/[^\d,]/g, "")
                setCost(value)
              }}
              placeholder="e.g. 1,000,000"
              required
              disabled={isEditingCompleted}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Service Date</label>
            <input
              type="date"
              className={`w-full p-2 border rounded ${isEditingCompleted ? "bg-gray-100" : ""}`}
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              required
              disabled={isEditingCompleted}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Technician</label>
            <input
              type="text"
              className={`w-full p-2 border rounded ${isEditingCompleted ? "bg-gray-100" : ""}`}
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              required
              disabled={isEditingCompleted}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Labor Hours</label>
            <input
              type="number"
              className={`w-full p-2 border rounded ${isEditingCompleted ? "bg-gray-100" : ""}`}
              value={laborHours}
              onChange={(e) => setLaborHours(e.target.value)}
              min="0"
              step="0.5"
              disabled={isEditingCompleted}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Parts (comma separated)</label>
          <input
            type="text"
            className={`w-full p-2 border rounded ${isEditingCompleted ? "bg-gray-100" : ""}`}
            value={parts}
            onChange={(e) => setParts(e.target.value)}
            placeholder="Oil filter, Air filter, Brake pads"
            disabled={isEditingCompleted}
          />
        </div>

        {!isEditingCompleted && (
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full p-2 border rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isEditingCompleted}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="w-full p-2 border rounded"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any additional notes about this repair..."
          />
        </div>

        {/* Receipt Image Upload Section */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2 flex items-center">
            <Receipt className="h-4 w-4 mr-2" />
            Receipt Image
          </label>

          <div className="mb-3">
            <label
              htmlFor="receipt-image"
              className="cursor-pointer px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 inline-flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Receipt
            </label>
            <input
              id="receipt-image"
              type="file"
              ref={receiptInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleReceiptUpload}
            />
            <span className="text-xs text-gray-500 ml-2">Upload a clear image of the repair receipt</span>
            {receiptError && <p className="text-xs text-red-500 mt-1">{receiptError}</p>}
          </div>

          {receiptImage && (
            <div className="relative mb-4 inline-block">
              <div className="border rounded-lg p-2 bg-gray-50">
                <div className="relative">
                  <img
                    src={receiptImage || "/placeholder.svg"}
                    alt="Receipt"
                    className="max-h-48 object-contain rounded border bg-white"
                  />
                  <button
                    type="button"
                    onClick={removeReceiptImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">Receipt image (click to view in detail)</p>
              </div>
            </div>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">Repair Images</label>

          <div className="mb-3">
            <label
              htmlFor="repair-images"
              className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 inline-flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </label>
            <input
              id="repair-images"
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              multiple
            />
            <span className="text-xs text-gray-500 ml-2">JPEG, PNG, GIF or WEBP (max. 5MB each)</span>
            {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Repair image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <label
                htmlFor="repair-images-add"
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-xs">Add More</span>
                <input
                  id="repair-images-add"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  multiple
                />
              </label>
            </div>
          )}
        </div>

        {status === "completed" && !isEditingCompleted && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="update-vehicle-status"
                checked={updateVehicleStatus}
                onChange={(e) => setUpdateVehicleStatus(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="update-vehicle-status" className="text-sm text-blue-800 font-medium">
                Update vehicle status
              </label>
            </div>

            {updateVehicleStatus && (
              <div className="ml-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">New Status</label>
                  <select className="w-full p-2 border rounded bg-white">
                    <option value="repaired">Repaired</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status Change Notes</label>
                  <textarea
                    className="w-full p-2 border rounded bg-white"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows={2}
                    placeholder="Add notes about this status change..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {initialData ? (isEditingCompleted ? "Update Notes & Images" : "Update Repair") : "Save Repair"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RepairForm
