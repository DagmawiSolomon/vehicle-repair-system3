"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  X,
  ImageIcon,
  Car,
  Camera,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Plus,
  FileImage,
  Loader2,
} from "lucide-react"
import type { Vehicle, RepairImage } from "@/src/types"
import { fileToBase64, validateImageFile, resizeImage } from "@/src/utils/image-utils"
import { parseDistance } from "@/src/utils/format-utils"
import { getCompanySettings } from "@/src/utils/company-utils"

interface EmployeeVehicleFormProps {
  onSubmit: (vehicle: Vehicle) => void
  onCancel: () => void
  initialData?: Vehicle
  isOpen: boolean
}

export default function EmployeeVehicleForm({ onSubmit, onCancel, initialData, isOpen }: EmployeeVehicleFormProps) {
  const [formData, setFormData] = useState({
    make: initialData?.make || "",
    model: initialData?.model || "",
    year: initialData?.year?.toString() || "",
    vin: initialData?.vin || "",
    licensePlate: initialData?.licensePlate || "",
    color: initialData?.color || "",
    mileage: initialData?.mileage?.toLocaleString() || "",
    type: initialData?.type || "car",
    ownerName: initialData?.owner?.name || "",
    ownerEmail: initialData?.owner?.email || "",
    ownerPhone: initialData?.owner?.phone || "",
    notes: initialData?.notes || "",
  })

  const [images, setImages] = useState<RepairImage[]>(initialData?.images || [])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState("")
  const [previewImage, setPreviewImage] = useState<RepairImage | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const settings = getCompanySettings()
  const distanceUnit = settings.distanceUnit || "km"

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadError("")
    setUploadSuccess("")

    const fileNames = files.map((f) => f.name)
    setUploadingFiles(fileNames)

    try {
      const newImages: RepairImage[] = []
      let successCount = 0
      let errorCount = 0

      for (const file of files) {
        try {
          if (!validateImageFile(file)) {
            setUploadError((prev) => prev + `❌ ${file.name}: Invalid file format or size. `)
            errorCount++
            continue
          }

          const base64 = await fileToBase64(file)
          const resized = await resizeImage(base64)

          const imageData: RepairImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "before",
            description: `Vehicle photo - ${file.name.split(".")[0]}`,
            url: resized,
            filename: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          }

          newImages.push(imageData)
          successCount++
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error)
          errorCount++
        }
      }

      if (successCount > 0) {
        setImages((prev) => [...prev, ...newImages])
        setUploadSuccess(`✅ Successfully uploaded ${successCount} vehicle photo${successCount !== 1 ? "s" : ""}!`)

        // Auto-hide success message after 4 seconds
        setTimeout(() => setUploadSuccess(""), 4000)
      }

      if (errorCount > 0 && successCount === 0) {
        setUploadError(
          `❌ Failed to upload ${errorCount} file${errorCount !== 1 ? "s" : ""}. Please check file formats and sizes.`,
        )
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      setUploadError("❌ An unexpected error occurred during upload. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadingFiles([])
    }
  }

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId))
    setUploadSuccess("🗑️ Vehicle photo removed successfully")
    setTimeout(() => setUploadSuccess(""), 2000)
  }

  const updateImageDescription = (imageId: string, description: string) => {
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, description } : img)))
  }

  const updateImageType = (imageId: string, type: RepairImage["type"]) => {
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, type } : img)))
  }

  const downloadImage = (image: RepairImage) => {
    const link = document.createElement("a")
    link.href = image.url
    link.download = image.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.make || !formData.model || !formData.year || !formData.vin || !formData.ownerName) {
      setUploadError("❌ Please fill in all required fields marked with *")
      return
    }

    const vehicle: Vehicle = {
      id: initialData?.id || `vehicle-${Date.now()}`,
      make: formData.make,
      model: formData.model,
      year: Number.parseInt(formData.year),
      vin: formData.vin,
      licensePlate: formData.licensePlate,
      color: formData.color,
      mileage: parseDistance(formData.mileage),
      type: formData.type as "car" | "truck" | "suv" | "van" | "motorcycle",
      owner: {
        name: formData.ownerName,
        email: formData.ownerEmail,
        phone: formData.ownerPhone,
      },
      status: initialData?.status || "active",
      notes: formData.notes,
      images: images,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSubmit(vehicle)
  }

  const getImageTypeIcon = (type: RepairImage["type"]) => {
    switch (type) {
      case "before":
        return <Camera className="h-4 w-4" />
      case "after":
        return <CheckCircle className="h-4 w-4" />
      case "part":
        return <Car className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  const getImageTypeBadge = (type: RepairImage["type"]) => {
    const variants = {
      before: "default",
      after: "secondary",
      part: "outline",
      receipt: "destructive",
    }
    return variants[type] || "default"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {initialData ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update vehicle information and photos"
              : "Enter vehicle details and upload photos for documentation"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert Messages */}
          {uploadError && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="font-medium text-green-800">{uploadSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <AlertDescription className="font-medium text-blue-800">
                Uploading vehicle photos... ({uploadingFiles.length} file{uploadingFiles.length !== 1 ? "s" : ""})
              </AlertDescription>
            </Alert>
          )}

          {/* Vehicle Photos Section - Prominent placement */}
          <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Camera className="h-5 w-5" />
                Vehicle Photos ({images.length})
                {images.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {images.length} Photo{images.length !== 1 ? "s" : ""} Added
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-blue-700">
                📸 Upload photos of the vehicle's exterior, interior, and any relevant details for complete
                documentation
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enhanced Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-500 bg-blue-200 scale-[1.02] shadow-lg"
                    : "border-blue-300 hover:border-blue-400 hover:bg-blue-100/50"
                } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`p-6 rounded-full transition-all duration-300 ${
                      dragActive ? "bg-blue-300 scale-110" : "bg-blue-200"
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-10 w-10 text-blue-700 animate-spin" />
                    ) : (
                      <Upload className={`h-10 w-10 ${dragActive ? "text-blue-800" : "text-blue-600"}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-blue-900 mb-2">
                      {dragActive ? "Drop vehicle photos here!" : "Upload Vehicle Photos"}
                    </p>
                    <p className="text-blue-700 mb-1">Drag and drop multiple files here, or click to select</p>
                    <p className="text-sm text-blue-600">📱 Supports JPG, PNG, GIF, WebP • Maximum 10MB per file</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-blue-400 text-blue-700 hover:bg-blue-100 px-6"
                    >
                      <FileImage className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Select Photos"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add More
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Photo Categories Guide */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-white/70 p-3 rounded-lg text-center">
                  <Camera className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="font-medium text-blue-800">Exterior</p>
                  <p className="text-blue-600 text-xs">Front, sides, rear</p>
                </div>
                <div className="bg-white/70 p-3 rounded-lg text-center">
                  <Car className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="font-medium text-blue-800">Interior</p>
                  <p className="text-blue-600 text-xs">Dashboard, seats</p>
                </div>
                <div className="bg-white/70 p-3 rounded-lg text-center">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="font-medium text-blue-800">Details</p>
                  <p className="text-blue-600 text-xs">VIN, mileage</p>
                </div>
                <div className="bg-white/70 p-3 rounded-lg text-center">
                  <AlertCircle className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="font-medium text-blue-800">Issues</p>
                  <p className="text-blue-600 text-xs">Damage, wear</p>
                </div>
              </div>

              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Uploaded Vehicle Photos
                    </h4>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {images.length} photo{images.length !== 1 ? "s" : ""} •{" "}
                      {(images.reduce((acc, img) => acc + img.size, 0) / 1024 / 1024).toFixed(1)} MB total
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <Card
                        key={image.id}
                        className="overflow-hidden border-blue-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="relative group">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.description}
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewImage(image)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setPreviewImage(image)}
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => downloadImage(image)}
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(image.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <Badge variant={getImageTypeBadge(image.type)} className="flex items-center gap-1">
                              {getImageTypeIcon(image.type)}
                              {image.type}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          <div>
                            <Label htmlFor={`desc-${image.id}`} className="text-xs font-medium">
                              Photo Description
                            </Label>
                            <Input
                              id={`desc-${image.id}`}
                              value={image.description}
                              onChange={(e) => updateImageDescription(image.id, e.target.value)}
                              placeholder="Describe this vehicle photo..."
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`type-${image.id}`} className="text-xs font-medium">
                              Photo Category
                            </Label>
                            <Select
                              value={image.type}
                              onValueChange={(value: RepairImage["type"]) => updateImageType(image.id, value)}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="before">Exterior/Before</SelectItem>
                                <SelectItem value="after">Interior/After</SelectItem>
                                <SelectItem value="part">Parts/Details</SelectItem>
                                <SelectItem value="receipt">Documents/Receipt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{(image.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span className="truncate ml-2 max-w-[120px]">{image.filename}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., Camry"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vin">VIN *</Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                    placeholder="17-character VIN"
                    maxLength={17}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                    placeholder="e.g., ABC123"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g., Blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">Mileage ({distanceUnit}) *</Label>
                  <Input
                    id="mileage"
                    value={formData.mileage}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d,]/g, "")
                      setFormData({ ...formData, mileage: value })
                    }}
                    placeholder="e.g., 50,000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Vehicle Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information about the vehicle..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ownerEmail">Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerPhone">Phone</Label>
                  <Input
                    id="ownerPhone"
                    type="tel"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading} className="min-w-[140px]">
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {initialData ? "Update Vehicle" : "Add Vehicle"}
                  {images.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {images.length} photo{images.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Image Preview Modal */}
        {previewImage && (
          <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {previewImage.description}
                </DialogTitle>
                <DialogDescription>
                  {previewImage.filename} • {(previewImage.size / 1024 / 1024).toFixed(2)} MB • Uploaded{" "}
                  {new Date(previewImage.uploadedAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                <img
                  src={previewImage.url || "/placeholder.svg"}
                  alt={previewImage.description}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => downloadImage(previewImage)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Original
                </Button>
                <Button onClick={() => setPreviewImage(null)}>Close Preview</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
