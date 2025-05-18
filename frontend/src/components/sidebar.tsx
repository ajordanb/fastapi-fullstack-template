import * as React from "react"
import {
    ArrowUpCircleIcon,
    UserIcon
} from "lucide-react"

import {NavAdmin} from "@/components/dashboard/navAdmin.tsx"
import {NavUser} from "@/components/dashboard/navUser"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {useApi} from "@/api/api"
import { Link } from "@tanstack/react-router"

const data = {
    navAdmin: [
        {
            title: "Users",
            url: "#",
            icon: UserIcon,
            items: [
                {
                    title: "Manage Users",
                    url: "/admin/users",
                },
                      {
                    title: "Manage Roles",
                    url: "/admin/roles",
                }
            ]
        },
    ]
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const api = useApi();
    const {data: user, isLoading} = api.user.useUserProfileQuery();
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link to="/">
                                <ArrowUpCircleIcon className="h-5 w-5"/>
                                <span className="text-base font-semibold">App Template</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavAdmin items={data.navAdmin}/>
            </SidebarContent>
            <SidebarFooter>
                {!isLoading && <NavUser user={user}/>}
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar
