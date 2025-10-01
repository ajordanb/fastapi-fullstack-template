import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, RotateCcw, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface JobStatus {
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export function StatusBadge({ status }: JobStatus) {
  const statusConfig = {
    pending: { label: 'Pending', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
    running: { label: 'Running', variant: 'default' as const, className: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Completed', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

interface MessageIdCellProps {
  messageId: string
}

export function MessageIdCell({ messageId }: MessageIdCellProps) {
  const shortId = messageId.substring(0, 8)
  return (
    <span className="font-mono text-sm" title={messageId}>
      {shortId}...
    </span>
  )
}

interface CreatedAtCellProps {
  createdAt: string | null
}

export function CreatedAtCell({ createdAt }: CreatedAtCellProps) {
  if (!createdAt) return <span className="text-muted-foreground">-</span>

  try {
    const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    return (
      <span className="text-sm" title={createdAt}>
        {timeAgo}
      </span>
    )
  } catch {
    return <span className="text-sm">{createdAt}</span>
  }
}

interface ActionButtonsProps {
  messageId: string
  status: string
  onViewDetails: (messageId: string) => void
  onRetry: (messageId: string) => void
  onCancel: (messageId: string) => void
}

export function ActionButtons({
  messageId,
  status,
  onViewDetails,
  onRetry,
  onCancel,
}: ActionButtonsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(messageId)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {status === 'failed' && (
          <DropdownMenuItem onClick={() => onRetry(messageId)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Job
          </DropdownMenuItem>
        )}
        {status === 'pending' && (
          <DropdownMenuItem onClick={() => onCancel(messageId)} className="text-destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Job
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
