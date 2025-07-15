"use client"

import { Bell, Menu, Shield, LogOut, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AdminHeaderProps {
  onLogout: () => void
  onExit: () => void
  currentUser: { username: string; role: string } | null
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  isMobileMenuOpen: boolean
}

export default function AdminHeader({
  onLogout,
  onExit,
  currentUser,
  toggleSidebar,
  toggleMobileMenu,
  isMobileMenuOpen,
}: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button onClick={toggleMobileMenu} className="md:hidden p-2 rounded-md hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Vehicle Repair Management System</p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User info */}
          {currentUser && (
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
              <p className="text-xs text-gray-600 capitalize">{currentUser.role}</p>
            </div>
          )}

          {/* Notifications */}
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white">3</Badge>
          </Button>

          {/* Exit to main site */}
          <Button variant="outline" size="sm" onClick={onExit}>
            <Home className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exit Admin</span>
          </Button>

          {/* Logout */}
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
