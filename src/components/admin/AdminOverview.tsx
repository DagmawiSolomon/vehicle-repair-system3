"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Wrench, Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import type { Vehicle, RepairService, Part, ActivityLog } from "../../types"

interface AdminOverviewProps {
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
    lowStockParts: number
    totalParts: number
  }
  vehicles: Vehicle[]
  repairs: RepairService[]
  parts: Part[]
  activityLogs: ActivityLog[]
}

export default function AdminOverview({ stats, vehicles, repairs, parts, activityLogs }: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to the admin dashboard. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">{stats.activeVehicles} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Repairs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRepairs}</div>
            <p className="text-xs text-muted-foreground">{stats.completedRepairs} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Avg: ${stats.averageRepairCost.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockParts}</div>
            <p className="text-xs text-muted-foreground">of {stats.totalParts} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLogs.length > 0 ? (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-gray-600">{log.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {log.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockParts > 0 && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-800">Low Stock Alert</p>
                    <p className="text-sm text-red-600">{stats.lowStockParts} parts need restocking</p>
                  </div>
                </div>
              )}

              {stats.vehiclesNeedingService > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Car className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-800">Service Due</p>
                    <p className="text-sm text-yellow-600">{stats.vehiclesNeedingService} vehicles need service</p>
                  </div>
                </div>
              )}

              {stats.pendingRepairs > 5 && (
                <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Wrench className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-800">High Workload</p>
                    <p className="text-sm text-blue-600">{stats.pendingRepairs} repairs pending</p>
                  </div>
                </div>
              )}

              {stats.lowStockParts === 0 && stats.vehiclesNeedingService === 0 && stats.pendingRepairs <= 5 && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">All Systems Normal</p>
                    <p className="text-sm text-green-600">No critical alerts at this time</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
