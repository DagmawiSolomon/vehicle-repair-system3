"use client"

import { useState } from "react"
import { getCompanySettings } from "@/utils/company-utils"
import { LogOut, Home, Menu, X } from "lucide-react"

interface AdminHeaderProps {
  onLogout: () => void
  onExit: () => void
}

export default function AdminHeader({ onLogout, onExit }: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const settings = getCompanySettings()

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {settings.logo ? (
              <img src={settings.logo || "/placeholder.svg"} alt={settings.name} className="h-10 w-auto mr-3" />
            ) : (
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                A
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">{settings.name}</p>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={onExit} className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
              <Home className="h-5 w-5 mr-1" />
              <span>Exit to App</span>
            </button>

            <button onClick={onLogout} className="flex items-center px-3 py-2 rounded text-red-600 hover:bg-red-50">
              <LogOut className="h-5 w-5 mr-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t">
            <button
              onClick={onExit}
              className="flex items-center w-full px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
            >
              <Home className="h-5 w-5 mr-2" />
              <span>Exit to App</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center w-full px-3 py-2 rounded text-red-600 hover:bg-red-50 mt-2"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
