"use client"

import { useState, useEffect } from "react"
import type { Vehicle } from "../types"
import { formatDistance, formatCurrency } from "../utils/format-utils"
import { getStatusBadgeClasses } from "../utils/vehicle-utils"
import { Search, Filter, Download, Trash2, Edit, Eye } from "lucide-react"

interface AdminVehicleListProps {
  vehicles: Vehicle[]
  onUpdate: (vehicles: Vehicle[]) => void
  logActivity: (action: string, category: string, description: string) => void
}

export default function AdminVehicleList({ vehicles, onUpdate, logActivity }: AdminVehicleListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("lastUpdated")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(vehicles)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Apply filters and sorting
  useEffect(() => {
    let result = [...vehicles]

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (vehicle) =>
          vehicle.make.toLowerCase().includes(term) ||
          vehicle.model.toLowerCase().includes(term) ||
          vehicle.vin.toLowerCase().includes(term) ||
          (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(term)) ||
          (vehicle.owner?.name && vehicle.owner.name.toLowerCase().includes(term)),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((vehicle) => vehicle.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((vehicle) => vehicle.type === typeFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any
      let valueB: any

      switch (sortBy) {
        case "make":
          valueA = a.make.toLowerCase()
          valueB = b.make.toLowerCase()
          break
        case "year":
          valueA = a.year
          valueB = b.year
          break
        case "mileage":
          valueA = a.mileage
          valueB = b.mileage
          break
        case "lastUpdated":
        default:
          valueA = new Date(a.lastUpdated).getTime()
          valueB = new Date(b.lastUpdated).getTime()
          break
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setFilteredVehicles(result)
  }, [vehicles, searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return

    const updatedVehicles = vehicles.filter((v) => v.id !== selectedVehicle.id)
    onUpdate(updatedVehicles)
    logActivity(
      "Delete vehicle",
      "Vehicles",
      `Deleted vehicle: ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})`,
    )
    setIsDeleteModalOpen(false)
    setSelectedVehicle(null)
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "ID",
      "Make",
      "Model",
      "Year",
      "VIN",
      "License Plate",
      "Mileage",
      "Status",
      "Owner",
      "Last Updated",
    ]
    const rows = filteredVehicles.map((vehicle) => [
      vehicle.id,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.vin,
      vehicle.licensePlate || "",
      vehicle.mileage,
      vehicle.status,
      vehicle.owner?.name || "",
      new Date(vehicle.lastUpdated).toLocaleString(),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `vehicles_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logActivity("Export vehicles", "Vehicles", `Exported ${filteredVehicles.length} vehicles to CSV`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vehicle Management</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-1 text-gray-500" />
              <select
                className="border rounded-lg px-3 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="in_repair">In Repair</option>
                <option value="repaired">Repaired</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
              </select>
            </div>

            <div className="flex items-center">
              <select
                className="border rounded-lg px-3 py-2"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="car">Car</option>
                <option value="truck">Truck</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>

            <div className="flex items-center">
              <select
                className="border rounded-lg px-3 py-2"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-")
                  setSortBy(newSortBy)
                  setSortOrder(newSortOrder as "asc" | "desc")
                }}
              >
                <option value="lastUpdated-desc">Latest Updated</option>
                <option value="lastUpdated-asc">Oldest Updated</option>
                <option value="make-asc">Make (A-Z)</option>
                <option value="make-desc">Make (Z-A)</option>
                <option value="year-desc">Year (Newest)</option>
                <option value="year-asc">Year (Oldest)</option>
                <option value="mileage-desc">Mileage (Highest)</option>
                <option value="mileage-asc">Mileage (Lowest)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vehicle
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Owner
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Updated
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {vehicle.image ? (
                            <img
                              src={vehicle.image || "/placeholder.svg"}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <span className="text-xs">🚗</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.year} • {vehicle.licensePlate || "No plate"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">VIN: {vehicle.vin}</div>
                      <div className="text-sm text-gray-500">
                        {formatDistance(vehicle.mileage)} • {vehicle.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.owner?.name || "N/A"}</div>
                      <div className="text-sm text-gray-500">{vehicle.owner?.phone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(vehicle.status)}`}
                      >
                        {vehicle.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vehicle.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsViewModalOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          // In a real app, this would navigate to edit page
                          alert("Edit functionality would be implemented here")
                          logActivity(
                            "Edit vehicle attempt",
                            "Vehicles",
                            `Attempted to edit vehicle: ${vehicle.make} ${vehicle.model}`,
                          )
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsDeleteModalOpen(true)
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No vehicles found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Vehicle Modal */}
      {isViewModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                </h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {selectedVehicle.image ? (
                    <img
                      src={selectedVehicle.image || "/placeholder.svg"}
                      alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      <span className="text-4xl">🚗</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Vehicle Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">VIN:</span>
                        <span className="text-sm font-medium">{selectedVehicle.vin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">License Plate:</span>
                        <span className="text-sm font-medium">{selectedVehicle.licensePlate || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium">{selectedVehicle.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mileage:</span>
                        <span className="text-sm font-medium">{formatDistance(selectedVehicle.mileage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(selectedVehicle.status)}`}
                        >
                          {selectedVehicle.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Owner Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium">{selectedVehicle.owner?.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{selectedVehicle.owner?.email || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium">{selectedVehicle.owner?.phone || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Financial Information</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Purchase Price:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedVehicle.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Value:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedVehicle.marketValue)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Service Information</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Service Date:</span>
                      <span className="text-sm font-medium">
                        {selectedVehicle.lastServiceDate
                          ? new Date(selectedVehicle.lastServiceDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Next Service Date:</span>
                      <span className="text-sm font-medium">
                        {selectedVehicle.nextServiceDate
                          ? new Date(selectedVehicle.nextServiceDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Service Interval:</span>
                      <span className="text-sm font-medium">
                        {selectedVehicle.serviceInterval ? `${selectedVehicle.serviceInterval} days` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Distance Interval:</span>
                      <span className="text-sm font-medium">
                        {selectedVehicle.distanceInterval ? formatDistance(selectedVehicle.distanceInterval) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedVehicle.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                    <p className="mt-2 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedVehicle.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Delete Vehicle</h3>
              </div>

              <p className="mb-4">
                Are you sure you want to delete{" "}
                <strong>
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                </strong>
                ? This action cannot be undone and will remove all associated repair records.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVehicle}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
