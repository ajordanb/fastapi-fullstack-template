import { useMemo } from 'react'
import { type ColDef } from 'ag-grid-community'
import { type Role } from '@/api/role/model'
import {
  ScopesBadge,
  CreatedByBadge,
  ActionButtons,
} from './customCellRenderers'
import CustomGrid from '@/components/grid/customGrid'

interface RoleGridProps {
  roles: Role[]
  isLoading: boolean
  onRefresh?: () => void
}

export function RoleGrid({ roles, isLoading }: RoleGridProps) {
  const columnDefs = useMemo<ColDef<Role>[]>(
    () => [
      {
        headerName: 'Name',
        field: 'name',
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
        headerName: 'Created By',
        field: 'created_by',
        cellRenderer: (params: any) => <CreatedByBadge {...params} />,
        filter: 'agTextColumnFilter',
        width: 130,
      },
      {
        headerName: 'Scopes',
        field: 'scopes',
        cellRenderer: (params: any) => <ScopesBadge {...params} />,
        minWidth: 200,
        flex: 1,
      },
      {
        headerName: 'Actions',
        field: 'id',
        cellRenderer: (params: any) => <ActionButtons {...params} />,
        width: 80,
        sortable: false,
        filter: false,
        pinned: 'right',
      },
    ],
    []
  )

  return (
    <CustomGrid<Role>
      rowData={roles}
      columnDefs={columnDefs}
      loading={isLoading}
      pagination={true}
      paginationPageSize={20}
      paginationPageSizeSelector={[10, 20, 50, 100]}
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
