"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, Calendar } from "lucide-react"

interface ActivityLog {
  id: string
  timestamp: string
  action: string
  category: string
  description: string
  user: string
}

interface AdminActivityLogProps {
  logs: ActivityLog[]
}

export default function AdminActivityLog({ logs }: AdminActivityLogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>(logs)

  // Get unique categories
  const categories = Array.from(new Set(logs.map((log) => log.category)))

  // Apply filters
  useEffect(() => {
    let result = [...logs]

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (log) =>
          log.action.toLowerCase().includes(term) ||
          log.description.toLowerCase().includes(term) ||
          log.user.toLowerCase().includes(term),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((log) => log.category === categoryFilter)
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date()
      let cutoffDate: Date

      switch (timeFilter) {
        case "today":
          cutoffDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "week":
          cutoffDate = new Date(now)
          cutoffDate.setDate(cutoffDate.getDate() - 7)
          break
        case "month":
          cutoffDate = new Date(now)
          cutoffDate.setMonth(cutoffDate.getMonth() - 1)
          break
        default:
          cutoffDate = new Date(0) // Beginning of time
      }

      result = result.filter((log) => new Date(log.timestamp) >= cutoffDate)
    }

    // Sort by timestamp (newest first)
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setFilteredLogs(result)
  }, [logs, searchTerm, categoryFilter, timeFilter])

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Timestamp", "Action", "Category", "Description", "User"]
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.action,
      log.category,
      log.description,
      log.user,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `activity_log_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity Log</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activity logs..."
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
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              <select
                className="border rounded-lg px-3 py-2"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Timestamp
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
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
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.action.toLowerCase().includes("delete")
                            ? "bg-red-100 text-red-800"
                            : log.action.toLowerCase().includes("add")
                              ? "bg-green-100 text-green-800"
                              : log.action.toLowerCase().includes("edit") || log.action.toLowerCase().includes("update")
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.user}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No activity logs found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No activity logs found. System activity will be recorded here.</p>
        </div>
      )}
    </div>
  )
}
