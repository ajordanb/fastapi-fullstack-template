import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import CustomModal from '@/components/customModal'
import { type Role } from '@/api/role/model'
import { useApi } from '@/api/api'
import { Loader2, Shield, Plus } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import useModalContext from '@/hooks/useModal'

interface RoleFormDialogProps {
  role?: Role | null
  triggerComponent: React.ReactElement
  onSuccess?: () => void
  mode?: 'create' | 'edit'
}

interface FormData {
  name: string
  description: string
  scopes: string[]
}

// Predefined list of available scopes
const AVAILABLE_SCOPES = [
  { value: 'admin', label: 'Admin', description: 'Full system access' },
  { value: 'users.read', label: 'Users Read', description: 'View user information' },
  { value: 'users.write', label: 'Users Write', description: 'Create and modify users' },
  { value: 'role.read', label: 'Roles Read', description: 'View role information' },
  { value: 'role.write', label: 'Roles Write', description: 'Create and modify roles' },
  { value: 'jobs.read', label: 'Jobs Read', description: 'View background jobs' },
  { value: 'jobs.write', label: 'Jobs Write', description: 'Manage background jobs' },
  { value: 'dashboard.read', label: 'Dashboard Read', description: 'View dashboards' },
  { value: 'api.read', label: 'API Read', description: 'Read API resources' },
  { value: 'api.write', label: 'API Write', description: 'Modify API resources' },
]

export function RoleFormDialog({
  role,
  triggerComponent,
  onSuccess,
  mode = 'create',
}: RoleFormDialogProps) {
  const modalId = mode === 'create' ? 'create-role-modal' : 'edit-role-modal'
  const { role: roleApi } = useApi()
  const { setSuccess, setError } = useToast()
  const { closeModal } = useModalContext()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    scopes: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data when role changes or modal opens
  useEffect(() => {
    if (mode === 'edit' && role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        scopes: role.scopes || [],
      })
    } else {
      setFormData({
        name: '',
        description: '',
        scopes: [],
      })
    }
  }, [role, mode])

  const handleScopeToggle = (scopeValue: string) => {
    setFormData((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scopeValue)
        ? prev.scopes.filter((s) => s !== scopeValue)
        : [...prev.scopes, scopeValue],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name) {
      setError('Role name is required')
      return
    }

    if (formData.scopes.length === 0) {
      setError('At least one scope is required')
      return
    }

    try {
      setIsSubmitting(true)

      if (mode === 'create') {
        await roleApi.createRole.mutateAsync({
          name: formData.name,
          description: formData.description,
          scopes: formData.scopes,
        })
        setSuccess('Role created successfully')
      } else if (role) {
        await roleApi.updateRole.mutateAsync({
          id: (role.id || role._id) as string,
          name: formData.name,
          description: formData.description,
          scopes: formData.scopes,
        })
        setSuccess('Role updated successfully')
      }

      closeModal(modalId)

      if (onSuccess) {
        onSuccess()
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        scopes: [],
      })
    } catch (error: any) {
      setError(error.message || `Failed to ${mode} role`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CustomModal
      id={modalId}
      title={mode === 'create' ? 'Create New Role' : 'Edit Role'}
      description={
        mode === 'create'
          ? 'Add a new role with specific permissions'
          : `Update information for ${role?.name}`
      }
      component={triggerComponent}
      width="600px"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Admin, Developer, Viewer"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this role can do"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
            />
          </div>
        </div>

        <Separator />

        {/* Scopes */}
        <div className="space-y-3">
          <Label>
            Permissions (Scopes) <span className="text-destructive">*</span>
          </Label>
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
            {AVAILABLE_SCOPES.map((scope) => (
              <div
                key={scope.value}
                className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50"
              >
                <Checkbox
                  id={`scope-${scope.value}`}
                  checked={formData.scopes.includes(scope.value)}
                  onCheckedChange={() => handleScopeToggle(scope.value)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`scope-${scope.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {scope.label}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {scope.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {formData.scopes.length} scope{formData.scopes.length !== 1 ? 's' : ''}
          </p>
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
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Update Role
              </>
            )}
          </Button>
        </div>
      </form>
    </CustomModal>
  )
}
