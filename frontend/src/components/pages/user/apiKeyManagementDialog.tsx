import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import CustomModal from '@/components/customModal'
import { type User, type ApiKey } from '@/api/user/model'
import { useApi } from '@/api/api'
import {
  Loader2,
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import useModalContext from '@/hooks/useModal'
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

interface ApiKeyManagementDialogProps {
  user: User | null
  triggerComponent: React.ReactElement
  onSuccess?: () => void
}

export function ApiKeyManagementDialog({
  user,
  triggerComponent,
  onSuccess,
}: ApiKeyManagementDialogProps) {
  const modalId = 'api-key-management-modal'
  const { user: userApi } = useApi()
  const { setSuccess, setError } = useToast()
  const { closeModal } = useModalContext()

  const [isCreating, setIsCreating] = useState(false)
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['read'])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null)

  if (!user) return triggerComponent

  const availableScopes = [
    'read',
    'write',
    'delete',
    'admin',
    'user:read',
    'user:write',
    'role:read',
    'role:write',
  ]

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleScopeToggle = (scope: string) => {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    )
  }

  const handleCreateKey = async () => {
    try {
      setIsCreating(true)
      await userApi.createApiKey.mutateAsync({
        email: user.email,
        api_key: {
          scopes: newKeyScopes,
          active: true,
        },
      })

      setSuccess('API key created successfully')
      setNewKeyScopes(['read'])
      if (onSuccess) onSuccess()
    } catch (error: any) {
      setError(error.message || 'Failed to create API key')
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleKey = async (key: ApiKey) => {
    try {
      await userApi.updateApiKey.mutateAsync({
        client_id: key.client_id,
        active: !key.active,
      })

      setSuccess(`API key ${key.active ? 'deactivated' : 'activated'}`)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      setError(error.message || 'Failed to update API key')
    }
  }

  const handleDeleteKey = async (clientId: string) => {
    try {
      await userApi.deleteApiKey.mutateAsync(clientId)

      setSuccess('API key deleted successfully')
      setDeleteConfirmKey(null)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      setError(error.message || 'Failed to delete API key')
    }
  }

  return (
    <>
      <CustomModal
        id={modalId}
        title="Manage API Keys"
        description={`API keys for ${user.name || user.email}`}
        component={triggerComponent}
        width="700px"
      >
        <div className="space-y-6">
          {/* Existing API Keys */}
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Active API Keys ({user.api_keys?.length || 0})
            </p>

            {user.api_keys && user.api_keys.length > 0 ? (
              <div className="space-y-2">
                {user.api_keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-start justify-between p-3 bg-muted rounded-md gap-3"
                  >
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs break-all flex-1">
                          {key.client_id}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={() => copyToClipboard(key.client_id, key.id)}
                        >
                          {copiedKey === key.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      {key.scopes && key.scopes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.map((scope) => (
                            <Badge key={scope} variant="secondary" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={key.active ? 'default' : 'secondary'}>
                        {key.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleToggleKey(key)}
                      >
                        {key.active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmKey(key.client_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No API keys yet
              </p>
            )}
          </div>

          <Separator />

          {/* Create New API Key */}
          <div className="space-y-4">
            <p className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New API Key
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Select Scopes</p>
                <div className="grid grid-cols-2 gap-2">
                  {availableScopes.map((scope) => (
                    <div key={scope} className="flex items-center space-x-2">
                      <Checkbox
                        id={`scope-${scope}`}
                        checked={newKeyScopes.includes(scope)}
                        onCheckedChange={() => handleScopeToggle(scope)}
                      />
                      <label
                        htmlFor={`scope-${scope}`}
                        className="text-sm cursor-pointer"
                      >
                        {scope}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {newKeyScopes.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Selected Scopes
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {newKeyScopes.map((scope) => (
                      <Badge key={scope} variant="default" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateKey}
              disabled={isCreating || newKeyScopes.length === 0}
              className="w-full"
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create API Key
            </Button>
          </div>

          <Separator />

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => closeModal(modalId)}>
              Close
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmKey}
        onOpenChange={() => setDeleteConfirmKey(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the API key
              and any applications using it will lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmKey && handleDeleteKey(deleteConfirmKey)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
