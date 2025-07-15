"use client"

import CustomerLogin from "@/src/components/auth/CustomerLogin"
import { useRouter } from "next/navigation"
import type { Customer } from "@/src/types"

export default function CustomerLoginPage() {
  const router = useRouter()

  const handleLogin = (customer: Customer) => {
    // Store customer session
    localStorage.setItem("currentCustomer", JSON.stringify(customer))
    // Redirect to customer dashboard
    router.push("/customer")
  }

  return <CustomerLogin onLogin={handleLogin} />
}
