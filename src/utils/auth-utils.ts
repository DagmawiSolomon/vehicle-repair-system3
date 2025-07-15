import type { User } from "../types"

// Demo users for authentication
const demoUsers: User[] = [
  {
    id: "admin-1",
    name: "System Administrator",
    email: "admin@vehiclerepair.com",
    username: "admin",
    password: "admin123", // In production, this would be hashed
    role: "admin",
    permissions: [
      "vehicles.create",
      "vehicles.read",
      "vehicles.update",
      "vehicles.delete",
      "repairs.create",
      "repairs.read",
      "repairs.update",
      "repairs.delete",
      "users.manage",
      "settings.manage",
      "reports.view",
      "inventory.manage",
      "time.manage",
    ],
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "emp-1",
    name: "John Technician",
    email: "john@vehiclerepair.com",
    username: "employee",
    password: "emp123", // In production, this would be hashed
    role: "employee",
    permissions: [
      "vehicles.read",
      "vehicles.create",
      "vehicles.update",
      "repairs.create",
      "repairs.read",
      "repairs.update",
      "inventory.read",
      "time.clockin",
      "users.read", // Allow reading user information
      "users.manage", // Allow user management for senior employees
    ],
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isActive: true,
  },
]

export interface AuthSession {
  user: User
  token: string
  expiresAt: string
  rememberMe: boolean
}

