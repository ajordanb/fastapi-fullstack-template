import { useMemo } from 'react'
import { type ColDef } from 'ag-grid-community'
import { type Job } from '@/api/dramatiq/model'
import {
  StatusBadge,
  MessageIdCell,
  CreatedAtCell,
  ActionButtons,
} from './customJobCellRenderers'
import CustomGrid from "@/components/grid/customGrid.tsx";

interface JobsGridProps {
  jobs: Job[]
  isLoading: boolean
  onViewDetails: (messageId: string) => void
  onRetry: (messageId: string) => void
  onCancel: (messageId: string) => void
}

export function JobsGrid({
  jobs,
  isLoading,
  onViewDetails,
  onRetry,
  onCancel,
}: JobsGridProps) {
  const columnDefs = useMemo<ColDef<Job>[]>(
    () => [
      {
        headerName: 'Message ID',
        field: 'message_id',
        cellRenderer: (params: any) => <MessageIdCell messageId={params.value} />,
        filter: 'agTextColumnFilter',
        width: 150,
      },
      {
        headerName: 'Actor',
        field: 'actor_name',
        filter: 'agTextColumnFilter',
        flex: 1,
        minWidth: 200,
      },
      {
        headerName: 'Queue',
        field: 'queue_name',
        filter: 'agTextColumnFilter',
        width: 120,
      },
      {
        headerName: 'Status',
        field: 'status',
        cellRenderer: (params: any) => <StatusBadge status={params.value} />,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['pending', 'running', 'completed', 'failed'],
        },
        width: 130,
      },
      {
        headerName: 'Created',
        field: 'created_at',
        cellRenderer: (params: any) => <CreatedAtCell createdAt={params.value} />,
        sort: 'desc',
        width: 180,
      },
      {
        headerName: 'Retries',
        field: 'retries',
        width: 100,
        valueFormatter: (params: any) => `${params.value || 0}/${params.data.max_retries || 3}`,
      },
      {
        headerName: 'Actions',
        field: 'message_id',
        cellRenderer: (params: any) => (
          <ActionButtons
            messageId={params.value}
            status={params.data.status}
            onViewDetails={onViewDetails}
            onRetry={onRetry}
            onCancel={onCancel}
          />
        ),
        width: 100,
        sortable: false,
        filter: false,
        pinned: 'right',
      },
    ],
    [onViewDetails, onRetry, onCancel]
  )

  return (
    <CustomGrid<Job>
      rowData={jobs}
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
    />
  )
}
