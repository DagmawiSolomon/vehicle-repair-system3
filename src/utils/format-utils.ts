import { getCompanySettings } from "./company-utils"

/**
 * Formats a number as currency with the company's currency symbol
 */
export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return "N/A"

  const settings = getCompanySettings()
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: settings.currencyCode || "ETB",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}

/**
 * Formats a distance value according to the company's distance unit
 */
export const formatDistance = (distance?: number): string => {
  if (distance === undefined || distance === null) return "N/A"

  const settings = getCompanySettings()
  const unit = settings.distanceUnit || "km"

  return `${distance.toLocaleString()} ${unit}`
}

/**
 * Parses a currency string into a number
 */
export const parseCurrency = (value: string): number => {
  // Remove currency symbol, spaces, and commas
  const cleanValue = value.replace(/[^\d.-]/g, "")
  return Number.parseFloat(cleanValue) || 0
}

/**
 * Parses a distance string into a number
 */
export const parseDistance = (value: string): number => {
  // Remove unit and commas
  const cleanValue = value.replace(/[^\d.-]/g, "")
  return Number.parseFloat(cleanValue) || 0
}

/**
 * Formats a date string to a readable format
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString()
}

/**
 * Formats a timestamp to include time
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
}

/**
 * Formats a Date object to display only the time portion
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

/**
 * Formats a duration in hours to a readable format
 */
export const formatDuration = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} min`
  }

  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (minutes === 0) {
    return `${wholeHours}h`
  }

  return `${wholeHours}h ${minutes}m`
}

/**
 * Formats a file size in bytes to a readable format
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === 0) return "0 Bytes"

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

/**
 * Formats a relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  return formatDate(dateString)
}
