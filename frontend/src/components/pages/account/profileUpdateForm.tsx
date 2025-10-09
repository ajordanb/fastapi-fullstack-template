import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApi } from '@/api/api'
import { useToast } from '@/hooks/useToast'
import { type User } from '@/api/user/model'
import { UserCircle } from 'lucide-react'

interface ProfileUpdateFormProps {
  user: User
  onSuccess?: () => void
}

export function ProfileUpdateForm({ user, onSuccess }: ProfileUpdateFormProps) {
  const { user: userApi } = useApi()
  const { toast, setLoading } = useToast()
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    email: user.email || '',
  })

  const updateProfileMutation = userApi.updateMyProfile

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateProfileMutation.mutateAsync({
        ...user,
        name: formData.name,
        username: formData.username,
        email: formData.email,
      })

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
      onSuccess?.()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile',
      })
    }
  }

  setLoading('Updating profile', updateProfileMutation.isPending)

  const hasChanges =
    formData.name !== (user.name || '') ||
    formData.username !== (user.username || '') ||
    formData.email !== (user.email || '')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
            />
            {!user.email_confirmed && (
              <p className="text-xs text-amber-600">
                Email not verified. Please check your inbox for verification link.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  name: user.name || '',
                  username: user.username || '',
                  email: user.email || '',
                })
              }
              disabled={!hasChanges}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!hasChanges || updateProfileMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
