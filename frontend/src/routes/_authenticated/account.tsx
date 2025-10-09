import { createFileRoute } from '@tanstack/react-router'
import { AccountManagement } from '@/components/pages/account/accountManagement'

export const Route = createFileRoute('/_authenticated/account')({
  component: AccountPage,
})

function AccountPage() {
  return <AccountManagement />
}
