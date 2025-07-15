"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Wrench } from "lucide-react"
import type { RepairService, Vehicle } from "@/src/types"

interface AdminRepairManagementProps {
  repairs: RepairService[]
  vehicles: Vehicle[]
  onRepairsChange: (repairs: RepairService[]) => void
  isLoading: boolean
}

export default function AdminRepairManagement({
  repairs,
  vehicles,
  onRepairsChange,
  isLoading,
}: AdminRepairManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<RepairService | null>(null)
  const [formData, setFormData] = useState({
    vehicleId: "",
    description: "",
    serviceDate: new Date().toISOString().split("T")[0],
    technician: "",
    laborHours: 0,
    cost: 0,
    status: "pending" as RepairService["status"],
    parts: [] as string[],
    notes: "",
  })

  const filteredRepairs = repairs.filter((repair) => {
    const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
    const vehicleInfo = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.licensePlate}` : ""

    const matchesSearch =
      repair.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || repair.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddRepair = () => {
    try {
      const newRepair: RepairService = {
        id: `repair-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedRepairs = [...repairs, newRepair]
      onRepairsChange(updatedRepairs)
      localStorage.setItem("repairs", JSON.stringify(updatedRepairs))

      setShowAddDialog(false)
      resetForm()
      console.log("Repair added successfully:", newRepair.id)
    } catch (error) {
      console.error("Error adding repair:", error)
    }
  }

  const handleEditRepair = () => {
    if (!selectedRepair) return

    try {
      const updatedRepair: RepairService = {
        ...selectedRepair,
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      const updatedRepairs = repairs.map((r) => (r.id === selectedRepair.id ? updatedRepair : r))
      onRepairsChange(updatedRepairs)
      localStorage.setItem("repairs", JSON.stringify(updatedRepairs))

      setShowEditDialog(false)
      setSelectedRepair(null)
      resetForm()
      console.log("Repair updated successfully:", updatedRepair.id)
    } catch (error) {
      console.error("Error updating repair:", error)
    }
  }

  const handleDeleteRepair = (repairId: string) => {
    if (confirm("Are you sure you want to delete this repair?")) {
      try {
        const updatedRepairs = repairs.filter((r) => r.id !== repairId)
        onRepairsChange(updatedRepairs)
        localStorage.setItem("repairs", JSON.stringify(updatedRepairs))
        console.log("Repair deleted successfully:", repairId)
      } catch (error) {
        console.error("Error deleting repair:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      vehicleId: "",
      description: "",
      serviceDate: new Date().toISOString().split("T")[0],
      technician: "",
      laborHours: 0,
      cost: 0,
      status: "pending",
      parts: [],
      notes: "",
    })
  }

  const openEditDialog = (repair: RepairService) => {
    setSelectedRepair(repair)
    setFormData({
      vehicleId: repair.vehicleId,
      description: repair.description,
      serviceDate: repair.serviceDate.split("T")[0],
      technician: repair.technician,
      laborHours: repair.laborHours,
      cost: repair.cost,
      status: repair.status,
      parts: repair.parts || [],
      notes: repair.notes || "",
    })
    setShowEditDialog(true)
  }

  const getStatusColor = (status: RepairService["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading repairs...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Repair Management</h2>
          <p className="text-gray-600">Manage all repair services</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Repair
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Repair</DialogTitle>
              <DialogDescription>Enter the repair details below</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="vehicleId">Vehicle</Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                >
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
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the repair work needed"
                />
              </div>
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
                <Label htmlFor="technician">Technician</Label>
                <Input
                  id="technician"
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  placeholder="Assigned technician"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborHours">Labor Hours</Label>
                <Input
                  id="laborHours"
                  type="number"
                  step="0.5"
                  value={formData.laborHours}
                  onChange={(e) => setFormData({ ...formData, laborHours: Number.parseFloat(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number.parseFloat(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as RepairService["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or comments"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRepair}>Add Repair</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search repairs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Repairs List */}
      <div className="grid gap-4">
        {filteredRepairs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No repairs found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first repair to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRepairs.map((repair) => {
            const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
            return (
              <Card key={repair.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}
                        </h3>
                        <Badge className={getStatusColor(repair.status)}>{repair.status.replace("-", " ")}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{repair.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Service Date:</span>{" "}
                          {new Date(repair.serviceDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Technician:</span> {repair.technician}
                        </div>
                        <div>
                          <span className="font-medium">Labor Hours:</span> {repair.laborHours}h
                        </div>
                        <div>
                          <span className="font-medium">Cost:</span> ${repair.cost.toFixed(2)}
                        </div>
                        {vehicle && (
                          <div className="col-span-2">
                            <span className="font-medium">License Plate:</span> {vehicle.licensePlate}
                          </div>
                        )}
                        {repair.notes && (
                          <div className="col-span-2">
                            <span className="font-medium">Notes:</span> {repair.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(repair)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteRepair(repair.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Repair</DialogTitle>
            <DialogDescription>Update the repair details below</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-vehicleId">Vehicle</Label>
              <Select
                value={formData.vehicleId}
                onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
              >
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
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the repair work needed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-serviceDate">Service Date</Label>
              <Input
                id="edit-serviceDate"
                type="date"
                value={formData.serviceDate}
                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-technician">Technician</Label>
              <Input
                id="edit-technician"
                value={formData.technician}
                onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                placeholder="Assigned technician"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-laborHours">Labor Hours</Label>
              <Input
                id="edit-laborHours"
                type="number"
                step="0.5"
                value={formData.laborHours}
                onChange={(e) => setFormData({ ...formData, laborHours: Number.parseFloat(e.target.value) })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cost">Cost ($)</Label>
              <Input
                id="edit-cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number.parseFloat(e.target.value) })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as RepairService["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or comments"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRepair}>Update Repair</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
