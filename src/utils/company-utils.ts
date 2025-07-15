import type { CompanySettings } from "../types"

/**
 * Gets the company settings from localStorage
 */
export const getCompanySettings = (): CompanySettings => {
  const storedSettings = localStorage.getItem("companySettings")
  if (storedSettings) {
    try {
      return JSON.parse(storedSettings)
    } catch (error) {
      console.error("Error parsing company settings:", error)
      return getDefaultCompanySettings()
    }
  }
  return getDefaultCompanySettings()
}

/**
 * Updates the company settings in localStorage
 */
export const updateCompanySettings = (settings: Partial<CompanySettings>): CompanySettings => {
  const currentSettings = getCompanySettings()
  const updatedSettings = { ...currentSettings, ...settings }
  localStorage.setItem("companySettings", JSON.stringify(updatedSettings))
  return updatedSettings
}

/**
 * Gets the default company settings
 */
export const getDefaultCompanySettings = (): CompanySettings => {
  return {
    name: "Ayal Tizazu's Garage",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo: "",
    serviceTypes: [
      "Oil Change",
      "Brake Service",
      "Tire Rotation",
      "Engine Repair",
      "Transmission Service",
      "Electrical System",
      "Air Conditioning",
      "Suspension",
    ],
    vehicleCategories: ["car", "truck", "suv", "van", "motorcycle"],
    distanceUnit: "km",
    currencySymbol: "ETB",
    currencyCode: "ETB",
    notificationSettings: {
      enableEmailNotifications: false,
      enableBrowserNotifications: true,
      serviceDueReminderDays: 7,
    },
  }
}

/**
 * Checks if browser notifications are supported and enabled
 */
export const areBrowserNotificationsSupported = (): boolean => {
  return "Notification" in window
}

/**
 * Requests permission for browser notifications
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!areBrowserNotificationsSupported()) {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === "granted"
}

/**
 * Shows a browser notification
 */
export const showNotification = (title: string, options?: NotificationOptions): boolean => {
  if (!areBrowserNotificationsSupported()) {
    return false
  }

  if (Notification.permission !== "granted") {
    return false
  }

  try {
    new Notification(title, options)
    return true
  } catch (error) {
    console.error("Error showing notification:", error)
    return false
  }
}
