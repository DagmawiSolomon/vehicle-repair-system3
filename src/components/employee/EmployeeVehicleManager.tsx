"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Car, Plus, Search, MoreVertical, Edit, Trash2, Eye, Camera, ImageIcon } from "lucide-react"
import type { Vehicle } from "@/src/types"
import EmployeeVehicleForm from "./EmployeeVehicleForm"

interface EmployeeVehicleManagerProps {
  vehicles: Vehicle[]
  onVehicleAdded: (vehicle: Vehicle) => void
  onVehicleUpdated: (vehicle: Vehicle) => void
  onVehicleDeleted: (vehicleId: string) => void
}

export default function EmployeeVehicleManager({
  vehicles,
  onVehicleAdded,
  onVehicleUpdated,
  onVehicleDeleted,
}: EmployeeVehicleManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null)

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: Vehicle["status"]) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      maintenance: "outline",
      in_repair: "destructive",
      repaired: "default",
      ready_for_pickup: "default",
    }
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      in_repair: "bg-red-100 text-red-800",
      repaired: "bg-blue-100 text-blue-800",
      ready_for_pickup: "bg-purple-100 text-purple-800",
    }
    return { variant: variants[status], color: colors[status] }
  }

  const getVehicleImage = (vehicle: Vehicle) => {
    if (vehicle.images && vehicle.images.length > 0) {
      return vehicle.images[0].url
    }
    return null
  }

  const getImageCount = (vehicle: Vehicle) => {
    return vehicle.images?.length || 0
  }

  const handleAddVehicle = (vehicle: Vehicle) => {
    onVehicleAdded(vehicle)
    setShowAddForm(false)
  }

  const handleUpdateVehicle = (vehicle: Vehicle) => {
    onVehicleUpdated(vehicle)
    setEditingVehicle(null)
  }

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      onVehicleDeleted(vehicleId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
          <p className="text-gray-600">Manage vehicles with photo documentation</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search vehicles by make, model, license plate, or VIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const statusBadge = getStatusBadge(vehicle.status)
          const vehicleImage = getVehicleImage(vehicle)
          const imageCount = getImageCount(vehicle)

          return (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Vehicle Image */}
              <div className="relative h-48 bg-gray-100">
                {vehicleImage ? (
                  <img
                    src={vehicleImage || "/placeholder.svg"}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Car className="h-12 w-12 mb-2" />
                    <span className="text-sm">No photo</span>
                  </div>
                )}

                {/* Image Count Badge */}
                {imageCount > 0 && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      {imageCount}
                    </Badge>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge className={statusBadge.color}>{vehicle.status.replace("_", " ").toUpperCase()}</Badge>
                </div>

                {/* Actions Menu */}
                <div className="absolute bottom-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingVehicle(vehicle)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingVehicle(vehicle)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteVehicle(vehicle.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Vehicle Info */}
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">License:</span> {vehicle.licensePlate || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Mileage:</span> {vehicle.mileage.toLocaleString()}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Owner:</span> {vehicle.owner?.name || "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first vehicle"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          )}
        </div>
      )}

      {/* Add Vehicle Form */}
      {showAddForm && (
        <EmployeeVehicleForm isOpen={showAddForm} onSubmit={handleAddVehicle} onCancel={() => setShowAddForm(false)} />
      )}

      {/* Edit Vehicle Form */}
      {editingVehicle && (
        <EmployeeVehicleForm
          isOpen={!!editingVehicle}
          initialData={editingVehicle}
          onSubmit={handleUpdateVehicle}
          onCancel={() => setEditingVehicle(null)}
        />
      )}

      {/* Vehicle Details Modal */}
      {viewingVehicle && (
        <Dialog open={!!viewingVehicle} onOpenChange={() => setViewingVehicle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {viewingVehicle.year} {viewingVehicle.make} {viewingVehicle.model}
              </DialogTitle>
              <DialogDescription>Vehicle details and photo gallery</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Vehicle Images */}
              {viewingVehicle.images && viewingVehicle.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Photos ({viewingVehicle.images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewingVehicle.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.description}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                          <Badge variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicle Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Make:</span>
                      <span>{viewingVehicle.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Model:</span>
                      <span>{viewingVehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Year:</span>
                      <span>{viewingVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">VIN:</span>
                      <span className="font-mono text-xs">{viewingVehicle.vin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">License Plate:</span>
                      <span>{viewingVehicle.licensePlate || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Color:</span>
                      <span>{viewingVehicle.color || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Mileage:</span>
                      <span>{viewingVehicle.mileage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusBadge(viewingVehicle.status).color}>
                        {viewingVehicle.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Owner Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{viewingVehicle.owner?.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{viewingVehicle.owner?.email || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{viewingVehicle.owner?.phone || "N/A"}</span>
                    </div>
                  </div>

                  {viewingVehicle.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{viewingVehicle.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
