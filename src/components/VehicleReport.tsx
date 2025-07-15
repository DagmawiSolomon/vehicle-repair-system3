"use client"

import { useState, useEffect, useCallback } from "react"
import type { Vehicle, RepairService, StatusHistory } from "../types"
import { RepairForm } from "./RepairForm"
import { VehicleForm } from "./VehicleForm"
import HeroSection from "./HeroSection"
import VehicleGallery from "./VehicleGallery"
import Testimonials from "./Testimonials"
import ServicesSection from "./ServicesSection"
import WhyChooseUs from "./WhyChooseUs"
import ValueProposition from "./ValueProposition"
import CallToAction from "./CallToAction"
import RepairedVehiclesList from "./RepairedVehiclesList"
import StatusUpdateForm from "./StatusUpdateForm"
import DeleteConfirmationDialog from "./DeleteConfirmationDialog"
import StatusHistoryList from "./StatusHistoryList"
import ServiceNotifications from "./ServiceNotifications"
import RepairDetails from "./RepairDetails"
import {
  addStatusHistory,
  getVehicleStatusHistory,
  getStatusBadgeClasses,
  isServiceDue,
  calculateNextServiceDate,
} from "../utils/vehicle-utils"
import { Search, Plus, Edit, Trash2, RefreshCw, Clock, AlertTriangle, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

// Import the new utility functions
import { formatCurrency, formatDistance } from "../utils/format-utils"

interface VehicleReportProps {
  initialVehicles?: Vehicle[]
}

export default function VehicleReport({ initialVehicles = [] }: VehicleReportProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [showRepairForm, setShowRepairForm] = useState(false)
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [repairs, setRepairs] = useState<RepairService[]>([])
  const [selectedRepair, setSelectedRepair] = useState<RepairService | null>(null)
  const [editingRepair, setEditingRepair] = useState<RepairService | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isInitialized, setIsInitialized] = useState(false)
  const [allRepairs, setAllRepairs] = useState<RepairService[]>([])
  const [showVehicleDetails, setShowVehicleDetails] = useState(false)
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [activeView, setActiveView] = useState<"gallery" | "repaired">("gallery")
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [serviceDueVehicles, setServiceDueVehicles] = useState<Vehicle[]>([])

  const router = useRouter()

  // Load vehicles from localStorage only once on component mount
  useEffect(() => {
    if (!isInitialized) {
      const storedVehicles = localStorage.getItem("vehicles")
      if (storedVehicles) {
        try {
          const parsedVehicles = JSON.parse(storedVehicles)
          // Add type field if it doesn't exist for backward compatibility
          const updatedVehicles = parsedVehicles.map((vehicle: Vehicle) => ({
            ...vehicle,
            type: vehicle.type || "car", // Default to 'car' if type is not specified
            lastUpdated: vehicle.lastUpdated || new Date().toISOString(),
          }))
          setVehicles(updatedVehicles)
          setFilteredVehicles(updatedVehicles)

          // Check for vehicles due for service
          const dueVehicles = updatedVehicles.filter((vehicle) => isServiceDue(vehicle))
          setServiceDueVehicles(dueVehicles)
        } catch (error) {
          console.error("Error parsing vehicles from localStorage:", error)
          setVehicles([])
        }
      } else if (initialVehicles.length > 0) {
        // Add type field if it doesn't exist
        const updatedVehicles = initialVehicles.map((vehicle) => ({
          ...vehicle,
          type: vehicle.type || "car", // Default to 'car' if type is not specified
          lastUpdated: vehicle.lastUpdated || new Date().toISOString(),
        }))
        setVehicles(updatedVehicles)
        setFilteredVehicles(updatedVehicles)
        localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))
      }

      // Load all repairs for profit/loss calculations
      const storedRepairs = localStorage.getItem("vehicleRepairs")
      if (storedRepairs) {
        try {
          const parsedRepairs = JSON.parse(storedRepairs)
          setAllRepairs(parsedRepairs)
        } catch (error) {
          console.error("Error parsing repairs from localStorage:", error)
          setAllRepairs([])
        }
      }

      setIsInitialized(true)
    }
  }, [initialVehicles, isInitialized])

  // Filter vehicles based on search term and type - using useCallback to memoize the function
  const filterVehicles = useCallback(() => {
    let filtered = [...vehicles]

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.type === typeFilter)
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.make.toLowerCase().includes(term) ||
          vehicle.model.toLowerCase().includes(term) ||
          vehicle.vin.toLowerCase().includes(term) ||
          (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(term)),
      )
    }

    setFilteredVehicles(filtered)
  }, [searchTerm, typeFilter, vehicles])

  // Apply the filter whenever dependencies change
  useEffect(() => {
    filterVehicles()
  }, [filterVehicles])

  // Load repairs for the selected vehicle
  useEffect(() => {
    if (selectedVehicle) {
      const storedRepairs = localStorage.getItem("vehicleRepairs")
      if (storedRepairs) {
        try {
          const allRepairs: RepairService[] = JSON.parse(storedRepairs)
          const vehicleRepairs = allRepairs.filter((repair) => repair.vehicleId === selectedVehicle.id)
          setRepairs(vehicleRepairs)
        } catch (error) {
          console.error("Error parsing repairs from localStorage:", error)
          setRepairs([])
        }
      } else {
        setRepairs([])
      }

      // Load status history for the selected vehicle
      const vehicleHistory = getVehicleStatusHistory(selectedVehicle.id)
      setStatusHistory(vehicleHistory)
    }
  }, [selectedVehicle])

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowRepairForm(false)
    setShowVehicleForm(false)
    setEditingVehicle(null)
    setShowStatusForm(false)
    setSelectedRepair(null)
    setEditingRepair(null)
    setShowVehicleDetails(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleAddRepair = (repairData: RepairService, updateStatus: boolean, statusNotes?: string) => {
    // Save to localStorage
    const storedRepairs = localStorage.getItem("vehicleRepairs")
    let updatedRepairs: RepairService[] = []

    if (storedRepairs) {
      try {
        updatedRepairs = JSON.parse(storedRepairs)
      } catch (error) {
        console.error("Error parsing repairs from localStorage:", error)
      }
    }

    // If editing an existing repair
    if (editingRepair) {
      // Check if the repair being edited is completed
      const isEditingCompleted = editingRepair.status === "completed"

      if (isEditingCompleted) {
        // Only update notes and images for completed repairs
        updatedRepairs = updatedRepairs.map((repair) =>
          repair.id === repairData.id
            ? {
                ...repair,
                notes: repairData.notes,
                images: repairData.images,
                updatedAt: new Date().toISOString(),
              }
            : repair,
        )
      } else {
        // Normal update for non-completed repairs
        updatedRepairs = updatedRepairs.map((repair) => (repair.id === repairData.id ? repairData : repair))
      }
    } else {
      // Add a new repair
      updatedRepairs.push(repairData)
    }

    localStorage.setItem("vehicleRepairs", JSON.stringify(updatedRepairs))

    // Update state
    if (editingRepair) {
      const isEditingCompleted = editingRepair.status === "completed"

      if (isEditingCompleted) {
        // Only update notes and images for completed repairs
        setRepairs((prev) =>
          prev.map((repair) =>
            repair.id === repairData.id
              ? {
                  ...repair,
                  notes: repairData.notes,
                  images: repairData.images,
                  updatedAt: new Date().toISOString(),
                }
              : repair,
          ),
        )
      } else {
        // Normal update for non-completed repairs
        setRepairs((prev) => prev.map((repair) => (repair.id === repairData.id ? repairData : repair)))
      }
    } else {
      // Add a new repair
      setRepairs((prev) => [...prev, repairData])
    }

    setAllRepairs(updatedRepairs)
    setShowRepairForm(false)
    setEditingRepair(null)

    // If the repair is completed and updateStatus is true, update the vehicle status
    if (repairData.status === "completed" && updateStatus && selectedVehicle) {
      const newStatus = "repaired" as Vehicle["status"]
      handleUpdateVehicleStatus(selectedVehicle.id, newStatus, statusNotes, repairData.id)

      // Also update the last service date
      const updatedVehicles = vehicles.map((vehicle) =>
        vehicle.id === selectedVehicle.id
          ? {
              ...vehicle,
              lastServiceDate: repairData.serviceDate,
              nextServiceDate: calculateNextServiceDate({
                ...vehicle,
                lastServiceDate: repairData.serviceDate,
              }),
              lastUpdated: new Date().toISOString(),
            }
          : vehicle,
      )

      setVehicles(updatedVehicles)
      setFilteredVehicles(updatedVehicles)
      localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))

      // Update selected vehicle
      if (selectedVehicle) {
        setSelectedVehicle({
          ...selectedVehicle,
          lastServiceDate: repairData.serviceDate,
          nextServiceDate: calculateNextServiceDate({
            ...selectedVehicle,
            lastServiceDate: repairData.serviceDate,
          }),
          lastUpdated: new Date().toISOString(),
        })
      }

      // Check for vehicles due for service
      const dueVehicles = updatedVehicles.filter((v) => isServiceDue(v))
      setServiceDueVehicles(dueVehicles)
    }
  }

  const handleAddVehicle = (vehicle: Vehicle) => {
    if (editingVehicle) {
      // Update existing vehicle
      const updatedVehicles = vehicles.map((v) =>
        v.id === vehicle.id
          ? {
              ...vehicle,
              lastUpdated: new Date().toISOString(),
            }
          : v,
      )
      setVehicles(updatedVehicles)
      setFilteredVehicles(updatedVehicles)
      localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))
      setEditingVehicle(null)

      // If this is the currently selected vehicle, update it
      if (selectedVehicle && selectedVehicle.id === vehicle.id) {
        setSelectedVehicle({
          ...vehicle,
          lastUpdated: new Date().toISOString(),
        })
      }
    } else {
      // Add new vehicle
      const newVehicle = {
        ...vehicle,
        type: vehicle.type || "car", // Ensure type is set
        lastUpdated: new Date().toISOString(),
      }

      const updatedVehicles = [...vehicles, newVehicle]
      setVehicles(updatedVehicles)
      setFilteredVehicles(updatedVehicles)
      localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))
      setSelectedVehicle(newVehicle)
    }

    setShowVehicleForm(false)
    setShowVehicleDetails(true)

    // Check for vehicles due for service
    const dueVehicles = vehicles.filter((v) => isServiceDue(v))
    setServiceDueVehicles(dueVehicles)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowVehicleForm(true)
    setShowStatusForm(false)
    setShowRepairForm(false)
    setSelectedRepair(null)
    setEditingRepair(null)
  }

  const handleUpdateVehicleStatus = (
    vehicleId: string,
    newStatus: Vehicle["status"],
    notes?: string,
    associatedRepairId?: string,
  ) => {
    // Find the vehicle
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (!vehicle) return

    // Add to status history
    addStatusHistory(vehicleId, vehicle.status, newStatus, notes, associatedRepairId)

    // Update the vehicle
    const updatedVehicles = vehicles.map((vehicle) =>
      vehicle.id === vehicleId
        ? {
            ...vehicle,
            status: newStatus,
            lastUpdated: new Date().toISOString(),
          }
        : vehicle,
    )

    setVehicles(updatedVehicles)
    setFilteredVehicles(updatedVehicles)
    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))

    // Update selected vehicle if it's the one being modified
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      setSelectedVehicle({
        ...selectedVehicle,
        status: newStatus,
        lastUpdated: new Date().toISOString(),
      })

      // Refresh status history
      const vehicleHistory = getVehicleStatusHistory(vehicleId)
      setStatusHistory(vehicleHistory)
    }

    setShowStatusForm(false)
  }

  // Update the handleUpdateServiceSettings function
  const handleUpdateServiceSettings = (vehicleId: string, serviceInterval: number, distanceInterval: number) => {
    // Update the vehicle
    const updatedVehicles = vehicles.map((vehicle) =>
      vehicle.id === vehicleId
        ? {
            ...vehicle,
            serviceInterval,
            distanceInterval,
            nextServiceDate: calculateNextServiceDate({
              ...vehicle,
              serviceInterval,
            }),
            lastUpdated: new Date().toISOString(),
          }
        : vehicle,
    )

    setVehicles(updatedVehicles)
    setFilteredVehicles(updatedVehicles)
    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))

    // Update selected vehicle if it's the one being modified
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      setSelectedVehicle({
        ...selectedVehicle,
        serviceInterval,
        distanceInterval,
        nextServiceDate: calculateNextServiceDate({
          ...selectedVehicle,
          serviceInterval,
        }),
        lastUpdated: new Date().toISOString(),
      })
    }

    // Check for vehicles due for service
    const dueVehicles = updatedVehicles.filter((v) => isServiceDue(v))
    setServiceDueVehicles(dueVehicles)
  }

  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return

    // Remove vehicle
    const updatedVehicles = vehicles.filter((vehicle) => vehicle.id !== selectedVehicle.id)
    setVehicles(updatedVehicles)
    setFilteredVehicles(updatedVehicles)
    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))

    // Remove associated repairs
    const updatedRepairs = allRepairs.filter((repair) => repair.vehicleId !== selectedVehicle.id)
    setAllRepairs(updatedRepairs)
    localStorage.setItem("vehicleRepairs", JSON.stringify(updatedRepairs))

    // Reset UI
    setSelectedVehicle(null)
    setShowVehicleDetails(false)
    setShowDeleteConfirmation(false)

    // Check for vehicles due for service
    const dueVehicles = updatedVehicles.filter((v) => isServiceDue(v))
    setServiceDueVehicles(dueVehicles)
  }

  const handleViewRepairDetails = (repair: RepairService) => {
    setSelectedRepair(repair)
    setEditingRepair(null)
  }

  const handleEditRepair = (repair: RepairService) => {
    setEditingRepair(repair)
    setSelectedRepair(null)
    setShowRepairForm(true)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      maintenance: "bg-orange-100 text-orange-800",
      repaired: "bg-blue-100 text-blue-800",
    }

    const statusClass = statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-800"

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  // Replace the getVehicleTypeBadge function to use the new distance unit
  const getVehicleTypeBadge = (type = "car") => {
    const typeClasses = {
      car: "bg-blue-100 text-blue-800",
      truck: "bg-green-100 text-green-800",
      suv: "bg-purple-100 text-purple-800",
      van: "bg-yellow-100 text-yellow-800",
      motorcycle: "bg-red-100 text-red-800",
    }

    const typeClass = typeClasses[type as keyof typeof typeClasses] || "bg-gray-100 text-gray-800"

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeClass}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  const getProfitLossBadge = (amount: number) => {
    const badgeClass = amount >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {amount >= 0 ? "Profit" : "Loss"}
      </span>
    )
  }

  const calculateTotalRepairCost = (vehicleId: string) => {
    const vehicleRepairs = allRepairs.filter((repair) => repair.vehicleId === vehicleId)
    return vehicleRepairs.reduce((total, repair) => total + repair.cost, 0)
  }

  const calculateProfitLoss = (vehicle: Vehicle) => {
    if (!vehicle.purchasePrice || !vehicle.marketValue) {
      return null
    }

    const totalRepairCost = calculateTotalRepairCost(vehicle.id)
    return vehicle.marketValue - (vehicle.purchasePrice + totalRepairCost)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">Ayal Tizazu's Garage</h1>
        <p className="text-xl text-center text-gray-600">Premium vehicle service and maintenance</p>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin Dashboard
          </button>
        </div>
      </div>

      {/* Service Due Notifications */}
      {serviceDueVehicles.length > 0 && !showVehicleDetails && !showVehicleForm && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800 mb-2">
                {serviceDueVehicles.length} {serviceDueVehicles.length === 1 ? "vehicle" : "vehicles"} due for service
              </h3>
              <div className="space-y-2">
                {serviceDueVehicles.slice(0, 3).map((vehicle) => (
                  <div key={vehicle.id} className="flex justify-between items-center">
                    <span className="text-sm text-red-700">
                      {vehicle.make} {vehicle.model} ({vehicle.year}) - Last service:{" "}
                      {formatDate(vehicle.lastServiceDate)}
                    </span>
                    <button
                      onClick={() => handleVehicleSelect(vehicle)}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                    >
                      View Details
                    </button>
                  </div>
                ))}
                {serviceDueVehicles.length > 3 && (
                  <p className="text-sm text-red-700">And {serviceDueVehicles.length - 3} more...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showVehicleDetails && selectedVehicle ? (
        <div className="mb-8">
          <button
            onClick={() => {
              setShowVehicleDetails(false)
              setActiveView("gallery")
            }}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {activeView === "repaired" ? "Repaired Vehicles" : "Gallery"}
          </button>

          {showStatusForm ? (
            <StatusUpdateForm
              vehicle={selectedVehicle}
              onUpdate={(vehicleId, newStatus, notes) => handleUpdateVehicleStatus(vehicleId, newStatus, notes)}
              onCancel={() => setShowStatusForm(false)}
            />
          ) : showVehicleForm && editingVehicle ? (
            <VehicleForm
              initialData={editingVehicle}
              onSubmit={handleAddVehicle}
              onCancel={() => {
                setShowVehicleForm(false)
                setEditingVehicle(null)
              }}
            />
          ) : showRepairForm ? (
            <RepairForm
              vehicle={selectedVehicle}
              initialData={editingRepair || undefined}
              onSubmit={handleAddRepair}
              onCancel={() => {
                setShowRepairForm(false)
                setEditingRepair(null)
              }}
            />
          ) : selectedRepair ? (
            <RepairDetails
              repair={selectedRepair}
              onClose={() => setSelectedRepair(null)}
              onEdit={() => handleEditRepair(selectedRepair)}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gray-100 p-6">
                  {selectedVehicle.image ? (
                    <img
                      src={selectedVehicle.image || "/placeholder.svg"}
                      alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="w-full h-auto rounded-lg mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                      <span className="text-4xl">🚗</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <button
                        onClick={() => handleEditVehicle(selectedVehicle)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Vehicle
                      </button>

                      <button
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="flex items-center text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Vehicle Information</h3>
                        <button
                          onClick={() => setShowStatusForm(true)}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Update Status
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Make:</span>
                          <span className="font-medium">{selectedVehicle.make}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium">{selectedVehicle.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Year:</span>
                          <span className="font-medium">{selectedVehicle.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                              {selectedVehicle.type?.charAt(0).toUpperCase() + (selectedVehicle.type?.slice(1) || "")}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(selectedVehicle.status)}`}
                            >
                              {selectedVehicle.status.charAt(0).toUpperCase() +
                                selectedVehicle.status.slice(1).replace("_", " ")}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">{formatDate(selectedVehicle.lastUpdated)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">VIN:</span>
                          <span className="font-medium">{selectedVehicle.vin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">License Plate:</span>
                          <span className="font-medium">{selectedVehicle.licensePlate || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Color:</span>
                          <span className="font-medium">{selectedVehicle.color || "N/A"}</span>
                        </div>
                        {/* Update the display of mileage to use the new formatDistance function */}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mileage:</span>
                          <span className="font-medium">{formatDistance(selectedVehicle.mileage)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedVehicle.notes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Notes</h3>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-sm text-gray-700">{selectedVehicle.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:w-2/3 p-6">
                  {/* Tabs */}
                  <div className="border-b mb-6">
                    <nav className="flex">
                      <button
                        className={`px-4 py-3 font-medium text-sm ${
                          activeTab === "details"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => {
                          setActiveTab("details")
                          setShowRepairForm(false)
                          setSelectedRepair(null)
                          setEditingRepair(null)
                        }}
                      >
                        Owner Details
                      </button>
                      <button
                        className={`px-4 py-3 font-medium text-sm ${
                          activeTab === "repairs"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => {
                          setActiveTab("repairs")
                          setShowRepairForm(false)
                          setSelectedRepair(null)
                          setEditingRepair(null)
                        }}
                      >
                        Repair History
                      </button>
                      <button
                        className={`px-4 py-3 font-medium text-sm ${
                          activeTab === "status"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => {
                          setActiveTab("status")
                          setShowRepairForm(false)
                          setSelectedRepair(null)
                          setEditingRepair(null)
                        }}
                      >
                        Status History
                      </button>
                      <button
                        className={`px-4 py-3 font-medium text-sm ${
                          activeTab === "service"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => {
                          setActiveTab("service")
                          setShowRepairForm(false)
                          setSelectedRepair(null)
                          setEditingRepair(null)
                        }}
                      >
                        Service Schedule
                      </button>
                      <button
                        className={`px-4 py-3 font-medium text-sm ${
                          activeTab === "financial"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => {
                          setActiveTab("financial")
                          setShowRepairForm(false)
                          setSelectedRepair(null)
                          setEditingRepair(null)
                        }}
                      >
                        Financial
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  {activeTab === "details" ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
                        {selectedVehicle.owner ? (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Name:</span>
                                <span className="font-medium">{selectedVehicle.owner.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{selectedVehicle.owner.email || "N/A"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-medium">{selectedVehicle.owner.phone || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">No owner information available</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Service Information</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Service Date:</span>
                            <span className="font-medium">{formatDate(selectedVehicle.lastServiceDate)}</span>
                          </div>
                          {selectedVehicle.nextServiceDate && (
                            <div className="flex justify-between mt-2">
                              <span className="text-gray-600">Next Service Date:</span>
                              <span className="font-medium">{formatDate(selectedVehicle.nextServiceDate)}</span>
                            </div>
                          )}
                          {isServiceDue(selectedVehicle) && (
                            <div className="mt-3 pt-3 border-t border-red-200">
                              <p className="text-sm text-red-600 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Service is due for this vehicle
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "repairs" ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Repair History</h3>
                        <button
                          onClick={() => {
                            setShowRepairForm(true)
                            setEditingRepair(null)
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add Repair
                        </button>
                      </div>

                      {repairs.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 rounded">
                          <p className="text-gray-500">No repair records found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {repairs
                            .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
                            .map((repair) => (
                              <div
                                key={repair.id}
                                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleViewRepairDetails(repair)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center mb-2">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(repair.status)} mr-2`}
                                      >
                                        {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
                                      </span>
                                      <span className="text-sm text-gray-500">{formatDate(repair.serviceDate)}</span>
                                    </div>
                                    <p className="font-medium mb-1">{repair.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-blue-600">ETB {repair.cost.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">{repair.technician}</p>
                                  </div>
                                </div>

                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>{repair.laborHours} hours</span>

                                  {repair.parts.length > 0 && (
                                    <span className="ml-4">
                                      {repair.parts.length} {repair.parts.length === 1 ? "part" : "parts"} used
                                    </span>
                                  )}

                                  {repair.images && repair.images.length > 0 && (
                                    <span className="ml-4">
                                      {repair.images.length} {repair.images.length === 1 ? "image" : "images"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ) : activeTab === "status" ? (
                    <StatusHistoryList history={statusHistory} />
                  ) : activeTab === "service" ? (
                    <ServiceNotifications
                      vehicle={selectedVehicle}
                      onUpdateServiceSettings={(serviceInterval, mileageInterval) =>
                        handleUpdateServiceSettings(selectedVehicle.id, serviceInterval, mileageInterval)
                      }
                    />
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Purchase Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Purchase Price:</span>
                              <span className="font-medium">{formatCurrency(selectedVehicle.purchasePrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current Market Value:</span>
                              <span className="font-medium">{formatCurrency(selectedVehicle.marketValue)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Repair Costs</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Repair Costs:</span>
                              <span className="font-medium">
                                {formatCurrency(calculateTotalRepairCost(selectedVehicle.id))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Number of Repairs:</span>
                              <span className="font-medium">{repairs.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Profit/Loss Analysis</h4>
                        {calculateProfitLoss(selectedVehicle) !== null ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Current Profit/Loss:</span>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`font-bold ${calculateProfitLoss(selectedVehicle)! >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {formatCurrency(calculateProfitLoss(selectedVehicle))}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    calculateProfitLoss(selectedVehicle)! >= 0
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {calculateProfitLoss(selectedVehicle)! >= 0 ? "Profit" : "Loss"}
                                </span>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h5 className="font-medium mb-2">Breakdown</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Market Value</span>
                                  <span>{formatCurrency(selectedVehicle.marketValue)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Purchase Price</span>
                                  <span className="text-red-600">
                                    - {formatCurrency(selectedVehicle.purchasePrice)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total Repair Costs</span>
                                  <span className="text-red-600">
                                    - {formatCurrency(calculateTotalRepairCost(selectedVehicle.id))}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-bold">
                                  <span>Net Profit/Loss</span>
                                  <span
                                    className={
                                      calculateProfitLoss(selectedVehicle)! >= 0 ? "text-green-600" : "text-red-600"
                                    }
                                  >
                                    {formatCurrency(calculateProfitLoss(selectedVehicle))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500">
                              Purchase price and/or market value not set. Please update vehicle information to see
                              profit/loss analysis.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirmation && selectedVehicle && (
            <DeleteConfirmationDialog
              vehicle={selectedVehicle}
              repairs={repairs}
              onConfirm={handleDeleteVehicle}
              onCancel={() => setShowDeleteConfirmation(false)}
            />
          )}
        </div>
      ) : (
        <>
          {/* Hero Section */}
          {!showVehicleForm && <HeroSection />}

          {/* Search and Add Vehicle */}
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles by make, model, VIN, or license plate..."
                  className="w-full p-3 pl-10 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="mt-2 md:mt-0 flex space-x-2">
                <button
                  onClick={() => {
                    setShowVehicleForm(true)
                    setSelectedVehicle(null)
                    setEditingVehicle(null)
                    setShowRepairForm(false)
                  }}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Vehicle
                </button>

                <div className="flex rounded-lg overflow-hidden border">
                  <button
                    className={`px-3 py-1 ${activeView === "gallery" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
                    onClick={() => setActiveView("gallery")}
                  >
                    All Vehicles
                  </button>
                  <button
                    className={`px-3 py-1 ${activeView === "repaired" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
                    onClick={() => setActiveView("repaired")}
                  >
                    Repaired
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {showVehicleForm ? (
            <VehicleForm
              onSubmit={handleAddVehicle}
              onCancel={() => {
                setShowVehicleForm(false)
                setEditingVehicle(null)
              }}
              initialData={editingVehicle || undefined}
            />
          ) : activeView === "repaired" ? (
            <RepairedVehiclesList
              vehicles={vehicles}
              repairs={allRepairs}
              onSelectVehicle={(vehicle) => {
                handleVehicleSelect(vehicle)
                setActiveView("repaired")
              }}
            />
          ) : (
            <>
              {/* Value Proposition */}
              <ValueProposition />

              {/* Services Section */}
              <ServicesSection />

              {/* Why Choose Us */}
              <WhyChooseUs />

              {/* Vehicle Gallery */}
              <VehicleGallery
                vehicles={filteredVehicles}
                onSelectVehicle={(vehicle) => {
                  handleVehicleSelect(vehicle)
                  setActiveView("gallery")
                }}
              />

              {/* Testimonials */}
              <Testimonials />

              {/* Call to Action */}
              <CallToAction />
            </>
          )}
        </>
      )}
    </div>
  )
}
