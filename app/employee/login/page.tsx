"use client"
import { useRouter } from "next/navigation"
import EmployeeLogin from "@/src/components/auth/EmployeeLogin"
import type { User } from "@/src/types"

export default function EmployeeLoginPage() {
  const router = useRouter()

  const handleLogin = (user: User) => {
    localStorage.setItem("currentEmployee", JSON.stringify(user))
    router.push("/employee")
  }

  return <EmployeeLogin onLogin={handleLogin} />
}
