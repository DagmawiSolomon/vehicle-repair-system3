"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CustomerDashboard from "@/src/components/customer/CustomerDashboard"
import type { Customer } from "@/src/types"
import AuthGuard from "@/src/components/auth/AuthGuard"

export default function CustomerPage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedCustomer = localStorage.getItem("currentCustomer")
    if (storedCustomer) {
      setCustomer(JSON.parse(storedCustomer))
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentCustomer")
    localStorage.removeItem("customerRememberToken")
    router.push("/")
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthGuard requiredRole="customer">
      <CustomerDashboard customer={customer} onLogout={handleLogout} />
    </AuthGuard>
  )
}
