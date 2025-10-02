import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Lock, Hash } from 'lucide-react'

interface RoleStatsCardsProps {
  totalRoles: number
  systemRoles: number
  customRoles: number
  totalScopes: number
}

export function RoleStatsCards({
  totalRoles,
  systemRoles,
  customRoles,
  totalScopes,
}: RoleStatsCardsProps) {
  const stats = [
    {
      title: 'Total Roles',
      value: totalRoles,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'System Roles',
      value: systemRoles,
      icon: Lock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Custom Roles',
      value: customRoles,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Scopes',
      value: totalScopes,
      icon: Hash,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
