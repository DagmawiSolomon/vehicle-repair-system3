"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Vehicle, RepairService, User, Part, ActivityLog } from "@/types"
import AdminLogin from "@/components/admin/AdminLogin"
import AdminHeader from "@/components/admin/AdminHeader"
import AdminOverview from "@/components/admin/AdminOverview"
import AdminVehicleList from "@/components/admin/AdminVehicleList"
import AdminRepairList from "@/components/admin/AdminRepairList"
import AdminPartsInventory from "@/components/admin/AdminPartsInventory"
import AdminUserManagement from "@/components/admin/AdminUserManagement"
import AdminSettings from "@/components/admin/AdminSettings"
import AdminActivityLog from "@/components/admin/AdminActivityLog"
import { isServiceDue } from "@/utils/vehicle-utils"
import {
  LayoutDashboard,
  Car,
  Settings,
  Users,
  ClipboardList,
  Activity,
  Package,
  LogOut,
  ChevronDown,
} from "lucide-react"
import TimeManagement from "@/components/admin/TimeManagement"

type AdminDashboardProps = {}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [repairs, setRepairs] = useState<RepairService[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    lowStockParts: 0,
    totalParts: 0,
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

    // Load parts (initialize with sample data if not exists)
    const storedParts = localStorage.getItem("parts")
    if (storedParts) {
      try {
        const parsedParts = JSON.parse(storedParts)
        setParts(parsedParts)
      } catch (error) {
        console.error("Error parsing parts:", error)
        initializeSampleParts()
      }
    } else {
      initializeSampleParts()
    }

    // Load users
    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers)
        setUsers(parsedUsers)
      } catch (error) {
        console.error("Error parsing users:", error)
        initializeDefaultUsers()
      }
    } else {
      initializeDefaultUsers()
    }

    // Load activity logs
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

  const initializeSampleParts = () => {
    const sampleParts: Part[] = [
      {
        id: "part-1",
        name: "Oil Filter",
        category: "Filters",
        sku: "FLT-001",
        price: 15.99,
        stockQuantity: 45,
        reorderLevel: 10,
        location: "Shelf A1",
        description: "Standard oil filter for most vehicle models",
        manufacturer: "FilterPro",
        lastRestocked: new Date().toISOString(),
        usageCount: 23,
      },
      {
        id: "part-2",
        name: "Brake Pads (Front)",
        category: "Brakes",
        sku: "BRK-101",
        price: 49.99,
        stockQuantity: 12,
        reorderLevel: 8,
        location: "Shelf B3",
        description: "High-performance ceramic brake pads for front wheels",
        manufacturer: "BrakeMaster",
        lastRestocked: new Date().toISOString(),
        usageCount: 15,
      },
      {
        id: "part-3",
        name: "Air Filter",
        category: "Filters",
        sku: "FLT-002",
        price: 12.99,
        stockQuantity: 32,
        reorderLevel: 10,
        location: "Shelf A2",
        description: "Engine air filter for improved air flow",
        manufacturer: "FilterPro",
        lastRestocked: new Date().toISOString(),
        usageCount: 18,
      },
      {
        id: "part-4",
        name: "Spark Plugs",
        category: "Ignition",
        sku: "IGN-201",
        price: 8.99,
        stockQuantity: 60,
        reorderLevel: 20,
        location: "Shelf C1",
        description: "Standard spark plugs for gasoline engines",
        manufacturer: "SparkTech",
        lastRestocked: new Date().toISOString(),
        usageCount: 42,
      },
      {
        id: "part-5",
        name: "Wiper Blades",
        category: "Exterior",
        sku: "EXT-301",
        price: 24.99,
        stockQuantity: 25,
        reorderLevel: 10,
        location: "Shelf D2",
        description: "All-weather wiper blades for clear visibility",
        manufacturer: "ClearView",
        lastRestocked: new Date().toISOString(),
        usageCount: 30,
      },
      {
        id: "part-6",
        name: "Transmission Fluid",
        category: "Fluids",
        sku: "FLD-101",
        price: 18.99,
        stockQuantity: 38,
        reorderLevel: 15,
        location: "Shelf E1",
        description: "Automatic transmission fluid for smooth gear shifts",
        manufacturer: "LubeTech",
        lastRestocked: new Date().toISOString(),
        usageCount: 27,
      },
      {
        id: "part-7",
        name: "Brake Rotors",
        category: "Brakes",
        sku: "BRK-102",
        price: 79.99,
        stockQuantity: 8,
        reorderLevel: 5,
        location: "Shelf B4",
        description: "Ventilated brake rotors for improved stopping power",
        manufacturer: "BrakeMaster",
        lastRestocked: new Date().toISOString(),
        usageCount: 12,
      },
      {
        id: "part-8",
        name: "Battery",
        category: "Electrical",
        sku: "ELC-201",
        price: 129.99,
        stockQuantity: 6,
        reorderLevel: 3,
        location: "Shelf F1",
        description: "12V automotive battery with 3-year warranty",
        manufacturer: "PowerCell",
        lastRestocked: new Date().toISOString(),
        usageCount: 9,
      },
    ]

    setParts(sampleParts)
    localStorage.setItem("parts", JSON.stringify(sampleParts))
  }

  const initializeDefaultUsers = () => {
    const defaultUsers: User[] = [
      {
        id: "admin-1",
        name: "System Administrator",
        email: "admin@example.com",
        username: "admin",
        password: "admin123", // In a real app, this would be hashed
        role: "admin",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: "tech-1",
        name: "John Technician",
        email: "john@example.com",
        username: "johnt",
        password: "tech123", // In a real app, this would be hashed
        role: "technician",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ]

    setUsers(defaultUsers)
    localStorage.setItem("users", JSON.stringify(defaultUsers))
  }

  useEffect(() => {
    if (vehicles.length > 0 && repairs.length > 0 && parts.length > 0) {
      calculateStats()
    }
  }, [vehicles, repairs, parts])

  const calculateStats = () => {
    const activeVehicles = vehicles.filter((v) => v.status === "active").length
    const vehiclesInRepair = vehicles.filter((v) => v.status === "in_repair").length
    const vehiclesNeedingService = vehicles.filter((v) => isServiceDue(v)).length
    const completedRepairs = repairs.filter((r) => r.status === "completed").length
    const pendingRepairs = repairs.filter((r) => r.status === "pending" || r.status === "in-progress").length
    const totalRevenue = repairs.reduce((sum, repair) => sum + repair.cost, 0)
    const averageRepairCost = repairs.length > 0 ? totalRevenue / repairs.length : 0
    const lowStockParts = parts.filter((p) => p.stockQuantity <= p.reorderLevel).length

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
      lowStockParts: lowStockParts,
      totalParts: parts.length,
    })
  }

  const handleLogin = (username: string, password: string) => {
    // In a real application, you would validate against a secure backend
    const user = users.find((u) => u.username === username && u.password === password)

    if (user) {
      setIsAuthenticated(true)
      setCurrentUser({
        username: user.username,
        role: user.role,
      })

      // Update last login time
      const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u))
      setUsers(updatedUsers)
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      // Log activity
      logActivity("User login", "Authentication", `User ${username} logged in`)
    } else {
      return false
    }

    return true
  }

  const handleLogout = () => {
    if (currentUser) {
      logActivity("User logout", "Authentication", `User ${currentUser.username} logged out`)
    }

    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  const logActivity = (action: string, category: string, description: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      description,
      user: currentUser?.username || "System",
      ipAddress: "127.0.0.1", // In a real app, this would be the actual IP
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

  const handlePartsUpdate = (updatedParts: Part[]) => {
    setParts(updatedParts)
    localStorage.setItem("parts", JSON.stringify(updatedParts))
    logActivity("Parts inventory", "Inventory", "Updated parts inventory")
  }

  const handleExitAdmin = () => {
    router.push("/")
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader
        onLogout={handleLogout}
        onExit={handleExitAdmin}
        currentUser={currentUser}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div
          className={`${isSidebarCollapsed ? "md:w-20" : "md:w-64"} ${isMobileMenuOpen ? "block" : "hidden md:block"} bg-white shadow-md transition-all duration-300 ease-in-out z-20 fixed md:relative inset-0 md:inset-auto md:h-[calc(100vh-64px)] overflow-y-auto`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className={`font-bold text-gray-800 ${isSidebarCollapsed ? "hidden" : "block"}`}>Admin Panel</h2>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-gray-500 hover:text-gray-700 hidden md:block"
              >
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform ${isSidebarCollapsed ? "rotate-90" : "rotate-270"}`}
                />
              </button>
            </div>

            <nav>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("overview")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeTab === "overview" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className={isSidebarCollapsed ? "hidden" : "block"}>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("vehicles")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeTab === "vehicles" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Car className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className={isSidebarCollapsed ? "hidden" : "block"}>Vehicles</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("repairs")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeTab === "repairs" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ClipboardList className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className={isSidebarCollapsed ? "hidden" : "block"}>Repairs</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("parts")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeTab === "parts" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Package className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className={isSidebarCollapsed ? "hidden" : "block"}>Parts Inventory</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("users")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeTab === "users" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Users className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className={isSidebarCollapsed ? "hidden" : "block"}>Users</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("timeManagement")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeTab === "timeManagement" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Activity className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className={isSidebarCollapsed ? "hidden" : "block"}>Time Management</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("activity")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeTab === "activity" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Activity className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className={isSidebarCollapsed ? "hidden" : "block"}>Activity Log</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("settings")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeTab === "settings" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className={isSidebarCollapsed ? "hidden" : "block"}>Settings</span>
                  </button>
                </li>
                <li className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className={isSidebarCollapsed ? "hidden" : "block"}>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 p-4 md:p-6 ${isMobileMenuOpen ? "hidden" : "block"} md:ml-${isSidebarCollapsed ? "20" : "64"} transition-all duration-300`}
        >
          {activeTab === "overview" && (
            <AdminOverview
              stats={stats}
              vehicles={vehicles}
              repairs={repairs}
              parts={parts}
              activityLogs={activityLogs.slice(0, 5)}
            />
          )}

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
              parts={parts}
              onUpdate={(updatedRepairs) => {
                setRepairs(updatedRepairs)
                localStorage.setItem("vehicleRepairs", JSON.stringify(updatedRepairs))
                logActivity("Repair management", "Repairs", "Updated repair list")
              }}
              onPartsUpdate={handlePartsUpdate}
              logActivity={logActivity}
            />
          )}

          {activeTab === "parts" && (
            <AdminPartsInventory
              parts={parts}
              repairs={repairs}
              onUpdate={handlePartsUpdate}
              logActivity={logActivity}
            />
          )}

          {activeTab === "users" && (
            <AdminUserManagement
              users={users}
              onUpdate={handleUserUpdate}
              logActivity={logActivity}
              currentUser={currentUser}
            />
          )}

          {activeTab === "activity" && <AdminActivityLog logs={activityLogs} />}

          {activeTab === "settings" && <AdminSettings logActivity={logActivity} />}

          {activeTab === "timeManagement" && <TimeManagement currentUser={currentUser} allUsers={users} />}
        </div>
      </div>
    </div>
  )
}
