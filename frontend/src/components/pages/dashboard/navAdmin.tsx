import { type LucideIcon} from "lucide-react"
import {
    SidebarGroup,
} from "@/components/ui/sidebar.tsx"
import CollapsibleMenu from "@/components/collapsibleMenu.tsx";

export function NavAdmin({
                            items,
                        }: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    return (
        <SidebarGroup>
            <CollapsibleMenu items={items} label={"Admin"}/>
        </SidebarGroup>
    )
}

export default NavAdmin;