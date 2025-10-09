import { useMemo, useState } from 'react'
import { type ColDef } from 'ag-grid-community'
import { type ApiKey } from '@/api/user/model'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check, Trash2 } from 'lucide-react'
import CustomGrid from '@/components/grid/customGrid'
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
import { useApi } from '@/api/api'
import { useToast } from '@/hooks/useToast'

interface ApiKeysGridProps {
  apiKeys: ApiKey[]
  isLoading: boolean
  onRefresh?: () => void
}

function StatusBadge({ value }: { value: boolean }) {
  return (
    <Badge variant={value ? 'default' : 'secondary'} className="capitalize">
      {value ? 'Active' : 'Inactive'}
    </Badge>
  )
}

function ScopesBadge({ value }: { value: string[] }) {
  if (!value || value.length === 0) {
    return <span className="text-sm text-muted-foreground">No scopes</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {value.slice(0, 2).map((scope) => (
        <Badge key={scope} variant="outline" className="text-xs">
          {scope}
        </Badge>
      ))}
      {value.length > 2 && (
        <Badge variant="outline" className="text-xs">
          +{value.length - 2} more
        </Badge>
      )}
    </div>
  )
}

function ClientIdRenderer({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs truncate max-w-[200px]">{value}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  )
}

function ActionButtons({ data, onDelete }: { data: ApiKey; onDelete: (id: string) => void }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone
              and will immediately revoke access for any applications using this key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(data.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function ApiKeysGrid({ apiKeys, isLoading, onRefresh }: ApiKeysGridProps) {
  const { user } = useApi()
  const { toast, setLoading } = useToast()
  const deleteApiKeyMutation = user.deleteApiKey

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKeyMutation.mutateAsync(id)
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      })
      onRefresh?.()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete API key',
      })
    }
  }

  setLoading('Deleting API key', deleteApiKeyMutation.isPending)

  const columnDefs = useMemo<ColDef<ApiKey>[]>(
    () => [
      {
        headerName: 'Client ID',
        field: 'client_id',
        cellRenderer: (params: any) => <ClientIdRenderer {...params} />,
        filter: 'agTextColumnFilter',
        flex: 2,
        minWidth: 250,
      },
      {
        headerName: 'Status',
        field: 'active',
        cellRenderer: (params: any) => <StatusBadge {...params} />,
        filter: 'agTextColumnFilter',
        width: 110,
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
        cellRenderer: (params: any) => (
          <ActionButtons {...params} onDelete={handleDelete} />
        ),
        width: 80,
        sortable: false,
        filter: false,
        pinned: 'right',
      },
    ],
    [handleDelete]
  )

  return (
    <CustomGrid<ApiKey>
      rowData={apiKeys}
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
