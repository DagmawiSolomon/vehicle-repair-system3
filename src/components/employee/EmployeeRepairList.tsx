"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Edit, Clock, DollarSign, Car, Calendar } from "lucide-react"
import RepairDetails from "../RepairDetails"
import StatusUpdateForm from "../StatusUpdateForm"
import type { Vehicle, RepairService } from "@/src/types"

interface EmployeeRepairListProps {
  repairs: RepairService[]
  vehicles: Vehicle[]
  onRepairUpdate: (repair: RepairService) => void
  isLoading: boolean
}

export default function EmployeeRepairList({ repairs, vehicles, onRepairUpdate, isLoading }: EmployeeRepairListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedRepair, setSelectedRepair] = useState<RepairService | null>(null)
  const [editingRepair, setEditingRepair] = useState<RepairService | null>(null)

  const filteredRepairs = repairs.filter((repair) => {
    const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
    const vehicleInfo = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.licensePlate}` : ""

    const matchesSearch =
      repair.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || repair.status === statusFilter
    const matchesPriority = priorityFilter === "all" || repair.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading repairs...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Repairs</CardTitle>
          <CardDescription>Manage and track your assigned repair work</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search repairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Repairs List */}
          {filteredRepairs.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No repairs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRepairs.map((repair) => {
                const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
                return (
                  <Card key={repair.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}
                            </h3>
                            <Badge className={getStatusColor(repair.status)}>{repair.status}</Badge>
                            <Badge className={getPriorityColor(repair.priority)}>{repair.priority} priority</Badge>
                          </div>

                          <p className="text-gray-600 mb-3">{repair.description}</p>

                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${repair.cost.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(repair.createdAt).toLocaleDateString()}</span>
                            </div>
                            {repair.estimatedHours && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{repair.estimatedHours}h estimated</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedRepair(repair)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingRepair(repair)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Update
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repair Details Modal */}
      {selectedRepair && (
        <RepairDetails
          repair={selectedRepair}
          vehicle={vehicles.find((v) => v.id === selectedRepair.vehicleId)}
          onClose={() => setSelectedRepair(null)}
        />
      )}

      {/* Status Update Modal */}
      {editingRepair && (
        <StatusUpdateForm
          repair={editingRepair}
          onUpdate={(updatedRepair) => {
            onRepairUpdate(updatedRepair)
            setEditingRepair(null)
          }}
          onClose={() => setEditingRepair(null)}
        />
      )}
    </div>
  )
}
