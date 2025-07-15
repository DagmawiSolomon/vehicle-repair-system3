"use client"

import AuthGuard from "@/src/components/auth/AuthGuard"
import AdminDashboard from "@/src/components/admin/AdminDashboard"

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboard />
    </AuthGuard>
  )
}
