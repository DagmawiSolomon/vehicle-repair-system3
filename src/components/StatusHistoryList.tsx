"use client"

import { useState } from "react"
import type { StatusHistory } from "../types"
import { formatTimestamp, getStatusName, getStatusBadgeClasses } from "../utils/vehicle-utils"
import { History, ChevronDown, ChevronUp } from "lucide-react"

interface StatusHistoryListProps {
  history: StatusHistory[]
}

export default function StatusHistoryList({ history }: StatusHistoryListProps) {
  const [expanded, setExpanded] = useState(false)

  if (history.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No status changes recorded</p>
      </div>
    )
  }

  // Show only the last 3 entries when collapsed
  const displayedHistory = expanded ? history : history.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <History className="h-5 w-5 mr-2 text-gray-500" />
          Status History
        </h3>
        {history.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {expanded ? (
              <>
                Show Less <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Show All ({history.length}) <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedHistory.map((entry) => (
          <div
            key={entry.id}
            className="bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(entry.newStatus)}`}
                  >
                    {getStatusName(entry.newStatus)}
                  </span>
                  <span className="text-gray-500 text-xs">from {getStatusName(entry.previousStatus)}</span>
                </div>
                <p className="text-sm text-gray-600">{formatTimestamp(entry.timestamp)}</p>
              </div>

              {entry.associatedRepairId && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Repair Related</span>
              )}
            </div>

            {entry.notes && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-700">{entry.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!expanded && history.length > 3 && (
        <div className="text-center">
          <button onClick={() => setExpanded(true)} className="text-sm text-blue-600 hover:text-blue-800">
            Show {history.length - 3} more entries
          </button>
        </div>
      )}
    </div>
  )
}
