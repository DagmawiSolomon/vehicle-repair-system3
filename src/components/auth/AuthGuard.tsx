"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser, canAccessRoute, validateSession } from "@/src/utils/auth-utils"
import { Loader2, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "employee" | "any"
  requiredPermissions?: string[]
}

export default function AuthGuard({ children, requiredRole = "any", requiredPermissions = [] }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("AuthGuard: Checking authentication for:", pathname)

        // Validate session
        if (!validateSession()) {
          console.log("AuthGuard: Session validation failed")
          router.push("/")
          return
        }

        // Get current user
        const user = getCurrentUser()
        if (!user) {
          console.log("AuthGuard: No current user found")
          router.push("/")
          return
        }

        console.log("AuthGuard: User found:", { id: user.id, role: user.role })

        // Check if user can access current route
        if (!canAccessRoute(pathname)) {
          console.log("AuthGuard: Route access denied")
          setError("You don't have permission to access this page")
          setTimeout(() => {
            if (user.role === "admin") {
              router.push("/admin")
            } else if (user.role === "employee") {
              router.push("/employee")
            } else {
              router.push("/")
            }
          }, 2000)
          return
        }

        // Check required role
        if (requiredRole !== "any" && user.role !== requiredRole) {
          console.log("AuthGuard: Required role not met:", { userRole: user.role, requiredRole })
          setError(`This page requires ${requiredRole} privileges`)
          setTimeout(() => {
            if (user.role === "admin") {
              router.push("/admin")
            } else if (user.role === "employee") {
              router.push("/employee")
            } else {
              router.push("/")
            }
          }, 2000)
          return
        }

        // Check required permissions
        if (requiredPermissions.length > 0) {
          const hasAllPermissions = requiredPermissions.every((permission) => user.permissions?.includes(permission))

          if (!hasAllPermissions) {
            console.log("AuthGuard: Required permissions not met:", {
              requiredPermissions,
              userPermissions: user.permissions,
            })
            setError("You don't have the required permissions for this page")
            setTimeout(() => {
              if (user.role === "admin") {
                router.push("/admin")
              } else if (user.role === "employee") {
                router.push("/employee")
              } else {
                router.push("/")
              }
            }, 2000)
            return
          }
        }

        // User is authorized
        console.log("AuthGuard: Authorization successful")
        setIsAuthorized(true)
      } catch (error) {
        console.error("AuthGuard: Auth check error:", error)
        setError("Authentication error occurred")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router, requiredRole, requiredPermissions])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Checking authorization...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-gray-500">Redirecting you to the appropriate page...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
