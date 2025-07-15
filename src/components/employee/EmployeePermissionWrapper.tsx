"use client"

import type { ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock } from "lucide-react"
import { hasPermission, getCurrentUser } from "@/src/utils/auth-utils"

interface EmployeePermissionWrapperProps {
  children: ReactNode
  requiredPermission?: string
  fallbackMessage?: string
  showFallback?: boolean
}

export default function EmployeePermissionWrapper({
  children,
  requiredPermission,
  fallbackMessage = "You don't have permission to access this feature.",
  showFallback = true,
}: EmployeePermissionWrapperProps) {
  const currentUser = getCurrentUser()

  // If no permission is required, always show content
  if (!requiredPermission) {
    return <>{children}</>
  }

  // Check if user has the required permission
  const hasAccess = hasPermission(requiredPermission)

  // If user has access, show the content
  if (hasAccess) {
    return <>{children}</>
  }

  // If user doesn't have access and we should show fallback
  if (showFallback) {
    return (
      <div className="space-y-6">
        <Alert className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Access Restricted</span>
            </div>
            <p className="mt-2">{fallbackMessage}</p>
            {currentUser && (
              <p className="text-sm mt-1">
                Current role: <span className="font-medium">{currentUser.role}</span>
              </p>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // If we shouldn't show fallback, return null
  return null
}
