"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Car, Shield, Wrench, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import type { User, Customer } from "../../types" // Declare the User variable here

export default function MainLogin() {
  const [activeRole, setActiveRole] = useState<"admin" | "employee" | "customer">("customer")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Check for existing sessions on component mount
  useEffect(() => {
    // Check for admin session
    const adminToken = localStorage.getItem("adminRememberToken")
    if (adminToken) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find(
        (u: User) => u.rememberMeToken === adminToken && (u.role === "admin" || u.role === "manager"),
      )
      if (user && user.isActive) {
        localStorage.setItem("currentAdminUser", JSON.stringify(user))
        router.push("/admin")
        return
      }
    }

    // Check for employee session
    const employeeToken = localStorage.getItem("employeeRememberToken")
    if (employeeToken) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find(
        (u: User) => u.rememberMeToken === employeeToken && (u.role === "technician" || u.role === "employee"),
      )
      if (user && user.isActive) {
        localStorage.setItem("currentEmployee", JSON.stringify(user))
        router.push("/employee")
        return
      }
    }

    // Check for customer session
    const customerToken = localStorage.getItem("customerRememberToken")
    if (customerToken) {
      const customers = JSON.parse(localStorage.getItem("customers") || "[]")
      const customer = customers.find((c: Customer) => c.id === customerToken)
      if (customer && customer.isActive) {
        localStorage.setItem("currentCustomer", JSON.stringify(customer))
        router.push("/customer")
        return
      }
    }

    // Initialize demo data if not exists
    initializeDemoData()
  }, [router])

  const initializeDemoData = () => {
    // Initialize users if not exists
    if (!localStorage.getItem("users")) {
      const defaultUsers: User[] = [
        {
          id: "admin-1",
          name: "System Administrator",
          email: "admin@example.com",
          username: "admin",
          password: "admin123", // In a real app, this would be hashed
          role: "admin",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isActive: true,
        },
        {
          id: "tech-1",
          name: "John Technician",
          email: "john@example.com",
          username: "johnt",
          password: "tech123", // In a real app, this would be hashed
          role: "technician",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      ]
      localStorage.setItem("users", JSON.stringify(defaultUsers))
    }

    // Initialize customers if not exists
    if (!localStorage.getItem("customers")) {
      const defaultCustomers: Customer[] = [
        {
          id: "cust-1",
          name: "Jane Customer",
          email: "jane@example.com",
          phone: "555-123-4567",
          vehicles: [],
          createdAt: new Date().toISOString(),
          preferences: {
            notifications: true,
            emailUpdates: true,
            smsUpdates: false,
          },
          isActive: true,
        },
      ]
      localStorage.setItem("customers", JSON.stringify(defaultCustomers))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Input validation
      if (activeRole === "customer") {
        if (!email.trim()) {
          throw new Error("Email is required")
        }
        if (!password) {
          throw new Error("Password is required")
        }
      } else {
        if (!username.trim()) {
          throw new Error("Username is required")
        }
        if (!password) {
          throw new Error("Password is required")
        }
      }

      // Handle login based on role
      switch (activeRole) {
        case "admin":
          await handleAdminLogin()
          break
        case "employee":
          await handleEmployeeLogin()
          break
        case "customer":
          await handleCustomerLogin()
          break
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: User) => u.username === username && (u.role === "admin" || u.role === "manager"))

    if (!user) {
      throw new Error("Invalid username or password")
    }

    // Check if account is locked
    if (user.accountLocked && user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      throw new Error(`Account is locked until ${new Date(user.lockoutUntil).toLocaleString()}`)
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error("Account is inactive. Please contact administrator.")
    }

    // Verify password (in real app, this would be hashed comparison)
    if (user.password !== password) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1
      user.failedLoginAttempts = failedAttempts
      user.lastFailedLogin = new Date().toISOString()

      // Lock account if too many failed attempts
      if (failedAttempts >= 5) {
        user.accountLocked = true
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      }

      // Update user in localStorage
      const userIndex = users.findIndex((u: User) => u.id === user.id)
      users[userIndex] = user
      localStorage.setItem("users", JSON.stringify(users))

      throw new Error("Invalid username or password")
    }

    // Successful login
    user.lastLogin = new Date().toISOString()
    user.failedLoginAttempts = 0
    user.accountLocked = false
    user.lockoutUntil = undefined

    // Handle remember me
    if (rememberMe) {
      const token = `token_${Date.now()}_${Math.random()}`
      user.rememberMeToken = token
      localStorage.setItem("adminRememberToken", token)
    }

    // Update user in localStorage
    const userIndex = users.findIndex((u: User) => u.id === user.id)
    users[userIndex] = user
    localStorage.setItem("users", JSON.stringify(users))

    // Store current user and redirect
    localStorage.setItem("currentAdminUser", JSON.stringify(user))
    setSuccess("Login successful! Redirecting...")

    // Add a small delay for the success message to be visible
    setTimeout(() => {
      router.push("/admin")
    }, 500)
  }

  const handleEmployeeLogin = async () => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: User) => u.username === username && (u.role === "technician" || u.role === "employee"))

    if (!user) {
      throw new Error("Invalid username or password")
    }

    // Check if account is locked
    if (user.accountLocked && user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      throw new Error(`Account is locked until ${new Date(user.lockoutUntil).toLocaleString()}`)
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error("Account is inactive. Please contact your supervisor.")
    }

    // Verify password (in real app, this would be hashed comparison)
    if (user.password !== password) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1
      user.failedLoginAttempts = failedAttempts
      user.lastFailedLogin = new Date().toISOString()

      // Lock account if too many failed attempts
      if (failedAttempts >= 5) {
        user.accountLocked = true
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      }

      // Update user in localStorage
      const userIndex = users.findIndex((u: User) => u.id === user.id)
      users[userIndex] = user
      localStorage.setItem("users", JSON.stringify(users))

      throw new Error("Invalid username or password")
    }

    // Successful login
    user.lastLogin = new Date().toISOString()
    user.failedLoginAttempts = 0
    user.accountLocked = false
    user.lockoutUntil = undefined

    // Handle remember me
    if (rememberMe) {
      const token = `token_${Date.now()}_${Math.random()}`
      user.rememberMeToken = token
      localStorage.setItem("employeeRememberToken", token)
    }

    // Update user in localStorage
    const userIndex = users.findIndex((u: User) => u.id === user.id)
    users[userIndex] = user
    localStorage.setItem("users", JSON.stringify(users))

    // Store current user and redirect
    localStorage.setItem("currentEmployee", JSON.stringify(user))
    setSuccess("Login successful! Redirecting...")

    // Add a small delay for the success message to be visible
    setTimeout(() => {
      router.push("/employee")
    }, 500)
  }

  const handleCustomerLogin = async () => {
    // Get customers from localStorage
    const customers = JSON.parse(localStorage.getItem("customers") || "[]")
    const customer = customers.find((c: Customer) => c.email === email)

    if (!customer) {
      throw new Error("Invalid email or password")
    }

    // Check if account is locked
    if (customer.accountLocked && customer.lockoutUntil && new Date(customer.lockoutUntil) > new Date()) {
      throw new Error(`Account is locked until ${new Date(customer.lockoutUntil).toLocaleString()}`)
    }

    // Check if account is active
    if (!customer.isActive) {
      throw new Error("Account is inactive. Please contact support.")
    }

    // For demo purposes, we'll use a simple password check
    // In production, you'd hash the password and compare
    const storedPassword = customer.id // Using ID as password for demo

    if (password !== storedPassword) {
      // Increment failed attempts
      const failedAttempts = (customer.failedLoginAttempts || 0) + 1
      customer.failedLoginAttempts = failedAttempts

      // Lock account if too many failed attempts
      if (failedAttempts >= 5) {
        customer.accountLocked = true
        customer.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }

      // Update customer in localStorage
      const customerIndex = customers.findIndex((c: Customer) => c.id === customer.id)
      customers[customerIndex] = customer
      localStorage.setItem("customers", JSON.stringify(customers))

      throw new Error("Invalid email or password")
    }

    // Successful login
    customer.lastLogin = new Date().toISOString()
    customer.failedLoginAttempts = 0
    customer.accountLocked = false
    customer.lockoutUntil = undefined

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem("customerRememberToken", customer.id)
    }

    // Update customer in localStorage
    const customerIndex = customers.findIndex((c: Customer) => c.id === customer.id)
    customers[customerIndex] = customer
    localStorage.setItem("customers", JSON.stringify(customers))

    // Store current customer and redirect
    localStorage.setItem("currentCustomer", JSON.stringify(customer))
    setSuccess("Login successful! Redirecting...")

    // Add a small delay for the success message to be visible
    setTimeout(() => {
      router.push("/customer")
    }, 500)
  }

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Wrench className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Repair System</h1>
          <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600 mb-4">Demo Accounts:</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Admin: admin / password</div>
                    <div className="text-gray-600">Full system access</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Car className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Employee: employee / password</div>
                    <div className="text-gray-600">Repair management access</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <Shield className="h-4 w-4 text-yellow-600" /> {/* Replaced User with Shield */}
                  <div>
                    <div className="font-medium">Customer: jane@example.com / cust-1</div>
                    <div className="text-gray-600">Customer portal access</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
