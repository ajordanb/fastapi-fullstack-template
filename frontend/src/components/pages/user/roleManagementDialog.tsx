import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import CustomModal from '@/components/customModal'
import { type User, type UserRole } from '@/api/user/model'
import { useApi } from '@/api/api'
import { Loader2, Shield } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import useModalContext from '@/hooks/useModal'

interface RoleManagementDialogProps {
  user: User | null
  triggerComponent: React.ReactElement
  onSuccess?: () => void
}

export function RoleManagementDialog({
  user,
  triggerComponent,
  onSuccess,
}: RoleManagementDialogProps) {
  const modalId = 'role-management-modal'
  const { role, user: userApi } = useApi()
  const { setSuccess, setError } = useToast()
  const { closeModal } = useModalContext()

  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all available roles
  const { data: allRoles, isLoading: isLoadingRoles } = role.useAllRolesQuery()

  // Initialize selected roles when user or modal opens
  useEffect(() => {
    if (user && user.roles) {
      setSelectedRoles(user.roles.map((r) => r.name))
    }
  }, [user])

  if (!user) return triggerComponent

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    )
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Backend expects UserUpdateRequest with roles as string array (role names)
      const updateRequest: any = {
        id: user.id,
        username: user.email,
        email: user.email,
        name: user.name,
        source: user.source,
        email_confirmed: user.email_confirmed,
        is_active: user.is_active,
        roles: selectedRoles, // Already an array of role names (strings)
        api_keys: user.api_keys || [],
      }

      await userApi.updateUser.mutateAsync(updateRequest)

      setSuccess('User roles updated successfully')
      closeModal(modalId)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update user roles')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CustomModal
      id={modalId}
      title="Manage User Roles"
      description={`Update roles for ${user.name || user.email}`}
      component={triggerComponent}
      width="600px"
    >
      <div className="space-y-6">
        {/* Current Roles */}
        {user.roles && user.roles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Roles</p>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge
                  key={role.name}
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 border-indigo-200"
                >
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Available Roles */}
        <div className="space-y-4">
          <p className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Available Roles
          </p>

          {isLoadingRoles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allRoles && allRoles.length > 0 ? (
            <div className="space-y-3">
              {allRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.name)}
                    onCheckedChange={() => handleRoleToggle(role.name)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={`role-${role.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {role.name}
                    </label>
                    {role.description && (
                      <p className="text-xs text-muted-foreground">
                        {role.description}
                      </p>
                    )}
                    {role.scopes && role.scopes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.scopes.slice(0, 5).map((scope) => (
                          <Badge
                            key={scope}
                            variant="secondary"
                            className="text-xs"
                          >
                            {scope}
                          </Badge>
                        ))}
                        {role.scopes.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{role.scopes.length - 5} more scopes
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No roles available
            </p>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => closeModal(modalId)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </CustomModal>
  )
}
