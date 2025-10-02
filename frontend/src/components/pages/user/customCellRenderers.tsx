import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import type { ICellRendererParams } from 'ag-grid-community'
import {
  CheckCircle,
  Edit,
  Key,
  MoreHorizontal,
  Trash2,
  XCircle,
  RotateCcw,
  Shield,
  Eye,
} from 'lucide-react'
import type { ApiKey, User, UserRole } from '@/api/user/model'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserFormDialog } from './userFormDialog'
import { RoleManagementDialog } from './roleManagementDialog'
import { ApiKeyManagementDialog } from './apiKeyManagementDialog'
import { UserDetailModal } from './userDetailModal'
import { useApi } from '@/api/api'
import { useToast } from '@/hooks/useToast'
import useModalContext from '@/hooks/useModal'

export const StatusBadge: React.FC<ICellRendererParams> = (params) => {
  const isActive = params.value
  return isActive ? (
    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
      <CheckCircle className="h-3.5 w-3.5 mr-1" />
      Active
    </Badge>
  ) : (
    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
      <XCircle className="h-3.5 w-3.5 mr-1" />
      Inactive
    </Badge>
  )
}

export const EmailConfirmationBadge: React.FC<ICellRendererParams> = (params) => {
  const isConfirmed = params.value

  return isConfirmed ? (
    <Badge
      variant="outline"
      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
    >
      Verified
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"
    >
      Unverified
    </Badge>
  )
}

export const SourceBadge: React.FC<ICellRendererParams> = (params) => {
  const source = params.value as string

  switch (source.toLowerCase()) {
    case 'google':
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"
        >
          Google
        </Badge>
      )
    case 'github':
      return (
        <Badge
          variant="outline"
          className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50"
        >
          GitHub
        </Badge>
      )
    case 'local':
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50"
        >
          Local
        </Badge>
      )
    default:
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50"
        >
          {source}
        </Badge>
      )
  }
}

export const RolesBadge: React.FC<ICellRendererParams> = (params) => {
  const roles = params.value as UserRole[]

  if (!roles || roles.length === 0) {
    return (
      <span className="text-gray-400 cursor-pointer" title="Click to edit roles">
        No roles
      </span>
    )
  }

  return (
    <div
      className="flex flex-wrap gap-1 justify-center items-center w-full cursor-pointer"
      title="Click to edit roles"
    >
      {roles.map((role) => (
        <Badge
          key={role.name}
          variant="outline"
          className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50 flex-shrink-0"
        >
          {role.name}
        </Badge>
      ))}
    </div>
  )
}

export const ApiKeysBadge: React.FC<ICellRendererParams> = (params) => {
  const apiKeys = params.value as ApiKey[] | undefined

  if (!apiKeys || apiKeys.length === 0) {
    return <span className="text-gray-400">No API keys</span>
  }

  const activeKeys = apiKeys.filter((key) => key.active).length

  return (
    <Badge
      variant="outline"
      className="bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-50"
    >
      <Key className="h-3.5 w-3.5 mr-1" />
      {activeKeys} active key{activeKeys !== 1 ? 's' : ''}
    </Badge>
  )
}

export const ActionButtons: React.FC<ICellRendererParams> = (params) => {
  const { setSuccess, setError } = useToast()
  const { openModal } = useModalContext()

  const user = params.data as User
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const api = useApi()

  const handleViewDetails = () => {
    openModal('user-detail-modal')
  }

  const handleResetPassword = async () => {
    try {
      setIsSubmitting(true)
      await api.user.sendUserPasswordReset.mutateAsync(user.email)
      setSuccess('Password reset email sent successfully')
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      setIsSubmitting(true)
      const newActiveStatus = !user.is_active

      // Backend expects UserUpdateRequest with roles as string array (role names)
      const updateRequest: any = {
        id: user.id,
        username: user.email,
        email: user.email,
        name: user.name,
        source: user.source,
        email_confirmed: user.email_confirmed,
        is_active: newActiveStatus,
        roles: user.roles?.map((r) => r.name) || [],
        api_keys: user.api_keys || [],
      }

      await api.user.updateUser.mutateAsync(updateRequest)
      setSuccess(`User ${newActiveStatus ? 'activated' : 'deactivated'} successfully`)

      // Update the grid row with the updated user
      const updatedUser = { ...user, is_active: newActiveStatus }
      params.api.applyTransaction({ update: [updatedUser] })
    } catch (error: any) {
      setError(error.message || 'Failed to update user status')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    try {
      setIsSubmitting(true)
      await api.user.deleteUser.mutateAsync(user.id)
      setSuccess('User deleted successfully')
      setIsDeleteAlertOpen(false)

      // Remove from grid
      params.api.applyTransaction({ remove: [user] })
    } catch (error: any) {
      setError(error.message || 'Failed to delete user')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* View Details */}
          <UserDetailModal
            user={user}
            triggerComponent={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            }
            onManageRoles={(u) => openModal('role-management-modal')}
            onManageApiKeys={(u) => openModal('api-key-management-modal')}
          />

          {/* Edit User */}
          <UserFormDialog
            user={user}
            mode="edit"
            triggerComponent={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </DropdownMenuItem>
            }
            onSuccess={() => params.api.refreshCells({ force: true })}
          />

          <DropdownMenuSeparator />

          {/* Manage Roles */}
          <RoleManagementDialog
            user={user}
            triggerComponent={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Shield className="h-4 w-4 mr-2" />
                Manage Roles
              </DropdownMenuItem>
            }
            onSuccess={() => params.api.refreshCells({ force: true })}
          />

          {/* Manage API Keys */}
          <ApiKeyManagementDialog
            user={user}
            triggerComponent={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Key className="h-4 w-4 mr-2" />
                Manage API Keys
              </DropdownMenuItem>
            }
            onSuccess={() => params.api.refreshCells({ force: true })}
          />

          <DropdownMenuSeparator />

          {/* Toggle Status */}
          <DropdownMenuItem onClick={handleToggleStatus} disabled={isSubmitting}>
            {user.is_active ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </DropdownMenuItem>

          {/* Reset Password */}
          <DropdownMenuItem onClick={handleResetPassword} disabled={isSubmitting}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Password
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete User */}
          <DropdownMenuItem
            onClick={() => setIsDeleteAlertOpen(true)}
            className="text-red-600 focus:text-red-600"
            disabled={isSubmitting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user{' '}
              <strong>{user.name}</strong> ({user.email}). This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isSubmitting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
