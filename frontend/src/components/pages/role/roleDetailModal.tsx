import CustomModal from '@/components/customModal'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Role } from '@/api/role/model'
import { Shield, Lock, Hash } from 'lucide-react'

interface RoleDetailModalProps {
  role: Role
  triggerComponent: React.ReactElement
}

export function RoleDetailModal({ role, triggerComponent }: RoleDetailModalProps) {
  const modalId = `role-detail-${role.id || role._id}`
  const isSystemRole = role.created_by.toLowerCase() === 'system'

  return (
    <CustomModal
      id={modalId}
      title="Role Details"
      description={`Detailed information for ${role.name}`}
      component={triggerComponent}
      width="600px"
    >
      <div className="space-y-6">
        {/* Role Status */}
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{role.name}</h3>
          {isSystemRole && (
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200"
            >
              <Lock className="h-3 w-3 mr-1" />
              System Role
            </Badge>
          )}
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Basic Information
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Role ID</p>
              <p className="text-sm font-mono">{role.id || role._id}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="text-sm font-medium">{role.created_by}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">
              {role.description || <span className="text-muted-foreground italic">No description</span>}
            </p>
          </div>
        </div>

        <Separator />

        {/* Scopes/Permissions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-muted-foreground">
              Permissions (Scopes)
            </h4>
          </div>

          {role.scopes && role.scopes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {role.scopes.map((scope) => (
                <Badge
                  key={scope}
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 border-indigo-200"
                >
                  {scope}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No scopes assigned
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Total: {role.scopes?.length || 0} scope{role.scopes?.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Separator />

        {/* Additional Info */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            {isSystemRole ? (
              <>
                <Lock className="h-3 w-3 inline mr-1" />
                This is a system-defined role and cannot be modified or deleted.
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 inline mr-1" />
                This is a custom role that can be modified or deleted.
              </>
            )}
          </p>
        </div>
      </div>
    </CustomModal>
  )
}
