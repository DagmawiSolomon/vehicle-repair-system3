import type { Vehicle, StatusHistory } from "../types"

/**
 * Adds a status change to the status history
 */
export const addStatusHistory = (
  vehicleId: string,
  previousStatus: string,
  newStatus: string,
  notes?: string,
  associatedRepairId?: string,
): StatusHistory => {
  const statusHistory: StatusHistory = {
    id: `status-${Date.now()}`,
    vehicleId,
    previousStatus,
    newStatus,
    timestamp: new Date().toISOString(),
    notes,
    associatedRepairId,
  }

  // Get existing history
  const existingHistory = getStatusHistory()

  // Add new entry
  const updatedHistory = [...existingHistory, statusHistory]

  // Save to localStorage
  localStorage.setItem("statusHistory", JSON.stringify(updatedHistory))

  return statusHistory
}

/**
 * Gets all status history entries
 */
export const getStatusHistory = (): StatusHistory[] => {
  const storedHistory = localStorage.getItem("statusHistory")
  if (storedHistory) {
    try {
      return JSON.parse(storedHistory)
    } catch (error) {
      console.error("Error parsing status history:", error)
      return []
    }
  }
  return []
}

/**
 * Gets status history for a specific vehicle
 */
export const getVehicleStatusHistory = (vehicleId: string): StatusHistory[] => {
  const allHistory = getStatusHistory()
  return allHistory
    .filter((entry) => entry.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * Checks if a vehicle is due for service
 */
export const isServiceDue = (vehicle: Vehicle): boolean => {
  try {
    if (!vehicle.lastServiceDate) {
      return true // No service history, service is due
    }

    const lastService = new Date(vehicle.lastServiceDate)
    const now = new Date()
    const daysSinceService = Math.floor((now.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24))

    // Service is due if it's been more than 90 days or 5000 km
    const serviceDueDays = daysSinceService > 90
    const serviceDueKm = vehicle.mileage - (vehicle.lastServiceMileage || 0) > 5000

    return serviceDueDays || serviceDueKm
  } catch (error) {
    console.error("Error checking service due:", error)
    return false
  }
}

/**
 * Calculates the next service date
 */
export const calculateNextServiceDate = (vehicle: Vehicle): string | null => {
  if (!vehicle.lastServiceDate) return null

  const lastService = new Date(vehicle.lastServiceDate)
  const nextServiceDate = new Date(lastService)
  nextServiceDate.setDate(nextServiceDate.getDate() + 90) // 90 days from last service

  return nextServiceDate.toISOString().split("T")[0]
}

/**
 * Gets a human-readable status name
 */
export const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    maintenance: "In Maintenance",
    repaired: "Repaired",
    ready_for_pickup: "Ready for Pickup",
    in_repair: "In Repair",
  }

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

/**
 * Gets the color class for a status
 */
export const getStatusColorClass = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    maintenance: "bg-yellow-500",
    repaired: "bg-blue-500",
    ready_for_pickup: "bg-purple-500",
    in_repair: "bg-orange-500",
  }

  return colorMap[status] || "bg-gray-500"
}

/**
 * Gets the badge classes for a status
 */
export const getStatusBadgeClasses = (status: string): string => {
  const classMap: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    repaired: "bg-blue-100 text-blue-800",
    ready_for_pickup: "bg-purple-100 text-purple-800",
    in_repair: "bg-orange-100 text-orange-800",
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return classMap[status] || "bg-gray-100 text-gray-800"
}

/**
 * Estimates distance until next service
 */
export const estimateDistanceUntilService = (vehicle: Vehicle): number | null => {
  if (!vehicle.distanceInterval || !vehicle.lastServiceDate) return null

  // Calculate estimated distance traveled since last service
  const today = new Date()
  const lastService = new Date(vehicle.lastServiceDate)
  const daysSinceService = Math.floor((today.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24))

  // Estimate daily distance (this is a simplification)
  const estimatedDailyDistance = vehicle.distanceInterval / 90 // Assuming service every 90 days

  // Calculate estimated distance traveled since last service
  const estimatedDistanceTraveled = daysSinceService * estimatedDailyDistance

  // Calculate remaining distance until next service
  const remainingDistance = vehicle.distanceInterval - estimatedDistanceTraveled

  return Math.max(0, Math.round(remainingDistance))
}

/**
 * Gets service due information
 */
export const getServiceDueInfo = (
  vehicle: Vehicle,
): { isDue: boolean; daysUntilDue: number | null; distanceUntilDue: number | null } => {
  const isDue = isServiceDue(vehicle)
  let daysUntilDue: number | null = null
  let distanceUntilDue: number | null = null

  // Calculate days until due
  if (vehicle.lastServiceDate) {
    const lastService = new Date(vehicle.lastServiceDate)
    const nextService = new Date(lastService)
    nextService.setDate(nextService.getDate() + 90) // 90 days from last service

    const today = new Date()
    const diffTime = nextService.getTime() - today.getTime()
    daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calculate distance until due
  distanceUntilDue = estimateDistanceUntilService(vehicle)

  return { isDue, daysUntilDue, distanceUntilDue }
}

/**
 * Formats a timestamp to include time
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
}

/**
 * Formats a date string to a readable format
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString()
}

/**
 * Gets the next service date
 */
export const getNextServiceDate = (vehicle: Vehicle): Date | null => {
  try {
    if (!vehicle.lastServiceDate) {
      return new Date() // Service due now if no history
    }

    const lastService = new Date(vehicle.lastServiceDate)
    const nextService = new Date(lastService)
    nextService.setDate(nextService.getDate() + 90) // 90 days from last service

    return nextService
  } catch (error) {
    console.error("Error calculating next service date:", error)
    return null
  }
}

/**
 * Gets the service status
 */
export const getServiceStatus = (vehicle: Vehicle): "due" | "upcoming" | "current" => {
  try {
    if (isServiceDue(vehicle)) {
      return "due"
    }

    const nextService = getNextServiceDate(vehicle)
    if (!nextService) {
      return "due"
    }

    const now = new Date()
    const daysUntilService = Math.floor((nextService.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilService <= 14) {
      return "upcoming"
    }

    return "current"
  } catch (error) {
    console.error("Error getting service status:", error)
    return "current"
  }
}
