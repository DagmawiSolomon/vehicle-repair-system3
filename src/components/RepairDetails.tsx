"use client"

import { useState } from "react"
import type { RepairService } from "../types"
import { formatDate, getStatusBadgeClasses } from "../utils/vehicle-utils"
import {
  Clock,
  DollarSign,
  User,
  Package,
  FileText,
  Lock,
  Edit,
  Receipt,
  ZoomIn,
  ZoomOut,
  X,
  Download,
} from "lucide-react"

interface RepairDetailsProps {
  repair: RepairService
  onClose: () => void
  onEdit?: () => void
}

export default function RepairDetails({ repair, onClose, onEdit }: RepairDetailsProps) {
  const isCompleted = repair.status === "completed"
  const createdDate = new Date(repair.createdAt)
  const updatedDate = new Date(repair.updatedAt)
  const wasUpdated = updatedDate.getTime() > createdDate.getTime() + 1000 // Add 1 second buffer for creation process

  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleDownloadReceipt = () => {
    if (!repair.receiptImage) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = repair.receiptImage
    link.download = `receipt-${repair.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold">Repair Details</h3>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className={`px-3 py-1 ${isCompleted ? "bg-gray-600" : "bg-blue-600"} text-white text-sm rounded hover:${isCompleted ? "bg-gray-700" : "bg-blue-700"} flex items-center`}
            >
              {isCompleted ? (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Limited Edit
                </>
              ) : (
                <>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </>
              )}
            </button>
          )}
          <button onClick={onClose} className="px-3 py-1 border text-sm rounded hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>

      {isCompleted && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
          <Lock className="h-4 w-4 text-gray-500 mr-2" />
          <p className="text-sm text-gray-700">
            This repair record has been marked as completed and is locked to maintain record integrity. Only notes and
            images can be updated.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
          <p className="text-gray-800">{repair.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Service Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Service Date:</span>
                <span className="ml-auto font-medium">{formatDate(repair.serviceDate)}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Technician:</span>
                <span className="ml-auto font-medium">{repair.technician}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Labor Hours:</span>
                <span className="ml-auto font-medium">{repair.laborHours}</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(repair.status)}`}
                  >
                    {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-600">Status</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Financial Details</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Total Cost:</span>
                <span className="ml-auto font-medium text-lg">ETB {repair.cost.toFixed(2)}</span>
              </div>

              {repair.receiptImage && (
                <div className="mb-4">
                  <div
                    className="cursor-pointer border rounded p-2 bg-white hover:bg-gray-50 transition-colors"
                    onClick={() => setShowReceiptModal(true)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600 flex items-center">
                        <Receipt className="h-3 w-3 mr-1" />
                        Receipt Image
                      </span>
                      <span className="text-xs text-blue-600 flex items-center">
                        <ZoomIn className="h-3 w-3 mr-1" />
                        View Details
                      </span>
                    </div>
                    <img
                      src={repair.receiptImage || "/placeholder.svg"}
                      alt="Receipt"
                      className="max-h-32 mx-auto object-contain"
                    />
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-2">Parts Used:</h5>
                {repair.parts.length > 0 ? (
                  <ul className="space-y-1">
                    {repair.parts.map((part, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Package className="h-3 w-3 text-gray-400 mr-2" />
                        {part}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No parts recorded</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {repair.notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{repair.notes}</p>
            </div>
          </div>
        )}

        {repair.images && repair.images.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {repair.images.map((image, index) => (
                <a key={index} href={image} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Repair image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>Created: {new Date(repair.createdAt).toLocaleString()}</p>
          {wasUpdated && <p>Last Updated: {new Date(repair.updatedAt).toLocaleString()}</p>}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && repair.receiptImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium flex items-center">
                <Receipt className="h-4 w-4 mr-2" />
                Receipt Details
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-full hover:bg-gray-100"
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={handleZoomIn} className="p-2 rounded-full hover:bg-gray-100" disabled={zoomLevel >= 3}>
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button onClick={handleDownloadReceipt} className="p-2 rounded-full hover:bg-gray-100 text-blue-600">
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto flex-1 p-4 bg-gray-100 flex items-center justify-center">
              <div
                className="bg-white shadow-md rounded-md p-2 overflow-hidden"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center", transition: "transform 0.2s" }}
              >
                <img
                  src={repair.receiptImage || "/placeholder.svg"}
                  alt="Receipt"
                  className="max-w-full object-contain"
                />
              </div>
            </div>
            <div className="p-3 border-t bg-gray-50 text-center text-sm text-gray-500">
              Use mouse wheel or pinch gestures to zoom in and out. Click and drag to pan when zoomed in.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
