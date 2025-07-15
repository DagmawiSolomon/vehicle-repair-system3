"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wrench,
  Car,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  LogOut,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react"
import { getCurrentUser, logout, hasPermission } from "@/src/utils/auth-utils"
import EmployeeRepairForm from "./EmployeeRepairForm"
import EmployeeRepairList from "./EmployeeRepairList"
import EmployeeWorkOrders from "./EmployeeWorkOrders"
import EmployeeTimeTracking from "./EmployeeTimeTracking"
import ClockInOutButton from "../technician/ClockInOutButton"
import type { Vehicle, RepairService, User, WorkOrder } from "@/src/types"

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [repairs, setRepairs] = useState<RepairService[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showRepairForm, setShowRepairForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "employee") {
      router.push("/")
      return
    }
    setCurrentUser(user)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load vehicles (read-only for employees)
      const vehiclesData = localStorage.getItem("vehicles")
      if (vehiclesData) {
        setVehicles(JSON.parse(vehiclesData))
      }

      // Load repairs
      const repairsData = localStorage.getItem("repairs")
      if (repairsData) {
        setRepairs(JSON.parse(repairsData))
      }

      // Load work orders
      const workOrdersData = localStorage.getItem("workOrders")
      if (workOrdersData) {
        setWorkOrders(JSON.parse(workOrdersData))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleRepairAdded = (newRepair: RepairService) => {
    const updatedRepairs = [...repairs, newRepair]
    setRepairs(updatedRepairs)
    localStorage.setItem("repairs", JSON.stringify(updatedRepairs))
    setShowRepairForm(false)
  }

  const handleRepairUpdated = (updatedRepair: RepairService) => {
    const updatedRepairs = repairs.map((repair) => (repair.id === updatedRepair.id ? updatedRepair : repair))
    setRepairs(updatedRepairs)
    localStorage.setItem("repairs", JSON.stringify(updatedRepairs))
  }

  // Filter repairs assigned to current employee
  const employeeRepairs = repairs.filter((repair) => repair.assignedTo === currentUser?.id || !repair.assignedTo)

  const stats = {
    assignedRepairs: employeeRepairs.filter((r) => r.status === "in-progress").length,
    completedToday: employeeRepairs.filter(
      (r) =>
        r.status === "completed" && new Date(r.updatedAt || r.createdAt).toDateString() === new Date().toDateString(),
    ).length,
    pendingRepairs: employeeRepairs.filter((r) => r.status === "pending").length,
    totalVehicles: vehicles.length,
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg mr-3">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {currentUser.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Clock In/Out Button */}
              <ClockInOutButton user={currentUser} compact={true} />

              {hasPermission("repairs.create") && (
                <Button onClick={() => setShowRepairForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Repair
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Repairs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.assignedRepairs}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRepairs}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
                  <p className="text-xs text-gray-500 mt-1">View only</p>
                </div>
                <Car className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="workorders" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Work Orders
            </TabsTrigger>
            <TabsTrigger value="repairs" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              My Repairs
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Time Tracking Widget */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClockInOutButton user={currentUser} />
                </CardContent>
              </Card>

              {/* Recent Work Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Recent Work Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {workOrders.length > 0 ? (
                    <div className="space-y-4">
                      {workOrders.slice(0, 3).map((workOrder) => {
                        const vehicle = vehicles.find((v) => v.id === workOrder.vehicleId)
                        return (
                          <div
                            key={workOrder.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">{workOrder.workOrderNumber}</h4>
                              <p className="text-sm text-gray-600">
                                {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}
                              </p>
                            </div>
                            <Badge variant={workOrder.status === "completed" ? "default" : "secondary"}>
                              {workOrder.status}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No work orders found</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Repairs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    My Recent Repairs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employeeRepairs.length > 0 ? (
                    <div className="space-y-4">
                      {employeeRepairs.slice(0, 3).map((repair) => {
                        const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
                        return (
                          <div key={repair.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium">{repair.description}</h4>
                              <p className="text-sm text-gray-600">
                                {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}
                              </p>
                            </div>
                            <Badge variant={repair.status === "completed" ? "default" : "secondary"}>
                              {repair.status}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No repairs assigned</p>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {vehicles.filter((v) => v.status === "active").length}
                      </p>
                      <p className="text-sm text-gray-600">Active</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {vehicles.filter((v) => v.status === "in_repair").length}
                      </p>
                      <p className="text-sm text-gray-600">In Repair</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {vehicles.filter((v) => v.status === "maintenance").length}
                      </p>
                      <p className="text-sm text-gray-600">Maintenance</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {vehicles.filter((v) => v.status === "ready_for_pickup").length}
                      </p>
                      <p className="text-sm text-gray-600">Ready</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workorders">
            <EmployeeWorkOrders
              workOrders={workOrders}
              vehicles={vehicles}
              parts={[]}
              user={currentUser}
              onUpdate={(updatedWorkOrders) => {
                setWorkOrders(updatedWorkOrders)
                localStorage.setItem("workOrders", JSON.stringify(updatedWorkOrders))
              }}
            />
          </TabsContent>

          <TabsContent value="repairs">
            <EmployeeRepairList
              repairs={employeeRepairs}
              vehicles={vehicles}
              onRepairUpdate={handleRepairUpdated}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="time">
            <EmployeeTimeTracking />
          </TabsContent>
        </Tabs>

        {/* Repair Form Modal */}
        {showRepairForm && (
          <EmployeeRepairForm
            vehicles={vehicles}
            onRepairAdded={handleRepairAdded}
            onClose={() => setShowRepairForm(false)}
          />
        )}
      </main>
    </div>
  )
}
