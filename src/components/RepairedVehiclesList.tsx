"use client"

import { useState } from "react"
import type { Vehicle, RepairService } from "../types"
import { Calendar, PenToolIcon as Tool, DollarSign, Clock } from "lucide-react"

interface RepairedVehiclesListProps {
  vehicles: Vehicle[]
  repairs: RepairService[]
  onSelectVehicle: (vehicle: Vehicle) => void
}

export default function RepairedVehiclesList({ vehicles, repairs, onSelectVehicle }: RepairedVehiclesListProps) {
  const [sortBy, setSortBy] = useState<"date" | "cost">("date")

  // Get only repaired vehicles
  const repairedVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "repaired" ||
      repairs.some((repair) => repair.vehicleId === vehicle.id && repair.status === "completed"),
  )

  // Group repairs by vehicle
  const vehicleRepairs = repairedVehicles.map((vehicle) => {
    const vehicleRepairList = repairs.filter(
      (repair) => repair.vehicleId === vehicle.id && repair.status === "completed",
    )

    // Sort repairs by date (newest first) or cost (highest first)
    const sortedRepairs = [...vehicleRepairList].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
      } else {
        return b.cost - a.cost
      }
    })

    return {
      vehicle,
      repairs: sortedRepairs,
      totalCost: sortedRepairs.reduce((sum, repair) => sum + repair.cost, 0),
      lastRepairDate: sortedRepairs.length > 0 ? new Date(sortedRepairs[0].serviceDate).toLocaleDateString() : "N/A",
    }
  })

  // Sort the vehicle groups
  const sortedVehicleRepairs = [...vehicleRepairs].sort((a, b) => {
    if (sortBy === "date" && a.repairs.length && b.repairs.length) {
      return new Date(b.repairs[0].serviceDate).getTime() - new Date(a.repairs[0].serviceDate).getTime()
    } else {
      return b.totalCost - a.totalCost
    }
  })

  if (repairedVehicles.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-xl">
        <div className="text-gray-400 mb-4">
          <Tool className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Repaired Vehicles</h3>
        <p className="text-gray-500">Vehicles that have been repaired will appear here.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Repaired Vehicles</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div className="flex rounded-lg overflow-hidden border">
            <button
              className={`px-3 py-1 text-sm ${sortBy === "date" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
              onClick={() => setSortBy("date")}
            >
              Latest
            </button>
            <button
              className={`px-3 py-1 text-sm ${sortBy === "cost" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
              onClick={() => setSortBy("cost")}
            >
              Cost
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedVehicleRepairs.map(({ vehicle, repairs, totalCost, lastRepairDate }) => (
          <div
            key={vehicle.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => onSelectVehicle(vehicle)}
          >
            <div className="h-40 bg-gray-200 relative">
              {vehicle.image ? (
                <img
                  src={vehicle.image || "/placeholder.svg"}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-4xl">🚗</span>
                </div>
              )}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-3">
                <div className="flex justify-between items-center">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Repaired</span>
                  <span className="text-white text-sm font-medium">{vehicle.licensePlate || "No plate"}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Last repaired: {lastRepairDate}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Tool className="h-4 w-4 mr-2 text-blue-500" />
                  <span>
                    {repairs.length} repair{repairs.length !== 1 ? "s" : ""} completed
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Total cost: ETB {totalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Total hours: {repairs.reduce((sum, r) => sum + r.laborHours, 0)}</span>
                </div>
              </div>

              {repairs.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="font-medium text-sm mb-2">Latest Repair:</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{repairs[0].description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
