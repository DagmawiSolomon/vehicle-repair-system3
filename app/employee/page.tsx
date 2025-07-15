"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import EmployeeDashboard from "@/src/components/employee/EmployeeDashboard"
import { getCurrentUser } from "@/src/utils/auth-utils"

export default function EmployeePage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true)

        // Check for current user
        const currentUser = getCurrentUser()
        if (currentUser && currentUser.role === "employee") {
          setUser(currentUser)
        } else {
          // Try localStorage as fallback
          const storedUser = localStorage.getItem("currentEmployee")
          if (storedUser) {
            const userData = JSON.parse(storedUser)
            setUser(userData)
          } else {
            router.push("/employee/login")
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
        router.push("/employee/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Access denied</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <EmployeeDashboard />
}
