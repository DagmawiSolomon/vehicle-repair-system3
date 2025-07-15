"use client"

import AdminLogin from "@/src/components/auth/AdminLogin"
import { useRouter } from "next/navigation"
import type { User } from "@/src/types"

export default function AdminLoginPage() {
  const router = useRouter()

  const handleLogin = (user: User) => {
    // Store user session
    localStorage.setItem("currentAdminUser", JSON.stringify(user))
    // Redirect to admin dashboard
    router.push("/admin")
  }

  return <AdminLogin onLogin={handleLogin} />
}
