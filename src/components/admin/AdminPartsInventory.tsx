"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/utils/format-utils"
import type { Part, RepairService } from "@/types"
import { Search, Filter, Download, Trash2, Edit, Plus, Package, X, Check } from "lucide-react"

interface AdminPartsInventoryProps {
  parts: Part[]
  repairs: RepairService[]
  onUpdate: (parts: Part[]) => void
  logActivity: (action: string, category: string, description: string) => void
}

export default function AdminPartsInventory({ parts, repairs, onUpdate, logActivity }: AdminPartsInventoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filteredParts, setFilteredParts] = useState<Part[]>(parts)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [newPart, setNewPart] = useState<Partial<Part>>({
    name: "",
    category: "",
    sku: "",
    price: 0,
    stockQuantity: 0,
    reorderLevel: 0,
    location: "",
    description: "",
    manufacturer: "",
  })
  const [restockQuantity, setRestockQuantity] = useState<number>(0)

  // Get unique categories
  const categories = Array.from(new Set(parts.map((part) => part.category)))

  // Apply filters and sorting
  useEffect(() => {
    let result = [...parts]

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (part) =>
          part.name.toLowerCase().includes(term) ||
          part.sku.toLowerCase().includes(term) ||
          part.manufacturer.toLowerCase().includes(term) ||
          part.category.toLowerCase().includes(term),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((part) => part.category === categoryFilter)
    }

    // Apply stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "low") {
        result = result.filter((part) => part.stockQuantity <= part.reorderLevel)
      } else if (stockFilter === "out") {
        result = result.filter((part) => part.stockQuantity === 0)
      } else if (stockFilter === "ok") {
        result = result.filter((part) => part.stockQuantity > part.reorderLevel)
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any
      let valueB: any

      switch (sortBy) {
        case "name":
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case "sku":
          valueA = a.sku.toLowerCase()
          valueB = b.sku.toLowerCase()
          break
        case "price":
          valueA = a.price
          valueB = b.price
          break
        case "stock":
          valueA = a.stockQuantity
          valueB = b.stockQuantity
          break
        case "usage":
          valueA = a.usageCount || 0
          valueB = b.usageCount || 0
          break
        default:
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setFilteredParts(result)
  }, [parts, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder])

  const handleAddPart = () => {
    if (!newPart.name || !newPart.sku || !newPart.category) {
      alert("Please fill in all required fields")
      return
    }

    const partId = `part-${Date.now()}`
    const partToAdd: Part = {
      id: partId,
      name: newPart.name,
      category: newPart.category,
      sku: newPart.sku,
      price: Number(newPart.price) || 0,
      stockQuantity: Number(newPart.stockQuantity) || 0,
      reorderLevel: Number(newPart.reorderLevel) || 5,
      location: newPart.location || "",
      description: newPart.description || "",
      manufacturer: newPart.manufacturer || "",
      lastRestocked: new Date().toISOString(),
      usageCount: 0,
    }

    const updatedParts = [...parts, partToAdd]
    onUpdate(updatedParts)
    logActivity("Add part", "Inventory", `Added new part: ${partToAdd.name} (${partToAdd.sku})`)

    setIsAddModalOpen(false)
    setNewPart({
      name: "",
      category: "",
      sku: "",
      price: 0,
      stockQuantity: 0,
      reorderLevel: 0,
      location: "",
      description: "",
      manufacturer: "",
    })
  }

  const handleEditPart = () => {
    if (!selectedPart) return

    const updatedParts = parts.map((part) => (part.id === selectedPart.id ? selectedPart : part))

    onUpdate(updatedParts)
    logActivity("Edit part", "Inventory", `Updated part: ${selectedPart.name} (${selectedPart.sku})`)

    setIsEditModalOpen(false)
    setSelectedPart(null)
  }

  const handleDeletePart = () => {
    if (!selectedPart) return

    // Check if part is used in any repairs
    const isUsedInRepairs = repairs.some((repair) => repair.parts.some((part) => part.includes(selectedPart.name)))

    if (isUsedInRepairs) {
      alert("This part is used in repair records and cannot be deleted. Consider marking it as discontinued instead.")
      return
    }

    const updatedParts = parts.filter((part) => part.id !== selectedPart.id)
    onUpdate(updatedParts)
    logActivity("Delete part", "Inventory", `Deleted part: ${selectedPart.name} (${selectedPart.sku})`)

    setIsDeleteModalOpen(false)
    setSelectedPart(null)
  }

  const handleRestockPart = () => {
    if (!selectedPart || restockQuantity <= 0) return

    const updatedPart = {
      ...selectedPart,
      stockQuantity: selectedPart.stockQuantity + restockQuantity,
      lastRestocked: new Date().toISOString(),
    }

    const updatedParts = parts.map((part) => (part.id === selectedPart.id ? updatedPart : part))

    onUpdate(updatedParts)
    logActivity(
      "Restock part",
      "Inventory",
      `Restocked ${restockQuantity} units of ${selectedPart.name} (${selectedPart.sku})`,
    )

    setIsRestockModalOpen(false)
    setSelectedPart(null)
    setRestockQuantity(0)
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "SKU",
      "Name",
      "Category",
      "Price",
      "Stock Quantity",
      "Reorder Level",
      "Location",
      "Manufacturer",
      "Usage Count",
    ]

    const rows = filteredParts.map((part) => [
      part.sku,
      part.name,
      part.category,
      part.price,
      part.stockQuantity,
      part.reorderLevel,
      part.location || "",
      part.manufacturer || "",
      part.usageCount || 0,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `parts_inventory_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logActivity("Export parts", "Inventory", `Exported ${filteredParts.length} parts to CSV`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <Package className="h-6 w-6 mr-2 text-blue-600" />
          Parts Inventory
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Part
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search parts by name, SKU, or manufacturer..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-1 text-gray-500" />
              <select
                className="border rounded-lg px-3 py-2"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <select
                className="border rounded-lg px-3 py-2"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Stock Levels</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
                <option value="ok">In Stock</option>
              </select>
            </div>

            <div className="flex items-center">
              <select
                className="border rounded-lg px-3 py-2"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-")
                  setSortBy(newSortBy)
                  setSortOrder(newSortOrder as "asc" | "desc")
                }}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low-High)</option>
                <option value="price-desc">Price (High-Low)</option>
                <option value="stock-asc">Stock (Low-High)</option>
                <option value="stock-desc">Stock (High-Low)</option>
                <option value="usage-desc">Most Used</option>
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Part Info
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stock
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Usage
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParts.length > 0 ? (
                filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{part.name}</div>
                      <div className="text-sm text-gray-500">SKU: {part.sku}</div>
                      {part.manufacturer && <div className="text-xs text-gray-500">Mfr: {part.manufacturer}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {part.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(part.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {part.stockQuantity <= 0 ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        ) : part.stockQuantity <= part.reorderLevel ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Low Stock: {part.stockQuantity}
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            In Stock: {part.stockQuantity}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Reorder at {part.reorderLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{part.usageCount || 0} uses</div>
                      <div className="text-xs text-gray-500">{part.location && `Location: ${part.location}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPart(part)
                          setIsRestockModalOpen(true)
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPart(part)
                          setIsEditModalOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPart(part)
                          setIsDeleteModalOpen(true)
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No parts found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Add New Part</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Part Name*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newPart.name}
                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">SKU*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newPart.sku}
                    onChange={(e) => setNewPart({ ...newPart, sku: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newPart.category}
                    onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                    required
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={newPart.price}
                    onChange={(e) => setNewPart({ ...newPart, price: Number.parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={newPart.stockQuantity}
                    onChange={(e) => setNewPart({ ...newPart, stockQuantity: Number.parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reorder Level</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={newPart.reorderLevel}
                    onChange={(e) => setNewPart({ ...newPart, reorderLevel: Number.parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Manufacturer</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newPart.manufacturer}
                    onChange={(e) => setNewPart({ ...newPart, manufacturer: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Storage Location</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newPart.location}
                    onChange={(e) => setNewPart({ ...newPart, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={newPart.description}
                  onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleAddPart} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add Part
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Part Modal */}
      {isEditModalOpen && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Edit Part</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Part Name*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={selectedPart.name}
                    onChange={(e) => setSelectedPart({ ...selectedPart, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">SKU*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={selectedPart.sku}
                    onChange={(e) => setSelectedPart({ ...selectedPart, sku: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={selectedPart.category}
                    onChange={(e) => setSelectedPart({ ...selectedPart, category: e.target.value })}
                    required
                    list="edit-categories"
                  />
                  <datalist id="edit-categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedPart.price}
                    onChange={(e) =>
                      setSelectedPart({ ...selectedPart, price: Number.parseFloat(e.target.value) || 0 })
                    }
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedPart.stockQuantity}
                    onChange={(e) =>
                      setSelectedPart({ ...selectedPart, stockQuantity: Number.parseInt(e.target.value) || 0 })
                    }
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reorder Level</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedPart.reorderLevel}
                    onChange={(e) =>
                      setSelectedPart({ ...selectedPart, reorderLevel: Number.parseInt(e.target.value) || 0 })
                    }
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Manufacturer</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={selectedPart.manufacturer}
                    onChange={(e) => setSelectedPart({ ...selectedPart, manufacturer: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Storage Location</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={selectedPart.location}
                    onChange={(e) => setSelectedPart({ ...selectedPart, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={selectedPart.description}
                  onChange={(e) => setSelectedPart({ ...selectedPart, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleEditPart} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Delete Part</h3>
              </div>

              <p className="mb-4">
                Are you sure you want to delete <strong>{selectedPart.name}</strong> (SKU: {selectedPart.sku})? This
                action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button onClick={handleDeletePart} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Delete Part
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {isRestockModalOpen && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Restock {selectedPart.name}</h3>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Current stock: <span className="font-medium">{selectedPart.stockQuantity}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Reorder level: <span className="font-medium">{selectedPart.reorderLevel}</span>
                </p>

                <label className="block text-sm font-medium mb-1">Quantity to Add</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(Number.parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestockPart}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
