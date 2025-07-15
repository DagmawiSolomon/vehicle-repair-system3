"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Plus,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Upload,
  Camera,
  FileImage,
  Trash2,
  Eye,
  Download,
  Save,
  Clock,
} from "lucide-react"
import { getCurrentUser } from "@/src/utils/auth-utils"
import { fileToBase64, validateImageFile, resizeImage } from "@/src/utils/image-utils"
import type { Vehicle, RepairService } from "@/src/types"

interface EmployeeRepairFormProps {
  vehicles: Vehicle[]
  onRepairAdded: (repair: RepairService) => void
  onClose?: () => void
  embedded?: boolean
}

interface UploadedImage {
  id: string
  file: File
  preview: string
  type: "receipt" | "before" | "after" | "part"
  description: string
}

export default function EmployeeRepairForm({
  vehicles,
  onRepairAdded,
  onClose,
  embedded = false,
}: EmployeeRepairFormProps) {
  const [formData, setFormData] = useState({
    vehicleId: "",
    description: "",
    serviceDate: new Date().toISOString().split("T")[0],
    laborHours: 0,
    cost: 0,
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    parts: [] as string[],
    notes: "",
    estimatedCompletionDate: "",
    customerConcerns: "",
    workPerformed: "",
    recommendations: "",
  })

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedImagePreview, setSelectedImagePreview] = useState<UploadedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentUser = getCurrentUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      // Enhanced validation
      if (!formData.vehicleId) {
        throw new Error("Please select a vehicle")
      }
      if (!formData.description.trim() || formData.description.trim().length < 15) {
        throw new Error("Please provide a detailed description (at least 15 characters)")
      }
      if (!formData.workPerformed.trim() || formData.workPerformed.trim().length < 10) {
        throw new Error("Please describe the work performed (at least 10 characters)")
      }
      if (formData.cost < 0) {
        throw new Error("Cost cannot be negative")
      }
      if (formData.laborHours < 0) {
        throw new Error("Labor hours cannot be negative")
      }
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      // Process uploaded images
      const processedImages = await Promise.all(
        uploadedImages.map(async (img) => {
          const base64 = await fileToBase64(img.file)
          const resized = await resizeImage(base64, 1200, 900)
          return {
            id: img.id,
            type: img.type,
            description: img.description,
            url: resized,
            filename: img.file.name,
            size: img.file.size,
            uploadedAt: new Date().toISOString(),
          }
        }),
      )

      const newRepair: RepairService = {
        id: `repair-${Date.now()}`,
        vehicleId: formData.vehicleId,
        description: formData.description.trim(),
        serviceDate: formData.serviceDate,
        technician: currentUser.name,
        laborHours: formData.laborHours,
        cost: formData.cost,
        status: "pending",
        priority: formData.priority,
        parts: formData.parts.filter((part) => part.trim() !== ""),
        notes: formData.notes.trim(),
        assignedTo: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedCompletionDate: formData.estimatedCompletionDate || undefined,
        customerConcerns: formData.customerConcerns.trim() || undefined,
        workPerformed: formData.workPerformed.trim(),
        recommendations: formData.recommendations.trim() || undefined,
        images: processedImages,
        statusHistory: [
          {
            id: `status-${Date.now()}`,
            status: "pending",
            timestamp: new Date().toISOString(),
            updatedBy: currentUser.id,
            notes: "Repair created",
          },
        ],
      }

      // Save to localStorage with error handling
      try {
        const existingRepairs = JSON.parse(localStorage.getItem("repairs") || "[]")
        const updatedRepairs = [...existingRepairs, newRepair]
        localStorage.setItem("repairs", JSON.stringify(updatedRepairs))

        // Also save images separately for better performance
        const existingImages = JSON.parse(localStorage.getItem("repairImages") || "{}")
        existingImages[newRepair.id] = processedImages
        localStorage.setItem("repairImages", JSON.stringify(existingImages))

        console.log("Repair saved successfully:", newRepair.id)
      } catch (storageError) {
        console.error("Storage error:", storageError)
        throw new Error("Failed to save repair data. Please try again.")
      }

      onRepairAdded(newRepair)
      setSuccess("Repair added successfully with all attachments!")
      resetForm()

      // Auto-close after success if not embedded
      if (onClose && !embedded) {
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (err) {
      console.error("Error adding repair:", err)
      setError(err instanceof Error ? err.message : "Failed to add repair")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      vehicleId: "",
      description: "",
      serviceDate: new Date().toISOString().split("T")[0],
      laborHours: 0,
      cost: 0,
      priority: "medium",
      parts: [],
      notes: "",
      estimatedCompletionDate: "",
      customerConcerns: "",
      workPerformed: "",
      recommendations: "",
    })
    setUploadedImages([])
    setError("")
    setSuccess("")
  }

  const handleFileUpload = async (files: FileList | null, type: UploadedImage["type"] = "receipt") => {
    if (!files) return

    const validFiles = Array.from(files).filter((file) => {
      if (!validateImageFile(file)) {
        setError(`${file.name} is not a valid image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError(`${file.name} is too large. Maximum size is 10MB`)
        return false
      }
      return true
    })

    for (const file of validFiles) {
      try {
        const preview = await fileToBase64(file)
        const newImage: UploadedImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview,
          type,
          description: `${type} image - ${file.name}`,
        }
        setUploadedImages((prev) => [...prev, newImage])
      } catch (err) {
        console.error("Error processing file:", err)
        setError(`Failed to process ${file.name}`)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const updateImageDescription = (imageId: string, description: string) => {
    setUploadedImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, description } : img)))
  }

  const updateImageType = (imageId: string, type: UploadedImage["type"]) => {
    setUploadedImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, type } : img)))
  }

  const addPart = () => {
    setFormData({ ...formData, parts: [...formData.parts, ""] })
  }

  const updatePart = (index: number, value: string) => {
    const newParts = [...formData.parts]
    newParts[index] = value
    setFormData({ ...formData, parts: newParts })
  }

  const removePart = (index: number) => {
    const newParts = formData.parts.filter((_, i) => i !== index)
    setFormData({ ...formData, parts: newParts })
  }

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId)

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Vehicle Selection */}
      <div className="space-y-2">
        <Label htmlFor="vehicleId">Vehicle *</Label>
        <Select value={formData.vehicleId} onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedVehicle && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-blue-900">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </p>
                <p className="text-sm text-blue-700">VIN: {selectedVehicle.vin}</p>
                <p className="text-sm text-blue-700">License: {selectedVehicle.licensePlate}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Mileage: {selectedVehicle.mileage.toLocaleString()} miles</p>
                <Badge variant={selectedVehicle.status === "active" ? "default" : "secondary"}>
                  {selectedVehicle.status}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Concerns */}
      <div className="space-y-2">
        <Label htmlFor="customerConcerns">Customer Concerns</Label>
        <Textarea
          id="customerConcerns"
          value={formData.customerConcerns}
          onChange={(e) => setFormData({ ...formData, customerConcerns: e.target.value })}
          placeholder="What issues or concerns did the customer report? Include symptoms, noises, performance issues..."
          rows={3}
          className="min-h-[80px] resize-y"
          maxLength={500}
        />
        <p className="text-xs text-gray-500">{formData.customerConcerns.length}/500 characters</p>
      </div>

      {/* Repair Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Repair Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Provide a comprehensive description of the repair needed. Include diagnosis, root cause analysis, and repair approach..."
          required
          rows={4}
          className="min-h-[120px] resize-y"
          maxLength={1500}
        />
        <p className="text-xs text-gray-500">{formData.description.length}/1500 characters</p>
      </div>

      {/* Work Performed */}
      <div className="space-y-2">
        <Label htmlFor="workPerformed">Work Performed *</Label>
        <Textarea
          id="workPerformed"
          value={formData.workPerformed}
          onChange={(e) => setFormData({ ...formData, workPerformed: e.target.value })}
          placeholder="Detail the actual work completed. Include procedures, parts replaced, adjustments made, testing performed..."
          required
          rows={4}
          className="min-h-[120px] resize-y"
          maxLength={1500}
        />
        <p className="text-xs text-gray-500">{formData.workPerformed.length}/1500 characters</p>
      </div>

      {/* Service Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serviceDate">Service Date</Label>
          <Input
            id="serviceDate"
            type="date"
            value={formData.serviceDate}
            onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="laborHours">Labor Hours</Label>
          <Input
            id="laborHours"
            type="number"
            step="0.25"
            value={formData.laborHours}
            onChange={(e) => setFormData({ ...formData, laborHours: Number.parseFloat(e.target.value) || 0 })}
            min="0"
            placeholder="0.0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Total Cost</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number.parseFloat(e.target.value) || 0 })}
              min="0"
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Estimated Completion */}
      <div className="space-y-2">
        <Label htmlFor="estimatedCompletionDate">Estimated Completion Date</Label>
        <Input
          id="estimatedCompletionDate"
          type="date"
          value={formData.estimatedCompletionDate}
          onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Parts Used */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Parts Used</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPart}>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>
        {formData.parts.map((part, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={part}
              onChange={(e) => updatePart(index, e.target.value)}
              placeholder="Part name, part number, quantity, and description"
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={() => removePart(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {formData.parts.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No parts added yet. Click "Add Part" to include parts used in this repair.
          </p>
        )}
      </div>

      {/* Photo Upload Section */}
      <div className="space-y-4">
        <Label>Photo Documentation</Label>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium">Upload Photos</p>
              <p className="text-sm text-gray-500">Drag and drop images here, or click to select files</p>
              <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG, GIF, WebP (max 10MB each)</p>
            </div>
            <div className="flex justify-center space-x-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileImage className="h-4 w-4 mr-2" />
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Quick Upload Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "image/*"
              input.multiple = true
              input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, "receipt")
              input.click()
            }}
          >
            <FileImage className="h-4 w-4 mr-1" />
            Receipts
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "image/*"
              input.multiple = true
              input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, "before")
              input.click()
            }}
          >
            <Camera className="h-4 w-4 mr-1" />
            Before Photos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "image/*"
              input.multiple = true
              input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, "after")
              input.click()
            }}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            After Photos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "image/*"
              input.multiple = true
              input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, "part")
              input.click()
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Parts Photos
          </Button>
        </div>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Uploaded Images ({uploadedImages.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="border rounded-lg p-3 space-y-3">
                  <div className="relative">
                    <img
                      src={image.preview || "/placeholder.svg"}
                      alt={image.description}
                      className="w-full h-32 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedImagePreview(image)}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Select
                      value={image.type}
                      onValueChange={(value: UploadedImage["type"]) => updateImageType(image.id, value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receipt">Receipt</SelectItem>
                        <SelectItem value="before">Before Photo</SelectItem>
                        <SelectItem value="after">After Photo</SelectItem>
                        <SelectItem value="part">Part Photo</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={image.description}
                      onChange={(e) => updateImageDescription(image.id, e.target.value)}
                      placeholder="Image description..."
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{(image.file.size / 1024 / 1024).toFixed(1)}MB</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedImagePreview(image)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <Label htmlFor="recommendations">Recommendations</Label>
        <Textarea
          id="recommendations"
          value={formData.recommendations}
          onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
          placeholder="Future maintenance recommendations, potential issues to monitor, suggested follow-up work..."
          rows={3}
          className="min-h-[80px] resize-y"
          maxLength={500}
        />
        <p className="text-xs text-gray-500">{formData.recommendations.length}/500 characters</p>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional notes, special instructions, warranty information, or internal comments..."
          rows={3}
          className="min-h-[80px] resize-y"
          maxLength={500}
        />
        <p className="text-xs text-gray-500">{formData.notes.length}/500 characters</p>
      </div>

      {/* Submit Section */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={
            isSubmitting || !formData.vehicleId || !formData.description.trim() || !formData.workPerformed.trim()
          }
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Add Repair
            </>
          )}
        </Button>
      </div>
    </form>
  )

  if (embedded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add New Repair</CardTitle>
          <CardDescription>Create a comprehensive repair record with detailed documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <FormContent />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Repair</DialogTitle>
            <DialogDescription>Create a comprehensive repair record with detailed documentation</DialogDescription>
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {selectedImagePreview && (
        <Dialog open={true} onOpenChange={() => setSelectedImagePreview(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedImagePreview.description}</DialogTitle>
              <DialogDescription>
                Type: {selectedImagePreview.type} | Size: {(selectedImagePreview.file.size / 1024 / 1024).toFixed(1)}MB
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={selectedImagePreview.preview || "/placeholder.svg"}
                alt={selectedImagePreview.description}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = selectedImagePreview.preview
                  link.download = selectedImagePreview.file.name
                  link.click()
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setSelectedImagePreview(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
