import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccountStatsCards } from './accountStatsCards'
import { ProfileUpdateForm } from './profileUpdateForm'
import { UpdatePasswordDialog } from './updatePasswordDialog'
import { RefreshCw, Lock } from 'lucide-react'
import { useApi } from '@/api/api'
import { useToast } from '@/hooks/useToast'

export function AccountManagement() {
  const { user } = useApi()
  const { setLoading } = useToast()

  // Fetch current user profile
  const { data: currentUser, isLoading, refetch } = user.useUserProfileQuery()

  // Set loading state
  setLoading('Loading account information', isLoading)

  // Calculate stats from current user
  const stats = useMemo(() => {
    if (!currentUser) {
      return {
        totalRoles: 0,
        totalApiKeys: 0,
        activeApiKeys: 0,
        accountAge: 'N/A',
      }
    }

    const totalApiKeys = currentUser.api_keys?.length || 0
    const activeApiKeys = currentUser.api_keys?.filter((key) => key.active).length || 0

    return {
      totalRoles: currentUser.roles?.length || 0,
      totalApiKeys,
      activeApiKeys,
      accountAge: 'Active', // You can format a date here if you have a created_at field
    }
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading account information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account Management</h1>
          <p className="text-muted-foreground">
            Manage your profile, security settings, and access controls
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AccountStatsCards
        totalRoles={stats.totalRoles}
        totalApiKeys={stats.totalApiKeys}
        activeApiKeys={stats.activeApiKeys}
        accountAge={stats.accountAge}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <ProfileUpdateForm user={currentUser} onSuccess={() => refetch()} />

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View your account details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs break-all">{currentUser.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Source</p>
                  <p className="font-medium capitalize">{currentUser.source}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Status</p>
                  <p className="font-medium">
                    {currentUser.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email Verification</p>
                  <p className="font-medium">
                    {currentUser.email_confirmed ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password & Authentication
              </CardTitle>
              <CardDescription>
                Manage your password and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated: Not tracked
                    </p>
                  </div>
                  <UpdatePasswordDialog
                    triggerComponent={
                      <Button variant="outline" size="sm">
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
