"use client"

import { useEffect } from "react"
import VehicleReport from "./components/VehicleReport"
import { initializeData } from "./data"

function App() {
  // Initialize data
  useEffect(() => {
    initializeData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <VehicleReport initialVehicles={[]} />
    </div>
  )
}

export default App
