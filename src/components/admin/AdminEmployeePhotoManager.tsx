"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Edit, Trash2, Search, Camera, Eye } from "lucide-react"
import type { EmployeeUser } from "@/src/types"

interface EmployeePhoto {
  id: string
  userId: string
  filename: string
  url: string
  uploadedAt: string
  uploadedBy: string
  size: number
  type: string
}

interface AdminEmployeePhotoManagerProps {
  users: EmployeeUser[]
  onUsersChange: (users: EmployeeUser[]) => void
  currentUser: EmployeeUser
  isLoading: boolean
}

export default function AdminEmployeePhotoManager({
  users,
  onUsersChange,
  currentUser,
  isLoading,
}: AdminEmployeePhotoManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<EmployeeUser | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<EmployeePhoto | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [employeePhotos, setEmployeePhotos] = useState<EmployeePhoto[]>([])

  // Load employee photos from localStorage
  useState(() => {
    const photosData = localStorage.getItem("employeePhotos")
    if (photosData) {
      setEmployeePhotos(JSON.parse(photosData))
    }
  })

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedUser) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    handlePhotoUpload(file)
  }

  const handlePhotoUpload = async (file: File) => {
    if (!selectedUser) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Create file URL (in a real app, this would be uploaded to a server)
      const fileUrl = URL.createObjectURL(file)

      // Create photo record
      const newPhoto: EmployeePhoto = {
        id: `photo-${Date.now()}`,
        userId: selectedUser.id,
        filename: file.name,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser.id,
        size: file.size,
        type: file.type,
      }

      // Update employee photos
      const updatedPhotos = [...employeePhotos, newPhoto]
      setEmployeePhotos(updatedPhotos)
      localStorage.setItem("employeePhotos", JSON.stringify(updatedPhotos))

      // Update user with photo URL
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, profileImage: fileUrl } : user,
      )
      onUsersChange(updatedUsers)

      setUploadProgress(100)
      setTimeout(() => {
        setIsUploadDialogOpen(false)
        setSelectedUser(null)
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("Error uploading photo. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeletePhoto = () => {
    if (!selectedPhoto || !selectedUser) return

    // Remove photo from storage
    const updatedPhotos = employeePhotos.filter((photo) => photo.id !== selectedPhoto.id)
    setEmployeePhotos(updatedPhotos)
    localStorage.setItem("employeePhotos", JSON.stringify(updatedPhotos))

    // Update user to remove photo URL
    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id ? { ...user, profileImage: undefined } : user,
    )
    onUsersChange(updatedUsers)

    setIsDeleteDialogOpen(false)
    setSelectedPhoto(null)
    setSelectedUser(null)
  }

  const openUploadDialog = (user: EmployeeUser) => {
    setSelectedUser(user)
    setIsUploadDialogOpen(true)
  }

  const openViewDialog = (user: EmployeeUser) => {
    const userPhoto = employeePhotos.find((photo) => photo.userId === user.id)
    setSelectedUser(user)
    setSelectedPhoto(userPhoto || null)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (user: EmployeeUser) => {
    const userPhoto = employeePhotos.find((photo) => photo.userId === user.id)
    if (userPhoto) {
      setSelectedUser(user)
      setSelectedPhoto(userPhoto)
      setIsDeleteDialogOpen(true)
    }
  }

  const getUserPhoto = (userId: string) => {
    return employeePhotos.find((photo) => photo.userId === userId)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Photo Management</h2>
          <p className="text-gray-600">Upload and manage employee profile photos</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Camera className="h-3 w-3" />
            {employeePhotos.length} Photos
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="technician">Technicians</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Photos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Photos ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Photo Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const userPhoto = getUserPhoto(user.id)
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          <Camera className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={userPhoto ? "default" : "secondary"}>
                        {userPhoto ? "Has Photo" : "No Photo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{userPhoto ? new Date(userPhoto.uploadedAt).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {userPhoto ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openViewDialog(user)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openUploadDialog(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openDeleteDialog(user)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openUploadDialog(user)}>
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upload Photo Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Employee Photo</DialogTitle>
            <DialogDescription>
              Upload a profile photo for {selectedUser?.name}. Supported formats: JPG, PNG, GIF. Max size: 5MB.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedUser && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.profileImage || "/placeholder.svg"} alt={selectedUser.name} />
                  <AvatarFallback>
                    <Camera className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm text-gray-600 capitalize">{selectedUser.role}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo" className="text-right">
                Photo
              </Label>
              <div className="col-span-3">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
              </div>
            </div>
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Photo Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Photo Details</DialogTitle>
            <DialogDescription>View and manage {selectedUser?.name}'s profile photo</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={selectedUser.profileImage || "/placeholder.svg"} alt={selectedUser.name} />
                  <AvatarFallback className="text-2xl">
                    <Camera className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Employee Name</Label>
                  <p>{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Role</Label>
                  <p className="capitalize">{selectedUser.role}</p>
                </div>
                {selectedPhoto && (
                  <>
                    <div>
                      <Label className="font-medium">File Name</Label>
                      <p>{selectedPhoto.filename}</p>
                    </div>
                    <div>
                      <Label className="font-medium">File Size</Label>
                      <p>{formatFileSize(selectedPhoto.size)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Uploaded</Label>
                      <p>{new Date(selectedPhoto.uploadedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Uploaded By</Label>
                      <p>{users.find((u) => u.id === selectedPhoto.uploadedBy)?.name || "Unknown"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedPhoto && (
              <Button onClick={() => openUploadDialog(selectedUser!)}>
                <Edit className="h-4 w-4 mr-2" />
                Update Photo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Photo Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee Photo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}'s profile photo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && selectedPhoto && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.profileImage || "/placeholder.svg"} alt={selectedUser.name} />
                  <AvatarFallback>
                    <Camera className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedPhoto.filename}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedPhoto.size)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePhoto}>
              Delete Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
