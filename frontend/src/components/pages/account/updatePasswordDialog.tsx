import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useApi } from '@/api/api'
import { useToast } from '@/hooks/useToast'
import { Lock } from 'lucide-react'

interface UpdatePasswordDialogProps {
  triggerComponent: React.ReactElement
}

export function UpdatePasswordDialog({ triggerComponent }: UpdatePasswordDialogProps) {
  const { user } = useApi()
  const { toast, setLoading } = useToast()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const updatePasswordMutation = user.updateMyPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.new_password !== formData.confirm_password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New passwords do not match',
      })
      return
    }

    if (formData.new_password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password must be at least 8 characters',
      })
      return
    }

    try {
      await updatePasswordMutation.mutateAsync({
        current_password: formData.current_password,
        new_password: formData.new_password,
      })

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      })
      setOpen(false)
      setFormData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update password',
      })
    }
  }

  setLoading('Updating password', updatePasswordMutation.isPending)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Update Password
          </DialogTitle>
          <DialogDescription>
            Change your account password. Make sure it's strong and secure.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                value={formData.current_password}
                onChange={(e) =>
                  setFormData({ ...formData, current_password: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={formData.new_password}
                onChange={(e) =>
                  setFormData({ ...formData, new_password: e.target.value })
                }
                required
                minLength={8}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={(e) =>
                  setFormData({ ...formData, confirm_password: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePasswordMutation.isPending}>
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
