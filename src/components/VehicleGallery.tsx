"use client"

import { useState } from "react"
import type { Vehicle } from "../types"

interface VehicleGalleryProps {
  vehicles: Vehicle[]
  onSelectVehicle: (vehicle: Vehicle) => void
}

export default function VehicleGallery({ vehicles, onSelectVehicle }: VehicleGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeStatus, setActiveStatus] = useState("all")

  const vehicleTypes = ["all", "car", "truck", "suv", "van", "motorcycle"]
  const statusTypes = ["all", "active", "maintenance", "inactive", "repaired"]

  const filteredVehicles = vehicles.filter((vehicle) => {
    // Filter by type
    const typeMatch = activeCategory === "all" || vehicle.type === activeCategory

    // Filter by status
    const statusMatch = activeStatus === "all" || vehicle.status === activeStatus

    return typeMatch && statusMatch
  })

  // Get vehicle image based on type
  const getVehicleImage = (vehicle: Vehicle) => {
    if (vehicle.image) {
      return vehicle.image
    }

    // Default placeholder based on type
    switch (vehicle.type) {
      case "car":
        return "/placeholder.svg?height=200&width=300"
      case "truck":
        return "/placeholder.svg?height=200&width=300"
      case "suv":
        return "/placeholder.svg?height=200&width=300"
      case "van":
        return "/placeholder.svg?height=200&width=300"
      case "motorcycle":
        return "/placeholder.svg?height=200&width=300"
      default:
        return "/placeholder.svg?height=200&width=300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "maintenance":
        return "bg-orange-500"
      case "inactive":
        return "bg-red-500"
      case "repaired":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Our Vehicle Collection</h2>

      {/* Filter Tabs */}
      <div className="mb-6 space-y-4">
        {/* Type Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Filter by Type:</h3>
          <div className="flex flex-wrap gap-2">
            {vehicleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveCategory(type)}
                className={`px-4 py-2 rounded-full transition-all ${
                  activeCategory === type ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Filter by Status:</h3>
          <div className="flex flex-wrap gap-2">
            {statusTypes.map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-4 py-2 rounded-full transition-all ${
                  activeStatus === status ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No vehicles found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle)}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getVehicleImage(vehicle) || "/placeholder.svg"}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <span className={`${getStatusColor(vehicle.status)} h-3 w-3 rounded-full`}></span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-white/80 text-sm">{vehicle.year}</p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {vehicle.type?.charAt(0).toUpperCase() + (vehicle.type?.slice(1) || "")}
                    </span>
                    {vehicle.purchasePrice && vehicle.marketValue && (
                      <span
                        className={`ml-2 text-sm font-medium px-2 py-1 rounded-full ${
                          vehicle.marketValue > vehicle.purchasePrice
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vehicle.marketValue > vehicle.purchasePrice ? "Profit" : "Loss"}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">{vehicle.licensePlate || "No plate"}</span>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>Mileage: {vehicle.mileage?.toLocaleString()} miles</p>
                  {vehicle.lastServiceDate && (
                    <p>Last Service: {new Date(vehicle.lastServiceDate).toLocaleDateString()}</p>
                  )}
                  {vehicle.owner && <p>Owner: {vehicle.owner.name}</p>}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  {vehicle.marketValue ? (
                    <span className="font-bold text-blue-600">ETB {vehicle.marketValue.toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-400">No value set</span>
                  )}
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium group-hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
