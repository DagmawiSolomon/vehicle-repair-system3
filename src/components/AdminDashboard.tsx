"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Vehicle, RepairService, User } from "@/types"
import AdminLogin from "@/components/AdminLogin"
import AdminHeader from "@/components/AdminHeader"
import AdminStats from "@/components/AdminStats"
import AdminVehicleList from "@/components/AdminVehicleList"
import AdminRepairList from "@/components/AdminRepairList"
import AdminUserManagement from "@/components/AdminUserManagement"
import AdminSettings from "@/components/AdminSettings"
import AdminActivityLog from "@/components/AdminActivityLog"
import { isServiceDue } from "@/utils/vehicle-utils"
import { BarChart3, Car, Settings, Users, ClipboardList, Activity } from "lucide-react"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [repairs, setRepairs] = useState<RepairService[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    vehiclesInRepair: 0,
    vehiclesNeedingService: 0,
    totalRepairs: 0,
    completedRepairs: 0,
    pendingRepairs: 0,
    totalRevenue: 0,
    averageRepairCost: 0,
  })
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = () => {
    // Load vehicles
    const storedVehicles = localStorage.getItem("vehicles")
    if (storedVehicles) {
      try {
        const parsedVehicles = JSON.parse(storedVehicles)
        setVehicles(parsedVehicles)
      } catch (error) {
        console.error("Error parsing vehicles:", error)
      }
    }

    // Load repairs
    const storedRepairs = localStorage.getItem("vehicleRepairs")
    if (storedRepairs) {
      try {
        const parsedRepairs = JSON.parse(storedRepairs)
        setRepairs(parsedRepairs)
      } catch (error) {
        console.error("Error parsing repairs:", error)
      }
    }

    // Load users (in a real app, this would come from a database)
    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers)
        setUsers(parsedUsers)
      } catch (error) {
        console.error("Error parsing users:", error)
        // Initialize with default admin user if none exists
        const defaultAdmin = {
          id: "admin-1",
          name: "System Administrator",
          email: "admin@example.com",
          role: "admin",
        }
        setUsers([defaultAdmin])
        localStorage.setItem("users", JSON.stringify([defaultAdmin]))
      }
    } else {
      // Initialize with default admin user if none exists
      const defaultAdmin = {
        id: "admin-1",
        name: "System Administrator",
        email: "admin@example.com",
        role: "admin",
      }
      setUsers([defaultAdmin])
      localStorage.setItem("users", JSON.stringify([defaultAdmin]))
    }

    // Load activity logs (in a real app, this would come from a database)
    const storedLogs = localStorage.getItem("activityLogs")
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs)
        setActivityLogs(parsedLogs)
      } catch (error) {
        console.error("Error parsing activity logs:", error)
        setActivityLogs([])
      }
    } else {
      setActivityLogs([])
    }
  }

  useEffect(() => {
    if (vehicles.length > 0 && repairs.length > 0) {
      calculateStats()
    }
  }, [vehicles, repairs])

  const calculateStats = () => {
    const activeVehicles = vehicles.filter((v) => v.status === "active").length
    const vehiclesInRepair = vehicles.filter((v) => v.status === "in_repair").length
    const vehiclesNeedingService = vehicles.filter((v) => isServiceDue(v)).length
    const completedRepairs = repairs.filter((r) => r.status === "completed").length
    const pendingRepairs = repairs.filter((r) => r.status === "pending" || r.status === "in-progress").length
    const totalRevenue = repairs.reduce((sum, repair) => sum + repair.cost, 0)
    const averageRepairCost = repairs.length > 0 ? totalRevenue / repairs.length : 0

    setStats({
      totalVehicles: vehicles.length,
      activeVehicles,
      vehiclesInRepair,
      vehiclesNeedingService,
      totalRepairs: repairs.length,
      completedRepairs,
      pendingRepairs,
      totalRevenue,
      averageRepairCost,
    })
  }

  const handleLogin = (password: string) => {
    // In a real application, you would validate against a secure backend
    // For demo purposes, we're using a simple check
    if (password === "admin123") {
      setIsAuthenticated(true)
      // Log activity
      logActivity("Admin login", "Authentication", "Admin user logged in")
    } else {
      alert("Invalid password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    // Log activity
    logActivity("Admin logout", "Authentication", "Admin user logged out")
  }

  const logActivity = (action: string, category: string, description: string) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      description,
      user: "Administrator", // In a real app, this would be the actual user
    }

    const updatedLogs = [newLog, ...activityLogs]
    setActivityLogs(updatedLogs)
    localStorage.setItem("activityLogs", JSON.stringify(updatedLogs))
  }

  const handleUserUpdate = (updatedUsers: User[]) => {
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    logActivity("User management", "Users", "Updated user list")
  }

  const handleExitAdmin = () => {
    router.push("/")
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader onLogout={handleLogout} onExit={handleExitAdmin} />

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-white shadow-md md:min-h-[calc(100vh-64px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === "dashboard" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("vehicles")}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === "vehicles" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Car className="h-5 w-5 mr-3" />
                  <span>Vehicles</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("repairs")}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === "repairs" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ClipboardList className="h-5 w-5 mr-3" />
                  <span>Repairs</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === "users" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <span>Users</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === "activity" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Activity className="h-5 w-5 mr-3" />
                  <span>Activity Log</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === "settings" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === "dashboard" && <AdminStats stats={stats} vehicles={vehicles} repairs={repairs} />}

          {activeTab === "vehicles" && (
            <AdminVehicleList
              vehicles={vehicles}
              onUpdate={(updatedVehicles) => {
                setVehicles(updatedVehicles)
                localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))
                logActivity("Vehicle management", "Vehicles", "Updated vehicle list")
              }}
              logActivity={logActivity}
            />
          )}

          {activeTab === "repairs" && (
            <AdminRepairList
              repairs={repairs}
              vehicles={vehicles}
              onUpdate={(updatedRepairs) => {
                setRepairs(updatedRepairs)
                localStorage.setItem("vehicleRepairs", JSON.stringify(updatedRepairs))
                logActivity("Repair management", "Repairs", "Updated repair list")
              }}
              logActivity={logActivity}
            />
          )}

          {activeTab === "users" && (
            <AdminUserManagement users={users} onUpdate={handleUserUpdate} logActivity={logActivity} />
          )}

          {activeTab === "activity" && <AdminActivityLog logs={activityLogs} />}

          {activeTab === "settings" && <AdminSettings logActivity={logActivity} />}
        </div>
      </div>
    </div>
  )
}
