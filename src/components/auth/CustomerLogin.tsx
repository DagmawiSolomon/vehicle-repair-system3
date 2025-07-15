"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Car,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  User,
  Phone,
  UserPlus,
  Calendar,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  hashPassword,
  validatePassword,
  logLoginAttempt,
  isAccountLocked,
  shouldLockAccount,
  calculateLockoutTime,
  generateRememberMeToken,
  setRememberMeToken,
  validateRememberMeToken,
} from "../../utils/auth-utils"
import type { Customer } from "../../types"

interface CustomerLoginProps {
  onLogin: (customer: Customer) => void
}

export default function CustomerLogin({ onLogin }: CustomerLoginProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot" | "reset">("login")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    confirmPassword: "",
    resetToken: "",
    newPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Check for remember me token on component mount
  useEffect(() => {
    const token = localStorage.getItem("customerRememberToken")
    if (token) {
      const customerId = validateRememberMeToken(token)
      if (customerId) {
        const customers = JSON.parse(localStorage.getItem("customers") || "[]")
        const customer = customers.find((c: Customer) => c.id === customerId)
        if (customer && customer.isActive) {
          onLogin(customer)
          return
        }
      }
      localStorage.removeItem("customerRememberToken")
    }
  }, [onLogin])

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
      if (!formData.email.trim()) {
        throw new Error("Email is required")
      }
      if (!formData.password) {
        throw new Error("Password is required")
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }

      // Get customers from localStorage
      const customers = JSON.parse(localStorage.getItem("customers") || "[]")
      const customer = customers.find((c: Customer) => c.email === formData.email)

      if (!customer) {
        logLoginAttempt(formData.email, false, "Customer not found")
        throw new Error("Invalid email or password")
      }

      // Check if account is locked
      if (isAccountLocked(customer)) {
        logLoginAttempt(formData.email, false, "Account locked")
        throw new Error(`Account is locked until ${new Date(customer.lockoutUntil!).toLocaleString()}`)
      }

      // Check if account is active
      if (!customer.isActive) {
        logLoginAttempt(formData.email, false, "Account inactive")
        throw new Error("Account is inactive. Please contact support.")
      }

      // For demo purposes, we'll use a simple password check
      // In production, you'd hash the password and compare
      const hashedPassword = hashPassword(formData.password)
      const storedPassword = customer.id // Using ID as password for demo

      if (hashedPassword !== hashPassword(storedPassword)) {
        // Increment failed attempts
        const failedAttempts = (customer.failedLoginAttempts || 0) + 1
        customer.failedLoginAttempts = failedAttempts

        // Lock account if too many failed attempts
        if (shouldLockAccount(failedAttempts)) {
          customer.accountLocked = true
          customer.lockoutUntil = calculateLockoutTime(15) // 15 minutes for customers
        }

        // Update customer in localStorage
        const customerIndex = customers.findIndex((c: Customer) => c.id === customer.id)
        customers[customerIndex] = customer
        localStorage.setItem("customers", JSON.stringify(customers))

        logLoginAttempt(formData.email, false, "Invalid password")
        throw new Error("Invalid email or password")
      }

      // Successful login
      customer.lastLogin = new Date().toISOString()
      customer.failedLoginAttempts = 0
      customer.accountLocked = false
      customer.lockoutUntil = undefined

      // Handle remember me
      if (rememberMe) {
        const token = generateRememberMeToken()
        setRememberMeToken(customer.id, token)
        localStorage.setItem("customerRememberToken", token)
      }

      // Update customer in localStorage
      const customerIndex = customers.findIndex((c: Customer) => c.id === customer.id)
      customers[customerIndex] = customer
      localStorage.setItem("customers", JSON.stringify(customers))

      logLoginAttempt(formData.email, true)
      onLogin(customer)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Input validation
      if (!formData.name.trim()) {
        throw new Error("Name is required")
      }
      if (!formData.email.trim()) {
        throw new Error("Email is required")
      }
      if (!formData.password) {
        throw new Error("Password is required")
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }
      if (!acceptTerms) {
        throw new Error("Please accept the terms and conditions")
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }

      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0])
      }

      // Check if email already exists
      const customers = JSON.parse(localStorage.getItem("customers") || "[]")
      if (customers.some((c: Customer) => c.email === formData.email)) {
        throw new Error("An account with this email already exists")
      }

      // Create new customer
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        vehicles: [],
        createdAt: new Date().toISOString(),
        preferences: {
          notifications: true,
          emailUpdates: true,
          smsUpdates: false,
        },
        isActive: true,
      }

      customers.push(newCustomer)
      localStorage.setItem("customers", JSON.stringify(customers))

      setSuccess("Account created successfully! You can now log in.")
      setActiveTab("login")
      setFormData((prev) => ({
        ...prev,
        name: "",
        phone: "",
        address: "",
        confirmPassword: "",
        password: "",
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!formData.email.trim()) {
        throw new Error("Email is required")
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }

      // Check if customer exists
      const customers = JSON.parse(localStorage.getItem("customers") || "[]")
      const customer = customers.find((c: Customer) => c.email === formData.email)

      if (!customer) {
        throw new Error("No account found with this email address")
      }

      // Simulate sending reset email
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setResetSent(true)
      setSuccess("Password reset instructions have been sent to your email.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-3 bg-blue-600 rounded-full w-fit">
              <Car className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Customer Portal</CardTitle>
            <CardDescription className="text-gray-600">
              {activeTab === "login" && "Access your vehicle service account"}
              {activeTab === "register" && "Create your customer account"}
              {activeTab === "forgot" && "Reset your account password"}
              {activeTab === "reset" && "Create a new secure password"}
            </CardDescription>
          </CardHeader>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mx-6">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "login" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("login")
                setError("")
                setSuccess("")
                setResetSent(false)
              }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("register")
                setError("")
                setSuccess("")
                setResetSent(false)
              }}
            >
              Register
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "forgot"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("forgot")
                setError("")
                setSuccess("")
                setResetSent(false)
              }}
            >
              Reset
            </button>
          </div>

          <CardContent className="p-6">
            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me for 30 days
                  </label>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Sign In
                    </div>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  Demo: Use any email with customer ID as password
                </div>
              </form>
            )}

            {/* Registration Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10"
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-10"
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Create a password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  Password must be at least 8 characters and include uppercase, lowercase, number, and special
                  character.
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </div>
                  )}
                </Button>
              </form>
            )}

            {/* Forgot Password Form */}
            {activeTab === "forgot" && !resetSent && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Enter your email address and we'll send you instructions to reset your password.
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email address"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>
              </form>
            )}

            {/* Reset Sent Confirmation */}
            {activeTab === "forgot" && resetSent && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Check Your Email</h3>
                <p className="text-gray-600 mb-6">We've sent password reset instructions to your email address.</p>
                <Button onClick={() => setActiveTab("reset")} variant="outline" className="mr-2">
                  I Have a Reset Code
                </Button>
                <Button onClick={() => setActiveTab("login")} className="bg-blue-600 hover:bg-blue-700">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-blue-50 text-center text-sm text-gray-600">
            <div className="w-full">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Service History
                </div>
                <div className="flex items-center">
                  <Wrench className="h-4 w-4 mr-1" />
                  Repair Status
                </div>
              </div>
              <div>Manage your vehicles and service appointments</div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
