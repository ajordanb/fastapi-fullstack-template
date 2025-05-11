"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  LayoutDashboardIcon,
  UsersIcon,
} from "lucide-react"

import { NavMain } from "@/components/dashboard/navMain"
import { NavUser } from "@/components/dashboard/navUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useApi } from "@/api/api"


const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Team",
      url: "#",
      icon: UsersIcon,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const api = useApi();
  const { data: user, isLoading } = api.user.useUserProfileQuery();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {!isLoading && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
