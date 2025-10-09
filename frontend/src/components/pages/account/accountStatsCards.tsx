import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Shield, Key, Calendar } from 'lucide-react'

interface AccountStatsCardsProps {
  totalRoles: number
  totalApiKeys: number
  activeApiKeys: number
  accountAge: string
}

export function AccountStatsCards({
  totalRoles,
  totalApiKeys,
  activeApiKeys,
  accountAge,
}: AccountStatsCardsProps) {
  const stats = [
    {
      title: 'Account Status',
      value: 'Active',
      icon: User,
      description: 'Your account is active',
    },
    {
      title: 'Assigned Roles',
      value: totalRoles.toString(),
      icon: Shield,
      description: 'Roles assigned to your account',
    },
    {
      title: 'API Keys',
      value: `${activeApiKeys}/${totalApiKeys}`,
      icon: Key,
      description: 'Active API keys',
    },
    {
      title: 'Member Since',
      value: accountAge,
      icon: Calendar,
      description: 'Account creation date',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
