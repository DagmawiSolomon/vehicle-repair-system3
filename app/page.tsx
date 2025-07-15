"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginScreen from "@/src/components/auth/LoginScreen"
import { getCurrentUser, initializeDemoData } from "@/src/utils/auth-utils"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Initialize demo data
    initializeDemoData()

    // Check if user is already authenticated
    const currentUser = getCurrentUser()
    if (currentUser) {
      if (currentUser.role === "admin") {
        router.push("/admin")
      } else if (currentUser.role === "employee") {
        router.push("/employee")
      }
    }
  }, [router])

  return <LoginScreen />
}
