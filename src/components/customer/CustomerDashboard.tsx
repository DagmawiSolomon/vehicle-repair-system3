"use client"

import { useState, useEffect } from "react"
import {
  Car,
  Calendar,
  Wrench,
  FileText,
  Settings,
  LogOut,
  Bell,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  DollarSign,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Customer, Vehicle, RepairService } from "../../types"

interface CustomerDashboardProps {
  customer: Customer
  onLogout: () => void
}

export default function CustomerDashboard({ customer, onLogout }: CustomerDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [repairs, setRepairs] = useState<RepairService[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Load customer's vehicles and repairs
    const allVehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")
    const customerVehicles = allVehicles.filter((v: Vehicle) => customer.vehicles.includes(v.id))
    setVehicles(customerVehicles)

    const allRepairs = JSON.parse(localStorage.getItem("repairs") || "[]")
    const customerRepairs = allRepairs.filter((r: RepairService) => customerVehicles.some((v) => v.id === r.vehicleId))
    setRepairs(customerRepairs)
  }, [customer])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "in_repair":
        return "bg-blue-100 text-blue-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "ready_for_pickup":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const activeRepairs = repairs.filter((r) => r.status === "in_progress" || r.status === "pending")
  const totalSpent = repairs.reduce((sum, r) => sum + r.cost, 0)
  const vehiclesInService = vehicles.filter((v) => v.status === "in_repair" || v.status === "maintenance").length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {customer.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
            <TabsTrigger value="repairs">Service History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Car className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">My Vehicles</p>
                      <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Wrench className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Repairs</p>
                      <p className="text-2xl font-bold text-gray-900">{activeRepairs.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">In Service</p>
                      <p className="text-2xl font-bold text-gray-900">{vehiclesInService}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Repairs</CardTitle>
                  <CardDescription>Your latest service activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {repairs.slice(0, 3).map((repair) => {
                      const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
                      return (
                        <div key={repair.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}
                            </p>
                            <p className="text-sm text-gray-600">{repair.description}</p>
                            <p className="text-xs text-gray-500">{new Date(repair.serviceDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(repair.status)}>{repair.status.replace("_", " ")}</Badge>
                            <p className="text-sm font-medium text-gray-900 mt-1">${repair.cost.toFixed(2)}</p>
                          </div>
                        </div>
                      )
                    })}
                    {repairs.length === 0 && <p className="text-gray-500 text-center py-4">No repair history yet</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Status</CardTitle>
                  <CardDescription>Current status of your vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                          <p className="text-xs text-gray-500">{vehicle.mileage.toLocaleString()} km</p>
                        </div>
                        <Badge className={getVehicleStatusColor(vehicle.status)}>
                          {vehicle.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                    {vehicles.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No vehicles registered yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Vehicles</h2>
              <Button>
                <Car className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </CardTitle>
                        <CardDescription>{vehicle.licensePlate}</CardDescription>
                      </div>
                      <Badge className={getVehicleStatusColor(vehicle.status)}>
                        {vehicle.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">VIN:</span>
                        <span className="text-sm font-medium">{vehicle.vin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mileage:</span>
                        <span className="text-sm font-medium">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Color:</span>
                        <span className="text-sm font-medium">{vehicle.color || "Not specified"}</span>
                      </div>
                      {vehicle.lastServiceDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Service:</span>
                          <span className="text-sm font-medium">
                            {new Date(vehicle.lastServiceDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Service
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Repairs Tab */}
          <TabsContent value="repairs" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Service History</h2>

            <div className="space-y-4">
              {repairs.map((repair) => {
                const vehicle = vehicles.find((v) => v.id === repair.vehicleId)
                return (
                  <Card key={repair.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}
                          </h3>
                          <p className="text-gray-600">{repair.description}</p>
                        </div>
                        <Badge className={getStatusColor(repair.status)}>{repair.status.replace("_", " ")}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Service Date</p>
                          <p className="font-medium">{new Date(repair.serviceDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Technician</p>
                          <p className="font-medium">{repair.technician}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Labor Hours</p>
                          <p className="font-medium">{repair.laborHours}h</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Cost</p>
                          <p className="font-medium text-green-600">${repair.cost.toFixed(2)}</p>
                        </div>
                      </div>

                      {repair.parts && repair.parts.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Parts Used</p>
                          <div className="flex flex-wrap gap-2">
                            {repair.parts.map((part, index) => (
                              <Badge key={index} variant="outline">
                                {part}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {repair.notes && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Notes</p>
                          <p className="text-sm text-gray-800">{repair.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
              {repairs.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Service History</h3>
                    <p className="text-gray-600">You haven't had any services yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{customer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-gray-900">{customer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-gray-900">{customer.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-gray-900">{customer.address || "Not provided"}</p>
                  </div>
                  <Button>
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Badge
                      className={
                        customer.preferences.emailUpdates ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {customer.preferences.emailUpdates ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Updates</p>
                      <p className="text-sm text-gray-600">Receive text message alerts</p>
                    </div>
                    <Badge
                      className={
                        customer.preferences.smsUpdates ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {customer.preferences.smsUpdates ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Update Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Support & Help</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Get in touch with our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-gray-600">(555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-600">support@autorepair.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">Service Center</p>
                      <p className="text-sm text-gray-600">123 Main St, City, State 12345</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-gray-600">Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common support tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule an Appointment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Request Service Quote
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment & Billing
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="h-4 w-4 mr-2" />
                    Emergency Roadside
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">How do I schedule a service appointment?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      You can schedule an appointment by calling us at (555) 123-4567 or using the "Schedule Service"
                      button in your vehicle details.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">How will I know when my vehicle is ready?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      We'll notify you via your preferred communication method (email or SMS) when your vehicle is ready
                      for pickup.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Can I track the progress of my repair?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Yes! You can view real-time updates on your repair status in the "Service History" section of your
                      dashboard.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
