import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import CustomModal from '@/components/customModal'
import { type User, type UserCreateRequest } from '@/api/user/model'
import { useApi } from '@/api/api'
import { Loader2, UserPlus, UserCog } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import useModalContext from '@/hooks/useModal'

interface UserFormDialogProps {
  user?: User | null
  triggerComponent: React.ReactElement
  onSuccess?: () => void
  mode?: 'create' | 'edit'
}

interface FormData {
  name: string
  email: string
  password: string
  roles: string[]
  is_active: boolean
}

export function UserFormDialog({
  user,
  triggerComponent,
  onSuccess,
  mode = 'create',
}: UserFormDialogProps) {
  const modalId = mode === 'create' ? 'create-user-modal' : 'edit-user-modal'
  const { user: userApi, role } = useApi()
  const { setSuccess, setError } = useToast()
  const { closeModal } = useModalContext()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    roles: [],
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch available roles
  const { data: availableRoles } = role.useAllRolesQuery()

  // Initialize form data when user changes or modal opens
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name || '',
        email: user.email,
        password: '', // Password field should be empty for edit mode
        roles: user.roles?.map((r) => r.name) || [],
        is_active: user.is_active,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        roles: [],
        is_active: true,
      })
    }
  }, [user, mode])

  const handleRoleToggle = (roleName: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter((r) => r !== roleName)
        : [...prev.roles, roleName],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.email) {
      setError('Email is required')
      return
    }

    if (mode === 'create' && !formData.password) {
      setError('Password is required for new users')
      return
    }

    try {
      setIsSubmitting(true)

      if (mode === 'create') {
        const createRequest: UserCreateRequest = {
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
          roles: formData.roles.length > 0 ? formData.roles : undefined,
        }

        await userApi.createUser.mutateAsync(createRequest)
        setSuccess('User created successfully')
      } else if (user) {
        // Backend expects UserUpdateRequest with roles as string array (role names)
        // Ensure roles are always strings, even if formData somehow has objects
        const roleNames = formData.roles.map(r =>
          typeof r === 'string' ? r : (r as any).name
        )

        const updateRequest: any = {
          id: user.id,
          username: formData.email,
          email: formData.email,
          name: formData.name,
          source: user.source,
          email_confirmed: user.email_confirmed,
          is_active: formData.is_active,
          roles: roleNames, // Guaranteed to be string array
          api_keys: user.api_keys || [],
        }

        await userApi.updateUser.mutateAsync(updateRequest)
        setSuccess('User updated successfully')
      }

      closeModal(modalId)

      if (onSuccess) {
        onSuccess()
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        roles: [],
        is_active: true,
      })
    } catch (error: any) {
      setError(error.message || `Failed to ${mode} user`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CustomModal
      id={modalId}
      title={mode === 'create' ? 'Create New User' : 'Edit User'}
      description={
        mode === 'create'
          ? 'Add a new user to the system'
          : `Update information for ${user?.name || user?.email}`
      }
      component={triggerComponent}
      width="600px"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name {mode === 'create' && <span className="text-muted-foreground">(optional)</span>}
            </Label>
            <Input
              id="name"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              disabled={mode === 'edit'} // Email cannot be changed in edit mode
            />
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Roles */}
        <div className="space-y-3">
          <Label>Roles</Label>
          {availableRoles && availableRoles.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50"
                >
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={formData.roles.includes(role.name)}
                    onCheckedChange={() => handleRoleToggle(role.name)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`role-${role.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {role.name}
                    </label>
                    {role.description && (
                      <p className="text-xs text-muted-foreground">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No roles available</p>
          )}
        </div>

        <Separator />

        {/* Options */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_active: checked === true }))
            }
          />
          <label
            htmlFor="is_active"
            className="text-sm font-medium cursor-pointer"
          >
            Active account
          </label>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal(modalId)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </>
            ) : (
              <>
                <UserCog className="mr-2 h-4 w-4" />
                Update User
              </>
            )}
          </Button>
        </div>
      </form>
    </CustomModal>
  )
}
