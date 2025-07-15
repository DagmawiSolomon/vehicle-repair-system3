import { getDefaultCompanySettings } from "./utils/company-utils"

// Initialize empty arrays in localStorage if not already present
export const initializeData = () => {
  if (!localStorage.getItem("vehicles")) {
    localStorage.setItem("vehicles", JSON.stringify([]))
  }

  if (!localStorage.getItem("vehicleRepairs")) {
    localStorage.setItem("vehicleRepairs", JSON.stringify([]))
  }

  if (!localStorage.getItem("statusHistory")) {
    localStorage.setItem("statusHistory", JSON.stringify([]))
  }

  if (!localStorage.getItem("companySettings")) {
    localStorage.setItem("companySettings", JSON.stringify(getDefaultCompanySettings()))
  }
}
