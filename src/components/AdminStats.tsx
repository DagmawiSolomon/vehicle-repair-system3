"use client"

import { useState, useEffect } from "react"
import type { Vehicle, RepairService } from "../types"
import { formatCurrency, formatDistance } from "../utils/format-utils"
import { getCompanySettings } from "../utils/company-utils"
import {
  BarChart3,
  Car,
  Wrench,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react"

interface AdminStatsProps {
  stats: {
    totalVehicles: number
    activeVehicles: number
    vehiclesInRepair: number
    vehiclesNeedingService: number
    totalRepairs: number
    completedRepairs: number
    pendingRepairs: number
    totalRevenue: number
    averageRepairCost: number
  }
  vehicles: Vehicle[]
  repairs: RepairService[]
}

export default function AdminStats({ stats, vehicles, repairs }: AdminStatsProps) {
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all")
  const [filteredStats, setFilteredStats] = useState(stats)
  const settings = getCompanySettings()

  useEffect(() => {
    if (timeframe === "all") {
      setFilteredStats(stats)
      return
    }

    const now = new Date()
    let cutoffDate: Date

    if (timeframe === "month") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    } else {
      // week
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Filter repairs by date
    const filteredRepairs = repairs.filter((repair) => {
      const repairDate = new Date(repair.serviceDate)
      return repairDate >= cutoffDate
    })

    // Calculate filtered stats
    const completedRepairs = filteredRepairs.filter((r) => r.status === "completed").length
    const pendingRepairs = filteredRepairs.filter((r) => r.status === "pending" || r.status === "in-progress").length
    const totalRevenue = filteredRepairs.reduce((sum, repair) => sum + repair.cost, 0)
    const averageRepairCost = filteredRepairs.length > 0 ? totalRevenue / filteredRepairs.length : 0

    setFilteredStats({
      ...stats,
      totalRepairs: filteredRepairs.length,
      completedRepairs,
      pendingRepairs,
      totalRevenue,
      averageRepairCost,
    })
  }, [timeframe, stats, repairs])

  // Get recent repairs
  const recentRepairs = [...repairs]
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
    .slice(0, 5)

  // Get vehicles needing service
  const vehiclesNeedingService = vehicles
    .filter((vehicle) => {
      if (!vehicle.lastServiceDate || !vehicle.serviceInterval) return false

      const lastService = new Date(vehicle.lastServiceDate)
      const nextService = new Date(lastService)
      nextService.setDate(nextService.getDate() + vehicle.serviceInterval)

      return nextService <= new Date()
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
          Dashboard Overview
        </h2>

        <div className="flex rounded-lg overflow-hidden border">
          <button
            className={`px-3 py-1 text-sm ${timeframe === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
            onClick={() => setTimeframe("all")}
          >
            All Time
          </button>
          <button
            className={`px-3 py-1 text-sm ${timeframe === "month" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
            onClick={() => setTimeframe("month")}
          >
            Last Month
          </button>
          <button
            className={`px-3 py-1 text-sm ${timeframe === "week" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
            onClick={() => setTimeframe("week")}
          >
            Last Week
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Vehicles</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalVehicles}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-green-600">
              <span className="font-medium">{stats.activeVehicles} active</span>
            </div>
            <span className="mx-2 text-gray-400">•</span>
            <div className="flex items-center text-orange-600">
              <span className="font-medium">{stats.vehiclesInRepair} in repair</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Repairs</p>
              <h3 className="text-3xl font-bold mt-1">{filteredStats.totalRepairs}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Wrench className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="font-medium">{filteredStats.completedRepairs} completed</span>
            </div>
            <span className="mx-2 text-gray-400">•</span>
            <div className="flex items-center text-yellow-600">
              <Clock className="h-4 w-4 mr-1" />
              <span className="font-medium">{filteredStats.pendingRepairs} pending</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-1">{formatCurrency(filteredStats.totalRevenue)}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-purple-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="font-medium">Avg. {formatCurrency(filteredStats.averageRepairCost)} per repair</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Service Due</p>
              <h3 className="text-3xl font-bold mt-1">{stats.vehiclesNeedingService}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-red-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="font-medium">{stats.vehiclesNeedingService} vehicles need attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Repairs</h3>

          {recentRepairs.length > 0 ? (
            <div className="space-y-4">
              {recentRepairs.map((repair) => {
                const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
                return (
                  <div key={repair.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">
                        {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : "Unknown Vehicle"}
                      </p>
                      <p className="text-sm text-gray-500">{repair.description.substring(0, 50)}...</p>
                      <div className="flex items-center mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            repair.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : repair.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(repair.serviceDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatCurrency(repair.cost)}</p>
                      <p className="text-xs text-gray-500">{repair.technician}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No recent repairs found</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Vehicles Needing Service</h3>

          {vehiclesNeedingService.length > 0 ? (
            <div className="space-y-4">
              {vehiclesNeedingService.map((vehicle) => {
                const lastServiceDate = vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate) : null

                const daysSinceService = lastServiceDate
                  ? Math.floor((new Date().getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <div key={vehicle.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </p>
                      <p className="text-sm text-gray-500">Owner: {vehicle.owner?.name || "Unknown"}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-red-600 font-medium">
                          {daysSinceService ? `${daysSinceService} days since last service` : "No service record"}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{formatDistance(vehicle.mileage)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === "active"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "in_repair"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {vehicle.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No vehicles currently need service</div>
          )}
        </div>
      </div>
    </div>
  )
}
