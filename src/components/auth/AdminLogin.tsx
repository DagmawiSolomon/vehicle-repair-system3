"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Shield,
  Lock,
  UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Settings,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import type { User } from "../../types"

interface AdminLoginProps {
  onLogin: (user: User) => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [activeTab, setActiveTab] = useState<"login" | "forgot" | "reset">("login")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    resetToken: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resetSent, setResetSent] = useState(false)

  // Check for remember me token on component mount
  useEffect(() => {
    const token = localStorage.getItem("adminRememberToken")
    if (token) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find((u: User) => u.rememberMeToken === token && (u.role === "admin" || u.role === "manager"))
      if (user && user.isActive) {
        onLogin(user)
        return
      }
      localStorage.removeItem("adminRememberToken")
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
      if (!formData.username.trim()) {
        throw new Error("Username is required")
      }
      if (!formData.password) {
        throw new Error("Password is required")
      }

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find(
        (u: User) => u.username === formData.username && (u.role === "admin" || u.role === "manager"),
      )

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
      if (user.password !== formData.password) {
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

      onLogin(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!formData.resetToken.trim()) {
        throw new Error("Reset token is required")
      }

      if (!formData.newPassword) {
        throw new Error("New password is required")
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (formData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }

      // Simulate password reset
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess("Password has been reset successfully. You can now log in with your new password.")
      setActiveTab("login")
      setFormData((prev) => ({ ...prev, resetToken: "", newPassword: "", confirmPassword: "" }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-3 bg-blue-600 rounded-full w-fit">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Administrator Access</CardTitle>
            <CardDescription className="text-gray-600">
              {activeTab === "login" && "Secure access to system administration"}
              {activeTab === "forgot" && "Reset your administrator password"}
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
              Reset Password
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
                  <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="pl-10"
                      placeholder="Enter your username"
                      autoComplete="username"
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
                      Authenticating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Sign In
                    </div>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">Demo credentials: admin / admin123</div>
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
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
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

            {/* Password Reset Form */}
            {activeTab === "reset" && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="resetToken" className="text-sm font-medium text-gray-700">
                    Reset Code
                  </label>
                  <Input
                    id="resetToken"
                    type="text"
                    value={formData.resetToken}
                    onChange={(e) => handleInputChange("resetToken", e.target.value)}
                    placeholder="Enter the code from your email"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter new password"
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
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  Password must be at least 8 characters and include uppercase, lowercase, number, and special
                  character.
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Resetting...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="bg-gray-50 text-center text-sm text-gray-600">
            <div className="w-full">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-1" />
                  System Admin
                </div>
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </div>
              </div>
              <div>Secure access to administrative functions</div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