// Initialize demo data in localStorage
export const initializeDemoData = (): void => {
  try {
    if (typeof window === "undefined") return // SSR check

    if (!localStorage.getItem("users")) {
      localStorage.setItem("users", JSON.stringify(demoUsers))
      console.log("Demo users initialized")
    }

    // Initialize other demo data if needed
    if (!localStorage.getItem("vehicles")) {
      const sampleVehicles = [
        {
          id: "vehicle-1",
          make: "Toyota",
          model: "Camry",
          year: 2020,
          vin: "1HGBH41JXMN109186",
          licensePlate: "ABC123",
          color: "Silver",
          mileage: 45000,
          status: "active",
          owner: "John Doe",
          ownerContact: "555-0123",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem("vehicles", JSON.stringify(sampleVehicles))
      console.log("Sample vehicles initialized")
    }

    if (!localStorage.getItem("repairs")) {
      localStorage.setItem("repairs", JSON.stringify([]))
      console.log("Repairs storage initialized")
    }
  } catch (error) {
    console.error("Error initializing demo data:", error)
  }
}

// Authenticate user with username, password and role
export const authenticateUser = (username: string, password: string, expectedRole: string): User | null => {
  try {
    console.log("Authenticating user:", { username, expectedRole })

    if (typeof window === "undefined") {
      console.error("Authentication attempted on server side")
      return null
    }

    // Get users from localStorage or use demo users
    let users = demoUsers
    try {
      const storedUsers = localStorage.getItem("users")
      if (storedUsers) {
        users = JSON.parse(storedUsers)
        console.log("Loaded users from localStorage:", users.length)
      }
    } catch (error) {
      console.error("Error loading users from localStorage:", error)
      // Fall back to demo users
    }

    // Find user by username
    const user = users.find((u: User) => u.username === username && u.isActive)

    if (!user) {
      console.error("User not found:", username)
      return null
    }

    console.log("User found:", { id: user.id, role: user.role })

    // Check password (in production, use proper password hashing)
    if (user.password !== password) {
      console.error("Invalid password for user:", username)
      return null
    }

    // Check role matches expected role
    if (user.role !== expectedRole) {
      console.error("Role mismatch:", { userRole: user.role, expectedRole })
      return null
    }

    // Update last login
    user.lastLogin = new Date().toISOString()

    // Update user in storage
    try {
      const userIndex = users.findIndex((u: User) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = user
        localStorage.setItem("users", JSON.stringify(users))
        console.log("User last login updated")
      }
    } catch (error) {
      console.error("Error updating user last login:", error)
    }

    console.log("Authentication successful for:", user.username)
    return user
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

// Set current user session
export const setCurrentUser = (user: User, rememberMe = false): void => {
  try {
    if (typeof window === "undefined") return

    console.log("Setting current user session:", { userId: user.id, role: user.role, rememberMe })

    const session: AuthSession = {
      user,
      token: generateToken(),
      expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
      rememberMe,
    }

    localStorage.setItem("authSession", JSON.stringify(session))

    // Set role-specific storage for backward compatibility
    if (user.role === "admin") {
      localStorage.setItem("currentAdminUser", JSON.stringify(user))
      console.log("Admin user session set")
    } else if (user.role === "employee") {
      localStorage.setItem("currentEmployee", JSON.stringify(user))
      console.log("Employee user session set")
    }

    console.log("Session created successfully")
  } catch (error) {
    console.error("Error setting current user:", error)
  }
}

// Get current authenticated user
export const getCurrentUser = (): User | null => {
  try {
    if (typeof window === "undefined") return null

    const sessionData = localStorage.getItem("authSession")
    if (!sessionData) {
      console.log("No auth session found")
      return null
    }

    const session: AuthSession = JSON.parse(sessionData)

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      console.log("Session expired")
      logout()
      return null
    }

    console.log("Current user retrieved:", { userId: session.user.id, role: session.user.role })
    return session.user
  } catch (error) {
    console.error("Error getting current user:", error)
    // Clear corrupted session data
    try {
      localStorage.removeItem("authSession")
    } catch (clearError) {
      console.error("Error clearing corrupted session:", clearError)
    }
    return null
  }
}

// Check if user has specific permission
export const hasPermission = (permission: string): boolean => {
  try {
    const user = getCurrentUser()
    const hasAccess = user?.permissions?.includes(permission) || false
    console.log("Permission check:", { permission, hasAccess, userId: user?.id })
    return hasAccess
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

// Check if user is admin
export const isAdmin = (): boolean => {
  try {
    const user = getCurrentUser()
    return user?.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Check if user is employee
export const isEmployee = (): boolean => {
  try {
    const user = getCurrentUser()
    return user?.role === "employee"
  } catch (error) {
    console.error("Error checking employee status:", error)
    return false
  }
}

// Check if user can access specific route
export const canAccessRoute = (route: string): boolean => {
  try {
    const user = getCurrentUser()
    if (!user) {
      console.log("No user found for route access check")
      return false
    }

    console.log("Route access check:", { route, userRole: user.role })

    if (route.startsWith("/admin")) {
      return user.role === "admin"
    }

    if (route.startsWith("/employee")) {
      return user.role === "employee" || user.role === "admin"
    }

    return true
  } catch (error) {
    console.error("Error checking route access:", error)
    return false
  }
}

// Logout user
export const logout = (): void => {
  try {
    if (typeof window === "undefined") return

    console.log("Logging out user")
    localStorage.removeItem("authSession")
    localStorage.removeItem("currentAdminUser")
    localStorage.removeItem("currentEmployee")
    localStorage.removeItem("adminRememberToken")
    localStorage.removeItem("employeeRememberToken")
    console.log("Logout completed")
  } catch (error) {
    console.error("Error during logout:", error)
  }
}

// Generate authentication token
const generateToken = (): string => {
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Validate session and refresh if needed
export const validateSession = (): boolean => {
  try {
    if (typeof window === "undefined") return false

    const sessionData = localStorage.getItem("authSession")
    if (!sessionData) {
      console.log("No session to validate")
      return false
    }

    const session: AuthSession = JSON.parse(sessionData)

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      console.log("Session validation failed - expired")
      logout()
      return false
    }

    // Refresh session if remember me is enabled
    if (session.rememberMe) {
      session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      localStorage.setItem("authSession", JSON.stringify(session))
      console.log("Session refreshed")
    }

    console.log("Session validation successful")
    return true
  } catch (error) {
    console.error("Error validating session:", error)
    logout()
    return false
  }
}

// Get user by ID
export const getUserById = (id: string): User | null => {
  try {
    if (typeof window === "undefined") return null

    const storedUsers = localStorage.getItem("users")
    const users = storedUsers ? JSON.parse(storedUsers) : demoUsers
    return users.find((u: User) => u.id === id) || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Update user
export const updateUser = (updatedUser: User): boolean => {
  try {
    if (typeof window === "undefined") return false

    const storedUsers = localStorage.getItem("users")
    const users = storedUsers ? JSON.parse(storedUsers) : demoUsers

    const userIndex = users.findIndex((u: User) => u.id === updatedUser.id)
    if (userIndex === -1) {
      console.error("User not found for update:", updatedUser.id)
      return false
    }

    users[userIndex] = updatedUser
    localStorage.setItem("users", JSON.stringify(users))

    // Update current session if it's the same user
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === updatedUser.id) {
      const sessionData = localStorage.getItem("authSession")
      if (sessionData) {
        const session: AuthSession = JSON.parse(sessionData)
        session.user = updatedUser
        localStorage.setItem("authSession", JSON.stringify(session))
      }
    }

    console.log("User updated successfully:", updatedUser.id)
    return true
  } catch (error) {
    console.error("Error updating user:", error)
    return false
  }
}
