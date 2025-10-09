import { useMemo } from 'react'
import { type ColDef } from 'ag-grid-community'
import { type UserRole } from '@/api/user/model'
import { Badge } from '@/components/ui/badge'
import CustomGrid from '@/components/grid/customGrid'

interface RolesGridProps {
  roles: UserRole[]
  isLoading: boolean
}

function RoleNameBadge({ value }: { value: string }) {
  if (!value) return null

  const colorMap: Record<string, string> = {
    admin: 'bg-red-50 text-red-700 border-red-200',
    manager: 'bg-blue-50 text-blue-700 border-blue-200',
    user: 'bg-green-50 text-green-700 border-green-200',
  }

  const colorClass = colorMap[value.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <Badge variant="outline" className={`capitalize ${colorClass}`}>
      {value}
    </Badge>
  )
}

function ScopesBadge({ value }: { value: string[] }) {
  if (!value || value.length === 0) {
    return <span className="text-sm text-muted-foreground">No scopes</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {value.slice(0, 3).map((scope) => (
        <Badge key={scope} variant="secondary" className="text-xs">
          {scope}
        </Badge>
      ))}
      {value.length > 3 && (
        <Badge variant="secondary" className="text-xs">
          +{value.length - 3} more
        </Badge>
      )}
    </div>
  )
}

export function RolesGrid({ roles, isLoading }: RolesGridProps) {
  const columnDefs = useMemo<ColDef<UserRole>[]>(
    () => [
      {
        headerName: 'Role Name',
        field: 'name',
        cellRenderer: (params: any) => <RoleNameBadge {...params} />,
        filter: 'agTextColumnFilter',
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: 'Description',
        field: 'description',
        filter: 'agTextColumnFilter',
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: 'Scopes',
        field: 'scopes',
        cellRenderer: (params: any) => <ScopesBadge {...params} />,
        minWidth: 250,
        flex: 2,
      },
      {
        headerName: 'Created By',
        field: 'created_by',
        filter: 'agTextColumnFilter',
        flex: 1,
        minWidth: 150,
      },
    ],
    []
  )

  return (
    <CustomGrid<UserRole>
      rowData={roles}
      columnDefs={columnDefs}
      loading={isLoading}
      pagination={true}
      paginationPageSize={10}
      paginationPageSizeSelector={[5, 10, 20]}
      defaultColDef={{
        sortable: true,
        resizable: true,
        filter: true,
      }}
      domLayout="autoHeight"
      enableSearch={true}
    />
  )
}
