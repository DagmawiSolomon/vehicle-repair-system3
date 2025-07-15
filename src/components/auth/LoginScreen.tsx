"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Shield, Wrench, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { authenticateUser, setCurrentUser, getCurrentUser } from "@/src/utils/auth-utils"

export default function LoginScreen() {
  const [activeRole, setActiveRole] = useState<"admin" | "employee">("employee")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Check for existing authentication on mount
  useEffect(() => {
    try {
      const currentUser = getCurrentUser()
      if (currentUser) {
        redirectToRoleDashboard(currentUser.role)
      }
    } catch (error) {
      console.error("Error checking existing auth:", error)
      // Clear any corrupted auth data
      localStorage.removeItem("authSession")
      localStorage.removeItem("currentAdminUser")
      localStorage.removeItem("currentEmployee")
    }
  }, [])

  const redirectToRoleDashboard = (role: string) => {
    try {
      if (role === "admin") {
        router.push("/admin")
      } else if (role === "employee") {
        router.push("/employee")
      }
    } catch (error) {
      console.error("Error redirecting to dashboard:", error)
      setError("Navigation error occurred")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Input validation
      if (!username.trim()) {
        throw new Error("Username is required")
      }
      if (!password) {
        throw new Error("Password is required")
      }

      console.log("Attempting login for:", { username, role: activeRole })

      // Authenticate user
      const user = authenticateUser(username, password, activeRole)

      if (!user) {
        throw new Error("Invalid username or password")
      }

      console.log("Authentication successful:", { userId: user.id, role: user.role })

      // Check if user role matches selected tab
      if (user.role !== activeRole) {
        throw new Error(`This account does not have ${activeRole} privileges`)
      }

      // Set user session
      setCurrentUser(user, rememberMe)
      console.log("Session created successfully")

      setSuccess("Login successful! Redirecting...")

      // Redirect after short delay
      setTimeout(() => {
        redirectToRoleDashboard(user.role)
      }, 1000)
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (role: "admin" | "employee") => {
    if (role === "admin") {
      setUsername("admin")
      setPassword("admin123")
    } else {
      setUsername("employee")
      setPassword("emp123")
    }
    setActiveRole(role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Wrench className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Repair System</h1>
          <p className="text-gray-600">Secure access to your dashboard</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Choose your role and enter your credentials</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as "admin" | "employee")}>
              {/* Role Selection Tabs */}
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="employee"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Employee
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* Employee Login */}
              <TabsContent value="employee">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
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
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Wrench className="mr-2 h-4 w-4" />
                        Sign In as Employee
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fillDemoCredentials("employee")}
                    disabled={isLoading}
                  >
                    Use Demo Employee Account
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Login */}
              <TabsContent value="admin">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter admin username"
                      autoComplete="username"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admin-remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="admin-remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Sign In as Admin
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fillDemoCredentials("admin")}
                    disabled={isLoading}
                  >
                    Use Demo Admin Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Credentials Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">Demo Credentials</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="font-medium">Employee:</span>
                    <span className="text-gray-600">employee / emp123</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="font-medium">Admin:</span>
                    <span className="text-gray-600">admin / admin123</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Vehicle Repair Management System</p>
          <p className="mt-1">Secure • Reliable • Efficient</p>
        </div>
      </div>
    </div>
  )
}
