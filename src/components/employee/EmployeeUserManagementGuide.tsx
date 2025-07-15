"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, UserPlus, Edit, Eye, CheckCircle, AlertCircle, Info } from "lucide-react"

export default function EmployeeUserManagementGuide() {
  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">User Management Access</span>
          </div>
          <p>
            You have been granted user management permissions. This allows you to create, edit, and manage user accounts
            with the same capabilities as the admin dashboard.
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-green-600" />
              Add Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Create new user accounts with appropriate roles and permissions.
            </p>
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                Employee
              </Badge>
              <Badge variant="outline" className="text-xs">
                Technician
              </Badge>
              <Badge variant="outline" className="text-xs">
                Manager
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">Update user information, roles, and account status.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Profile updates</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Role changes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-purple-600" />
              View Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">Access comprehensive user information and activity logs.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Full profiles</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Login history</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Important Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Security Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure strong passwords for all accounts</li>
                <li>• Regularly review user permissions</li>
                <li>• Deactivate unused accounts promptly</li>
                <li>• Monitor login activity for anomalies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Role Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Assign minimum required permissions</li>
                <li>• Document role changes</li>
                <li>• Verify user identity before changes</li>
                <li>• Maintain audit trail</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
