import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { type Job } from '@/api/dramatiq/model'
import { StatusBadge } from './customJobCellRenderers'
import { RotateCcw, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import CustomModal from '@/components/customModal'
import useModalContext from '@/hooks/useModal'

interface JobDetailModalProps {
  job: Job | null
  onRetry?: (messageId: string) => void
  triggerComponent: React.ReactElement
}

export function JobDetailModal({ job, onRetry, triggerComponent }: JobDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { closeModal } = useModalContext()
  const modalId = 'job-detail-modal'

  if (!job) return triggerComponent

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  return (
    <CustomModal
      id={modalId}
      title="Job Details"
      description="View detailed information about this background job"
      component={triggerComponent}
      width="90%"
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2">
          <StatusBadge status={job.status} />
        </div>
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Message ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs break-all">{job.message_id}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(job.message_id, 'message_id')}
                  >
                    {copiedField === 'message_id' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Actor Name</p>
                <p className="font-medium">{job.actor_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Queue Name</p>
                <p className="font-medium">{job.queue_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Retries</p>
                <p className="font-medium">
                  {job.retries || 0} / {job.max_retries || 3}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Timestamps</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {job.created_at && (
                <div>
                  <p className="text-muted-foreground">Created At</p>
                  <p className="font-mono text-xs">{new Date(job.created_at).toLocaleString()}</p>
                </div>
              )}
              {job.started_at && (
                <div>
                  <p className="text-muted-foreground">Started At</p>
                  <p className="font-mono text-xs">{new Date(job.started_at).toLocaleString()}</p>
                </div>
              )}
              {job.completed_at && (
                <div>
                  <p className="text-muted-foreground">Completed At</p>
                  <p className="font-mono text-xs">
                    {new Date(job.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
              {job.failed_at && (
                <div>
                  <p className="text-muted-foreground">Failed At</p>
                  <p className="font-mono text-xs">{new Date(job.failed_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Arguments */}
          {(job.args.length > 0 || Object.keys(job.kwargs).length > 0) && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Arguments</h3>
                {job.args.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Positional Arguments</p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                      {formatJson(job.args)}
                    </pre>
                  </div>
                )}
                {Object.keys(job.kwargs).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Keyword Arguments</p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                      {formatJson(job.kwargs)}
                    </pre>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Result */}
          {job.result && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Result</h3>
                <pre className="bg-green-50 dark:bg-green-950 p-3 rounded-md text-xs overflow-x-auto">
                  {formatJson(job.result)}
                </pre>
              </div>
              <Separator />
            </>
          )}

          {/* Error */}
          {job.error && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-destructive">Error</h3>
                <pre className="bg-red-50 dark:bg-red-950 p-3 rounded-md text-xs overflow-x-auto text-destructive">
                  {job.error}
                </pre>
              </div>
              <Separator />
            </>
          )}

          {/* Actions */}
          {job.status === 'failed' && onRetry && (
            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={() => {
                  onRetry(job.message_id)
                  closeModal(modalId)
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Job
              </Button>
            </div>
          )}
        </div>
    </CustomModal>
  )
}
