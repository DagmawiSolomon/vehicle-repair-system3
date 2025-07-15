"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, DollarSign, Wrench } from "lucide-react"
import type { Vehicle, RepairService } from "@/src/types"

interface AdminReportsProps {
  stats: {
    totalVehicles: number
    activeRepairs: number
    completedRepairs: number
    totalRevenue: number
    pendingRepairs: number
    totalUsers: number
    lowStockParts: number
    totalParts: number
  }
  vehicles: Vehicle[]
  repairs: RepairService[]
  isLoading: boolean
}

export default function AdminReports({ stats, vehicles, repairs, isLoading }: AdminReportsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const averageRepairCost = stats.completedRepairs > 0 ? stats.totalRevenue / stats.completedRepairs : 0
  const completionRate = repairs.length > 0 ? (stats.completedRepairs / repairs.length) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Key metrics and performance indicators</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {stats.completedRepairs} completed repairs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Repair Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageRepairCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per completed repair</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of all repairs</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Repair Status Breakdown</CardTitle>
            <CardDescription>Current status of all repairs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <span className="text-sm font-medium">{stats.completedRepairs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="text-sm font-medium">{stats.activeRepairs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-medium">{stats.pendingRepairs}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status Overview</CardTitle>
            <CardDescription>Current status of all vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["active", "in_repair", "maintenance", "ready_for_pickup"].map((status) => {
                const count = vehicles.filter((v) => v.status === status).length
                const percentage = vehicles.length > 0 ? (count / vehicles.length) * 100 : 0

                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm capitalize">{status.replace("_", " ")}</span>
                      <span className="text-sm font-medium">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest repairs and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {repairs.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {repairs
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
                )
                .slice(0, 5)
                .map((repair) => {
                  const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
                  return (
                    <div key={repair.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Wrench className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{repair.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            repair.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : repair.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : repair.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {repair.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
