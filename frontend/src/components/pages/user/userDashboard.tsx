import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserStatsCards } from './userStatsCards'
import { UserGrid } from './userGrid'
import { UserFormDialog } from './userFormDialog'
import { RefreshCw, UserPlus } from 'lucide-react'
import { useApi } from '@/api/api'
import { useToast } from '@/hooks/useToast'

export function UserDashboard() {
  const { user } = useApi()
  const { setLoading } = useToast()

  // Fetch all users
  const { data: users, isLoading, refetch } = user.useAllUsersQuery()

  // Set loading state
  setLoading('Loading users', isLoading)

  // Calculate stats from users
  const stats = useMemo(() => {
    if (!users) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        verifiedEmails: 0,
      }
    }

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.is_active).length,
      inactiveUsers: users.filter((u) => !u.is_active).length,
      verifiedEmails: users.filter((u) => u.email_confirmed).length,
    }
  }, [users])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <UserFormDialog
            mode="create"
            triggerComponent={
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            }
            onSuccess={() => refetch()}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards
        totalUsers={stats.totalUsers}
        activeUsers={stats.activeUsers}
        inactiveUsers={stats.inactiveUsers}
        verifiedEmails={stats.verifiedEmails}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserGrid
            users={users || []}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </CardContent>
      </Card>
    </div>
  )
}
