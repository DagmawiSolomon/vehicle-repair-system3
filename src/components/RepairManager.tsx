"use client"

import { useState, useEffect } from "react"
import type { Vehicle, RepairService } from "../types"
import RepairForm from "./RepairForm"
import RepairList from "./RepairList"

interface RepairManagerProps {
  vehicle: Vehicle | null
}

export default function RepairManager({ vehicle }: RepairManagerProps) {
  const [repairs, setRepairs] = useState<RepairService[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingRepair, setEditingRepair] = useState<RepairService | null>(null)

  // Load repairs for the selected vehicle
  useEffect(() => {
    if (vehicle) {
      // In a real app, you would fetch from an API
      // For now, we'll use localStorage as a simple data store
      const storedRepairs = localStorage.getItem("vehicleRepairs")
      if (storedRepairs) {
        const allRepairs: RepairService[] = JSON.parse(storedRepairs)
        const vehicleRepairs = allRepairs.filter((repair) => repair.vehicleId === vehicle.id)
        setRepairs(vehicleRepairs)
      }
    } else {
      setRepairs([])
    }
  }, [vehicle])

  // Save repairs to localStorage
  const saveRepairs = (updatedRepairs: RepairService[]) => {
    const storedRepairs = localStorage.getItem("vehicleRepairs")
    let allRepairs: RepairService[] = []

    if (storedRepairs) {
      allRepairs = JSON.parse(storedRepairs)
      // Remove any existing repairs for this vehicle
      allRepairs = allRepairs.filter((repair) => (vehicle ? repair.vehicleId !== vehicle.id : true))
    }

    // Add the updated repairs
    allRepairs = [...allRepairs, ...updatedRepairs]
    localStorage.setItem("vehicleRepairs", JSON.stringify(allRepairs))

    // Update state
    setRepairs(updatedRepairs)
  }

  const handleAddRepair = (repairData: RepairService) => {
    const updatedRepairs = [...repairs, repairData]
    saveRepairs(updatedRepairs)
    setShowForm(false)
  }

  const handleEditRepair = (repair: RepairService) => {
    setEditingRepair(repair)
    setShowForm(true)
  }

  const handleUpdateRepair = (updatedRepair: RepairService) => {
    const updatedRepairs = repairs.map((repair) => (repair.id === updatedRepair.id ? updatedRepair : repair))
    saveRepairs(updatedRepairs)
    setShowForm(false)
    setEditingRepair(null)
  }

  const handleDeleteRepair = (repairId: string) => {
    if (window.confirm("Are you sure you want to delete this repair record?")) {
      const updatedRepairs = repairs.filter((repair) => repair.id !== repairId)
      saveRepairs(updatedRepairs)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingRepair(null)
  }

  if (!vehicle) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Please select a vehicle to manage repairs</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Repair History: {vehicle.make} {vehicle.model} ({vehicle.year})
        </h2>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Repair
          </button>
        )}
      </div>

      {showForm ? (
        <RepairForm
          vehicle={vehicle}
          onSubmit={editingRepair ? handleUpdateRepair : handleAddRepair}
          onCancel={handleCancelForm}
          initialData={editingRepair}
        />
      ) : (
        <RepairList repairs={repairs} onEdit={handleEditRepair} onDelete={handleDeleteRepair} />
      )}
    </div>
  )
}
