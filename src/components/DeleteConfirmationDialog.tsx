"use client"

import { AlertTriangle, Car, PenToolIcon as Tool } from "lucide-react"
import type { Vehicle, RepairService } from "../types"

interface DeleteConfirmationDialogProps {
  vehicle: Vehicle
  repairs: RepairService[]
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmationDialog({
  vehicle,
  repairs,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  const vehicleName = `${vehicle.make} ${vehicle.model} (${vehicle.year})`
  const totalRepairCost = repairs.reduce((sum, repair) => sum + repair.cost, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">Delete Vehicle</h3>
        </div>

        <div className="mb-6">
          <p className="mb-4 text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{vehicleName}</span>? This action cannot be
            undone and will also remove all repair records associated with this vehicle.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center">
              <Car className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">Vehicle:</span>
              <span className="ml-auto font-medium">{vehicleName}</span>
            </div>

            <div className="flex items-center">
              <Tool className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">Repair Records:</span>
              <span className="ml-auto font-medium">{repairs.length}</span>
            </div>

            {repairs.length > 0 && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600">Total Repair Cost:</span>
                <span className="ml-auto font-medium">ETB {totalRepairCost.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Delete Vehicle
          </button>
        </div>
      </div>
    </div>
  )
}
