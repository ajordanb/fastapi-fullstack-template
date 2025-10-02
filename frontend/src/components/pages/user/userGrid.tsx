import { useMemo } from 'react'
import { type ColDef } from 'ag-grid-community'
import { type User } from '@/api/user/model'
import {
  StatusBadge,
  EmailConfirmationBadge,
  SourceBadge,
  RolesBadge,
  ApiKeysBadge,
  ActionButtons,
} from './customCellRenderers'
import CustomGrid from '@/components/grid/customGrid'

interface UserGridProps {
  users: User[]
  isLoading: boolean
  onRefresh?: () => void
}

export function UserGrid({ users, isLoading }: UserGridProps) {
  const columnDefs = useMemo<ColDef<User>[]>(
    () => [
      {
        headerName: 'Name',
        field: 'name',
        filter: 'agTextColumnFilter',
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: 'Email',
        field: 'email',
        filter: 'agTextColumnFilter',
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: 'Status',
        field: 'is_active',
        cellRenderer: (params: any) => <StatusBadge {...params} />,
        filter: 'agTextColumnFilter',
        width: 110,
      },
      {
        headerName: 'Email Status',
        field: 'email_confirmed',
        cellRenderer: (params: any) => <EmailConfirmationBadge {...params} />,
        filter: 'agTextColumnFilter',
        width: 130,
      },
      {
        headerName: 'Source',
        field: 'source',
        cellRenderer: (params: any) => <SourceBadge {...params} />,
        filter: 'agTextColumnFilter',
        width: 110,
      },
      {
        headerName: 'Roles',
        field: 'roles',
        cellRenderer: (params: any) => <RolesBadge {...params} />,
        minWidth: 150,
        flex: 1,
      },
      {
        headerName: 'API Keys',
        field: 'api_keys',
        cellRenderer: (params: any) => <ApiKeysBadge {...params} />,
        width: 130,
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
    <CustomGrid<User>
      rowData={users}
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
