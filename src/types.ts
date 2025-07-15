export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin: string
  color?: string
  mileage: number
  status: "active" | "inactive" | "maintenance" | "in_repair" | "repaired" | "ready_for_pickup"
  lastServiceDate?: string
  lastServiceMileage?: number
  createdAt: string
  updatedAt?: string
  images?: RepairImage[]
  owner?: {
    name: string
    email?: string
    phone?: string
  }
  type?: "car" | "truck" | "suv" | "van" | "motorcycle"
  notes?: string
}

export interface RepairService {
  id: string
  vehicleId: string
  description: string
  serviceDate: string
  technician: string
  laborHours: number
  cost: number
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority?: "low" | "medium" | "high" | "urgent"
  parts?: string[]
  notes?: string
  receiptImage?: string
  createdAt: string
  updatedAt?: string
  assignedTo?: string
  estimatedCompletionDate?: string
  customerConcerns?: string
  workPerformed?: string
  recommendations?: string
  images?: RepairImage[]
  statusHistory?: StatusHistoryEntry[]
}

export interface RepairImage {
  id: string
  type: "receipt" | "before" | "after" | "part"
  description: string
  url: string
  filename: string
  size: number
  uploadedAt: string
}

export interface StatusHistoryEntry {
  id: string
  status: RepairService["status"]
  timestamp: string
  updatedBy: string
  notes?: string
}

export interface User {
  id: string
  name: string
  email: string
  username: string
  password: string
  role: "admin" | "manager" | "technician" | "employee"
  lastLogin?: string
  createdAt: string
  isActive: boolean
  failedLoginAttempts?: number
  accountLocked?: boolean
  lockoutUntil?: string
  rememberMeToken?: string
  profileImage?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  vehicles: string[]
  createdAt: string
  preferences: {
    notifications: boolean
    emailUpdates: boolean
    smsUpdates: boolean
  }
  isActive: boolean
  lastLogin?: string
  failedLoginAttempts?: number
  accountLocked?: boolean
  lockoutUntil?: string
}

export interface Part {
  id: string
  name: string
  category: string
  sku: string
  price: number
  stockQuantity: number
  reorderLevel: number
  location: string
  description?: string
  manufacturer?: string
  lastRestocked: string
  usageCount: number
  images?: RepairImage[]
}

export interface ActivityLog {
  id: string
  timestamp: string
  action: string
  category: string
  description: string
  user: string
  ipAddress: string
}

export interface LoginAttempt {
  id: string
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  timestamp: string
  failureReason?: string
}

export interface WorkOrder {
  id: string
  workOrderNumber: string
  vehicleId: string
  assignedTechnician: string
  description: string
  priority: "low" | "normal" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "cancelled"
  scheduledDate?: string
  completedDate?: string
  estimatedHours: number
  actualHours?: number
  parts: string[]
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface TimeEntry {
  id: string
  userId: string
  clockInTime: string
  clockOutTime: string | null
  notes: string
}

export interface StatusHistory {
  id: string
  vehicleId: string
  oldStatus: Vehicle["status"]
  newStatus: Vehicle["status"]
  timestamp: string
  updatedBy: string
  notes?: string
}
