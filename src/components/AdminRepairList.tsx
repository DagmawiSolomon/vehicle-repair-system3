"use client"

import { useState, useEffect } from "react"
import type { Vehicle, RepairService } from "../types"
import { formatCurrency } from "../utils/format-utils"
import { Search, Filter, Download, Trash2, Eye } from "lucide-react"

interface AdminRepairListProps {
  repairs: RepairService[]
  vehicles: Vehicle[]
  onUpdate: (repairs: RepairService[]) => void
  logActivity: (action: string, category: string, description: string) => void
}

export default function AdminRepairList({ repairs, vehicles, onUpdate, logActivity }: AdminRepairListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("serviceDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filteredRepairs, setFilteredRepairs] = useState<RepairService[]>(repairs)
  const [selectedRepair, setSelectedRepair] = useState<RepairService | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Apply filters and sorting
  useEffect(() => {
    let result = [...repairs]

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((repair) => {
        const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
        return (
          repair.description.toLowerCase().includes(term) ||
          repair.technician.toLowerCase().includes(term) ||
          (vehicle &&
            (vehicle.make.toLowerCase().includes(term) ||
              vehicle.model.toLowerCase().includes(term) ||
              vehicle.vin.toLowerCase().includes(term) ||
              (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(term))))
        )
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((repair) => repair.status === statusFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any
      let valueB: any

      switch (sortBy) {
        case "cost":
          valueA = a.cost
          valueB = b.cost
          break
        case "technician":
          valueA = a.technician.toLowerCase()
          valueB = b.technician.toLowerCase()
          break
        case "serviceDate":
        default:
          valueA = new Date(a.serviceDate).getTime()
          valueB = new Date(b.serviceDate).getTime()
          break
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setFilteredRepairs(result)
  }, [repairs, vehicles, searchTerm, statusFilter, sortBy, sortOrder])

  const handleDeleteRepair = () => {
    if (!selectedRepair) return

    const updatedRepairs = repairs.filter((r) => r.id !== selectedRepair.id)
    onUpdate(updatedRepairs)

    const vehicle = vehicles.find((v) => v.id === selectedRepair.vehicleId)
    logActivity(
      "Delete repair",
      "Repairs",
      `Deleted repair for ${vehicle ? `${vehicle.make} ${vehicle.model}` : "unknown vehicle"}: ${selectedRepair.description.substring(0, 30)}...`,
    )

    setIsDeleteModalOpen(false)
    setSelectedRepair(null)
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["ID", "Vehicle", "Description", "Cost", "Service Date", "Technician", "Status", "Labor Hours"]
    const rows = filteredRepairs.map((repair) => {
      const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
      const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : "Unknown Vehicle"

      return [
        repair.id,
        vehicleName,
        repair.description,
        repair.cost,
        new Date(repair.serviceDate).toLocaleDateString(),
        repair.technician,
        repair.status,
        repair.laborHours,
      ]
    })

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `repairs_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logActivity("Export repairs", "Repairs", `Exported ${filteredRepairs.length} repairs to CSV`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Repair Management</h2>
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
              placeholder="Search repairs..."
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
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                <option value="serviceDate-desc">Latest Service Date</option>
                <option value="serviceDate-asc">Oldest Service Date</option>
                <option value="cost-desc">Cost (Highest)</option>
                <option value="cost-asc">Cost (Lowest)</option>
                <option value="technician-asc">Technician (A-Z)</option>
                <option value="technician-desc">Technician (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Repairs Table */}
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
                  Repair Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cost
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Technician
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
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
              {filteredRepairs.length > 0 ? (
                filteredRepairs.map((repair) => {
                  const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
                  return (
                    <tr key={repair.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle ? `${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle ? vehicle.year : ""} {vehicle?.licensePlate ? `• ${vehicle.licensePlate}` : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2">{repair.description}</div>
                        <div className="text-sm text-gray-500">{new Date(repair.serviceDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{formatCurrency(repair.cost)}</div>
                        <div className="text-xs text-gray-500">{repair.laborHours} hours</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.technician}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            repair.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : repair.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : repair.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRepair(repair)
                            setIsViewModalOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRepair(repair)
                            setIsDeleteModalOpen(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No repairs found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Repair Modal */}
      {isViewModalOpen && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Repair Details</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Vehicle Information</h4>
                  {(() => {
                    const vehicle = vehicles.find((v) => v.id === selectedRepair.vehicleId)
                    return (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {vehicle ? (
                          <>
                            <div className="font-medium">
                              {vehicle.make} {vehicle.model} ({vehicle.year})
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              VIN: {vehicle.vin} • License: {vehicle.licensePlate || "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">Owner: {vehicle.owner?.name || "N/A"}</div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-600">Vehicle information not available</div>
                        )}
                      </div>
                    )
                  })()}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Repair Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-3">
                      <div className="font-medium">Description</div>
                      <div className="text-sm text-gray-600 mt-1">{selectedRepair.description}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Service Date</div>
                        <div className="font-medium">{new Date(selectedRepair.serviceDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <div>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              selectedRepair.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : selectedRepair.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : selectedRepair.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedRepair.status.charAt(0).toUpperCase() + selectedRepair.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Technician</div>
                        <div className="font-medium">{selectedRepair.technician}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Labor Hours</div>
                        <div className="font-medium">{selectedRepair.laborHours}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Financial Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">Total Cost</div>
                      <div className="text-xl font-bold text-blue-600">{formatCurrency(selectedRepair.cost)}</div>
                    </div>
                  </div>
                </div>

                {selectedRepair.parts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Parts Used</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="list-disc list-inside space-y-1">
                        {selectedRepair.parts.map((part, index) => (
                          <li key={index} className="text-sm">
                            {part}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedRepair.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{selectedRepair.notes}</p>
                    </div>
                  </div>
                )}

                {selectedRepair.images && selectedRepair.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedRepair.images.map((image, index) => (
                        <a key={index} href={image} target="_blank" rel="noopener noreferrer" className="block">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Repair image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-4 border-t">
                  <p>Created: {new Date(selectedRepair.createdAt).toLocaleString()}</p>
                  <p>Last Updated: {new Date(selectedRepair.updatedAt).toLocaleString()}</p>
                </div>
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
      {isDeleteModalOpen && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Delete Repair Record</h3>
              </div>

              <p className="mb-4">Are you sure you want to delete this repair record? This action cannot be undone.</p>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="font-medium">{selectedRepair.description.substring(0, 50)}...</p>
                <p className="text-sm text-gray-600">
                  Service Date: {new Date(selectedRepair.serviceDate).toLocaleDateString()} • Cost:{" "}
                  {formatCurrency(selectedRepair.cost)}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRepair}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Repair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
