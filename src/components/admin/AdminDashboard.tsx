"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Car,
  Wrench,
  Users,
  Settings,
  Package,
  BarChart3,
  DollarSign,
  AlertTriangle,
  LogOut,
  Plus,
  Camera,
  UserCheck,
} from "lucide-react"
import { getCurrentUser, logout } from "@/src/utils/auth-utils"
import AdminVehicleManagement from "./AdminVehicleManagement"
import AdminRepairManagement from "./AdminRepairManagement"
import AdminUserManagement from "./AdminUserManagement"
import AdminInventoryManagement from "./AdminInventoryManagement"
import AdminReports from "./AdminReports"
import AdminSettings from "./AdminSettings"
import AdminEmployeePhotoManager from "./AdminEmployeePhotoManager"
import AdminEmployeeDirectory from "./AdminEmployeeDirectory"
import type { Vehicle, RepairService, User, Part } from "@/src/types"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [repairs, setRepairs] = useState<RepairService[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "admin") {
      router.push("/")
      return
    }
    setCurrentUser(user)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load vehicles
      const vehiclesData = localStorage.getItem("vehicles")
      if (vehiclesData) {
        setVehicles(JSON.parse(vehiclesData))
      } else {
        // Initialize with sample data
        const sampleVehicles: Vehicle[] = [
          {
            id: "vehicle-1",
            make: "Toyota",
            model: "Camry",
            year: 2020,
            vin: "1HGBH41JXMN109186",
            licensePlate: "ABC123",
            color: "Silver",
            mileage: 45000,
            status: "active",
            owner: "John Doe",
            ownerContact: "555-0123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        setVehicles(sampleVehicles)
        localStorage.setItem("vehicles", JSON.stringify(sampleVehicles))
      }

      // Load repairs
      const repairsData = localStorage.getItem("repairs")
      if (repairsData) {
        setRepairs(JSON.parse(repairsData))
      } else {
        setRepairs([])
      }

      // Load users
      const usersData = localStorage.getItem("users")
      if (usersData) {
        setUsers(JSON.parse(usersData))
      }

      // Load parts
      const partsData = localStorage.getItem("parts")
      if (partsData) {
        setParts(JSON.parse(partsData))
      } else {
        // Initialize with sample parts
        const sampleParts: Part[] = [
          {
            id: "part-1",
            name: "Oil Filter",
            category: "Filters",
            sku: "OF-001",
            price: 15.99,
            stockQuantity: 50,
            reorderLevel: 10,
            location: "A1-B2",
            description: "Standard oil filter for most vehicles",
            manufacturer: "FilterPro",
            lastRestocked: new Date().toISOString(),
            usageCount: 0,
          },
        ]
        setParts(sampleParts)
        localStorage.setItem("parts", JSON.stringify(sampleParts))
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

  const stats = {
    totalVehicles: vehicles.length,
    activeRepairs: repairs.filter((r) => r.status === "in-progress").length,
    completedRepairs: repairs.filter((r) => r.status === "completed").length,
    totalRevenue: repairs.filter((r) => r.status === "completed").reduce((sum, r) => sum + (r.cost || 0), 0),
    pendingRepairs: repairs.filter((r) => r.status === "pending").length,
    totalUsers: users.length,
    lowStockParts: parts.filter((p) => p.stockQuantity <= p.reorderLevel).length,
    totalParts: parts.length,
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
              <div className="p-2 bg-slate-800 rounded-lg mr-3">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {currentUser.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
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
                  <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Repairs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeRepairs}</p>
                </div>
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockParts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="repairs" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Repairs
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Directory
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminReports stats={stats} vehicles={vehicles} repairs={repairs} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="vehicles">
            <AdminVehicleManagement vehicles={vehicles} onVehiclesChange={setVehicles} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="repairs">
            <AdminRepairManagement
              repairs={repairs}
              vehicles={vehicles}
              onRepairsChange={setRepairs}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="inventory">
            <AdminInventoryManagement parts={parts} onPartsChange={setParts} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement
              users={users}
              onUsersChange={setUsers}
              currentUser={currentUser}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="directory">
            <AdminEmployeeDirectory
              users={users}
              onUsersChange={setUsers}
              currentUser={currentUser}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="photos">
            <AdminEmployeePhotoManager
              users={users}
              onUsersChange={setUsers}
              currentUser={currentUser}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
