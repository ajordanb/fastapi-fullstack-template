import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { type User } from '@/api/user/model'
import { Copy, Check, Mail, Key, Shield } from 'lucide-react'
import { useState } from 'react'
import CustomModal from '@/components/customModal'
import {
  StatusBadge,
  EmailConfirmationBadge,
  SourceBadge,
} from './customCellRenderers'

interface UserDetailModalProps {
  user: User | null
  triggerComponent: React.ReactElement
  onManageRoles?: (user: User) => void
  onManageApiKeys?: (user: User) => void
}

export function UserDetailModal({
  user,
  triggerComponent,
  onManageRoles,
  onManageApiKeys,
}: UserDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const modalId = 'user-detail-modal'

  if (!user) return triggerComponent

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <CustomModal
      id={modalId}
      title="User Details"
      description="View detailed information about this user"
      component={triggerComponent}
      width="90%"
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge value={user.is_active} data={user} />
          <EmailConfirmationBadge value={user.email_confirmed} data={user} />
          <SourceBadge value={user.source} data={user} />
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">User ID</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs break-all">{user.id}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(user.id, 'id')}
                >
                  {copiedField === 'id' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{user.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Username</p>
              <p className="font-medium">{user.username || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <div className="flex items-center gap-2">
                <p className="font-medium break-all">{user.email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(user.email, 'email')}
                >
                  {copiedField === 'email' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Source</p>
              <p className="font-medium capitalize">{user.source}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{user.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Roles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles & Permissions
            </h3>
            {onManageRoles && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageRoles(user)}
              >
                Manage Roles
              </Button>
            )}
          </div>
          {user.roles && user.roles.length > 0 ? (
            <div className="space-y-2">
              {user.roles.map((role) => (
                <div
                  key={role.name}
                  className="flex items-start justify-between p-3 bg-muted rounded-md"
                >
                  <div className="space-y-1">
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 border-indigo-200"
                    >
                      {role.name}
                    </Badge>
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
                            +{role.scopes.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No roles assigned</p>
          )}
        </div>

        <Separator />

        {/* API Keys */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </h3>
            {onManageApiKeys && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageApiKeys(user)}
              >
                Manage Keys
              </Button>
            )}
          </div>
          {user.api_keys && user.api_keys.length > 0 ? (
            <div className="space-y-2">
              {user.api_keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-start justify-between p-3 bg-muted rounded-md"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs break-all">{key.client_id}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(key.client_id, key.id)}
                      >
                        {copiedField === key.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    {key.scopes && key.scopes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {key.scopes.slice(0, 3).map((scope) => (
                          <Badge
                            key={scope}
                            variant="secondary"
                            className="text-xs"
                          >
                            {scope}
                          </Badge>
                        ))}
                        {key.scopes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{key.scopes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={key.active ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {key.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No API keys</p>
          )}
        </div>
      </div>
    </CustomModal>
  )
}
