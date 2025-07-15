"use client"

import { useState } from "react"
import type { User } from "../types"
import { UserPlus, Trash2, Edit, Save, X } from "lucide-react"

interface AdminUserManagementProps {
  users: User[]
  onUpdate: (users: User[]) => void
  logActivity: (action: string, category: string, description: string) => void
}

export default function AdminUserManagement({ users, onUpdate, logActivity }: AdminUserManagementProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "technician",
  })
  const [editedUser, setEditedUser] = useState<User | null>(null)

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      alert("Name and email are required")
      return
    }

    const userWithSameEmail = users.find((user) => user.email === newUser.email)
    if (userWithSameEmail) {
      alert("A user with this email already exists")
      return
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as "admin" | "technician" | "user",
    }

    const updatedUsers = [...users, user]
    onUpdate(updatedUsers)
    logActivity("Add user", "Users", `Added new user: ${user.name} (${user.role})`)

    setNewUser({
      name: "",
      email: "",
      role: "technician",
    })
    setIsAddingUser(false)
  }

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id)
    setEditedUser({ ...user })
  }

  const handleSaveEdit = () => {
    if (!editedUser) return

    if (!editedUser.name || !editedUser.email) {
      alert("Name and email are required")
      return
    }

    const userWithSameEmail = users.find((user) => user.email === editedUser.email && user.id !== editedUser.id)
    if (userWithSameEmail) {
      alert("A user with this email already exists")
      return
    }

    const updatedUsers = users.map((user) => (user.id === editedUser.id ? editedUser : user))

    onUpdate(updatedUsers)
    logActivity("Edit user", "Users", `Updated user: ${editedUser.name} (${editedUser.role})`)

    setEditingUserId(null)
    setEditedUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    // Prevent deleting the last admin
    const adminUsers = users.filter((user) => user.role === "admin")
    const userToDelete = users.find((user) => user.id === userId)

    if (adminUsers.length === 1 && userToDelete?.role === "admin") {
      alert("Cannot delete the last admin user")
      return
    }

    if (confirm("Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter((user) => user.id !== userId)
      onUpdate(updatedUsers)

      const deletedUser = users.find((user) => user.id === userId)
      if (deletedUser) {
        logActivity("Delete user", "Users", `Deleted user: ${deletedUser.name} (${deletedUser.role})`)
      }
    }
  }

  const cancelEdit = () => {
    setEditingUserId(null)
    setEditedUser(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setIsAddingUser(true)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Add User Form */}
      {isAddingUser && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                className="w-full p-2 border rounded"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="admin">Administrator</option>
                <option value="technician">Technician</option>
                <option value="user">Regular User</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setIsAddingUser(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAddUser} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                {editingUserId === user.id ? (
                  // Edit mode
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editedUser?.name || ""}
                        onChange={(e) => setEditedUser({ ...editedUser!, name: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="email"
                        className="w-full p-2 border rounded"
                        value={editedUser?.email || ""}
                        onChange={(e) => setEditedUser({ ...editedUser!, email: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="w-full p-2 border rounded"
                        value={editedUser?.role || "user"}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser!, role: e.target.value as "admin" | "technician" | "user" })
                        }
                      >
                        <option value="admin">Administrator</option>
                        <option value="technician">Technician</option>
                        <option value="user">Regular User</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-900 mr-3">
                        <Save className="h-4 w-4" />
                      </button>
                      <button onClick={cancelEdit} className="text-gray-600 hover:text-gray-900">
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "technician"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No users found. Add a user to get started.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">User Role Information</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>
            <strong>Administrator:</strong> Full access to all system features including user management and system
            settings.
          </li>
          <li>
            <strong>Technician:</strong> Can manage vehicles, create and update repair records, but cannot access admin
            settings.
          </li>
          <li>
            <strong>Regular User:</strong> Limited access to view vehicles and repair history only.
          </li>
        </ul>
        <p className="mt-3 text-xs text-blue-600">
          Note: There must always be at least one administrator account in the system.
        </p>
      </div>
    </div>
  )
}
