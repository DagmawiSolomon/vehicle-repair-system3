"use client"

import { useState } from "react"
import type { WorkOrder, Vehicle, Part, User } from "../../types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Calendar,
  Car,
  Wrench,
  Package,
} from "lucide-react"

interface EmployeeWorkOrdersProps {
  workOrders: WorkOrder[]
  vehicles: Vehicle[]
  parts: Part[]
  user: User
  onUpdate: (workOrders: WorkOrder[]) => void
}

export default function EmployeeWorkOrders({
  workOrders = [],
  vehicles = [],
  parts = [],
  user,
  onUpdate,
}: EmployeeWorkOrdersProps) {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    status: "",
    diagnosis: "",
    workPerformed: "",
    actualHours: "",
    actualCost: "",
    notes: "",
  })
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder)
    setEditForm({
      status: workOrder.status,
      diagnosis: workOrder.diagnosis || "",
      workPerformed: workOrder.workPerformed || "",
      actualHours: workOrder.actualHours?.toString() || "",
      actualCost: workOrder.actualCost?.toString() || "",
      notes: workOrder.description,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveWorkOrder = () => {
    if (!selectedWorkOrder) return

    const updatedWorkOrder = {
      ...selectedWorkOrder,
      status: editForm.status as WorkOrder["status"],
      diagnosis: editForm.diagnosis,
      workPerformed: editForm.workPerformed,
      actualHours: editForm.actualHours ? Number.parseFloat(editForm.actualHours) : undefined,
      actualCost: editForm.actualCost ? Number.parseFloat(editForm.actualCost) : undefined,
      description: editForm.notes,
      updatedAt: new Date().toISOString(),
      completedDate: editForm.status === "completed" ? new Date().toISOString() : undefined,
    }

    const updatedWorkOrders = workOrders.map((wo) => (wo.id === selectedWorkOrder.id ? updatedWorkOrder : wo))
    onUpdate(updatedWorkOrders)
    setIsEditDialogOpen(false)
    setSelectedWorkOrder(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "waiting_parts":
        return "bg-yellow-100 text-yellow-800"
      case "waiting_approval":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredWorkOrders = workOrders.filter((wo) => {
    const statusMatch = filterStatus === "all" || wo.status === filterStatus
    const priorityMatch = filterPriority === "all" || wo.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const getWorkOrderStats = () => {
    const total = workOrders.length
    const completed = workOrders.filter((wo) => wo.status === "completed").length
    const inProgress = workOrders.filter((wo) => wo.status === "in_progress").length
    const pending = workOrders.filter((wo) => wo.status === "pending").length
    const overdue = workOrders.filter((wo) => {
      if (wo.scheduledDate && wo.status !== "completed") {
        return new Date(wo.scheduledDate) < new Date()
      }
      return false
    }).length

    return { total, completed, inProgress, pending, overdue }
  }

  const stats = getWorkOrderStats()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
          <CardDescription>Manage your assigned work orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Orders List */}
          <div className="space-y-4">
            {filteredWorkOrders.length > 0 ? (
              filteredWorkOrders.map((workOrder) => {
                const vehicle = vehicles.find((v) => v.id === workOrder.vehicleId)
                return (
                  <Card key={workOrder.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{workOrder.workOrderNumber}</h3>
                            <Badge className={getStatusColor(workOrder.status)}>
                              {workOrder.status.replace("_", " ")}
                            </Badge>
                            <Badge className={getPriorityColor(workOrder.priority)}>{workOrder.priority}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-gray-500" />
                              <span>
                                {vehicle?.year} {vehicle?.make} {vehicle?.model}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>
                                {workOrder.scheduledDate
                                  ? new Date(workOrder.scheduledDate).toLocaleDateString()
                                  : "Not scheduled"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>Est: {workOrder.estimatedHours}h</span>
                              {workOrder.actualHours && <span>| Actual: {workOrder.actualHours}h</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span>${workOrder.estimatedCost.toFixed(2)}</span>
                              {workOrder.actualCost && <span>| Actual: ${workOrder.actualCost.toFixed(2)}</span>}
                            </div>
                          </div>

                          <p className="text-gray-600 mt-2">{workOrder.description}</p>

                          {workOrder.diagnosis && (
                            <div className="mt-2">
                              <span className="font-medium text-sm">Diagnosis: </span>
                              <span className="text-sm text-gray-600">{workOrder.diagnosis}</span>
                            </div>
                          )}

                          {workOrder.workPerformed && (
                            <div className="mt-2">
                              <span className="font-medium text-sm">Work Performed: </span>
                              <span className="text-sm text-gray-600">{workOrder.workPerformed}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Work Order Details - {workOrder.workOrderNumber}</DialogTitle>
                                <DialogDescription>Complete information for this work order</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Vehicle</label>
                                    <p className="text-sm text-gray-600">
                                      {vehicle?.year} {vehicle?.make} {vehicle?.model}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">VIN</label>
                                    <p className="text-sm text-gray-600">{vehicle?.vin}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Badge className={getStatusColor(workOrder.status)}>
                                      {workOrder.status.replace("_", " ")}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Priority</label>
                                    <Badge className={getPriorityColor(workOrder.priority)}>{workOrder.priority}</Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Description</label>
                                  <p className="text-sm text-gray-600">{workOrder.description}</p>
                                </div>
                                {workOrder.diagnosis && (
                                  <div>
                                    <label className="text-sm font-medium">Diagnosis</label>
                                    <p className="text-sm text-gray-600">{workOrder.diagnosis}</p>
                                  </div>
                                )}
                                {workOrder.workPerformed && (
                                  <div>
                                    <label className="text-sm font-medium">Work Performed</label>
                                    <p className="text-sm text-gray-600">{workOrder.workPerformed}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Estimated Hours</label>
                                    <p className="text-sm text-gray-600">{workOrder.estimatedHours}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Actual Hours</label>
                                    <p className="text-sm text-gray-600">{workOrder.actualHours || "Not set"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Estimated Cost</label>
                                    <p className="text-sm text-gray-600">${workOrder.estimatedCost.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Actual Cost</label>
                                    <p className="text-sm text-gray-600">
                                      {workOrder.actualCost ? `$${workOrder.actualCost.toFixed(2)}` : "Not set"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleEditWorkOrder(workOrder)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Update
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No work orders found matching your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Work Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Work Order</DialogTitle>
            <DialogDescription>Update the status and details of this work order</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                    <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Actual Hours</label>
                <Input
                  type="number"
                  step="0.1"
                  value={editForm.actualHours}
                  onChange={(e) => setEditForm({ ...editForm, actualHours: e.target.value })}
                  placeholder="Enter actual hours"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Actual Cost</label>
              <Input
                type="number"
                step="0.01"
                value={editForm.actualCost}
                onChange={(e) => setEditForm({ ...editForm, actualCost: e.target.value })}
                placeholder="Enter actual cost"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Diagnosis</label>
              <Textarea
                value={editForm.diagnosis}
                onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                placeholder="Enter diagnosis details"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Work Performed</label>
              <Textarea
                value={editForm.workPerformed}
                onChange={(e) => setEditForm({ ...editForm, workPerformed: e.target.value })}
                placeholder="Describe the work performed"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveWorkOrder} className="bg-orange-600 hover:bg-orange-700">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
