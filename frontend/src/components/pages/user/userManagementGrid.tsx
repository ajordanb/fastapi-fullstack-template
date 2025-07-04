import React, {useState, useCallback, useMemo} from "react";
import CustomGrid from "@/components/grid/customGrid.tsx";
import {
    type ColDef,
} from "ag-grid-community";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

import {
    RefreshCw,
    UserPlus,
} from "lucide-react";

import {
    ActionButtons,
    ApiKeysBadge,
    EmailConfirmationBadge,
    RolesBadge,
    SourceBadge,
    StatusBadge
} from "@/components/pages/user/customCellRenderers.tsx";
import {useApi} from "@/api/api.tsx";
import CustomModal from "@/components/customModal.tsx";
import {Spin} from "antd";
import AddUserDialog from "@/components/pages/user/addUserDialog.tsx";
import {useToast} from "@/hooks/useToast.tsx";


const UserManagementExample: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const {setLoading } = useToast();

    const api = useApi()
    const {data: users, refetch, isLoading, isFetching} = api.user.useAllUsersQuery();
    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const columnDefs = useMemo<ColDef[]>(
        () => [
            {
                headerName: "User Information",
                children: [
                    {
                        field: "name",
                        headerName: "Name",
                        sortable: true,
                        filter: true,
                    },
                    {
                        field: "username",
                        headerName: "Username",
                        sortable: true,
                        filter: true,
                    },
                    {
                        field: "email",
                        headerName: "Email",
                        sortable: true,
                        filter: true,
                    },
                ],
            },
            {
                headerName: "Status",
                children: [
                    {
                        field: "is_active",
                        headerName: "Status",
                        sortable: true,
                        filter: true,
                        cellRenderer: StatusBadge,
                    },
                    {
                        field: "email_confirmed",
                        headerName: "Email Status",
                        sortable: true,
                        filter: true,
                        cellRenderer: EmailConfirmationBadge,
                    },
                    {
                        field: "source",
                        headerName: "Source",
                        sortable: true,
                        filter: true,
                        cellRenderer: SourceBadge,
                    },
                ],
            },
            {
                headerName: "Access Control",
                children: [
                    {
                        field: "roles",
                        headerName: "Roles",
                        sortable: false,
                        filter: false,
                        cellRenderer: RolesBadge,
                    },
                    {
                        field: "api_keys",
                        headerName: "API Keys",
                        sortable: false,
                        filter: false,
                        cellRenderer: ApiKeysBadge,
                    },

                ],
            },
            {
                field: "actions",
                headerName: "Actions",
                sortable: false,
                filter: false,
                cellRenderer: ActionButtons,
                pinned: "right",
            },

        ],
        []
    );

    setLoading("Loading user data", isLoading)

    return (
 <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                            Manage system users, roles, and permissions
                        </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRefresh}
                            className="cursor-pointer h-9 px-2 lg:px-3"
                        >
                            {isLoading || isFetching ? (
                                <div className="flex justify-center items-center h-96">
                                    <Spin/>
                                </div>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 lg:mr-2"/>
                                    <span className="hidden lg:inline">Refresh</span>
                                </>
                            )}

                        </Button>
                        <CustomModal
                            id="add-user-modal"
                            title="Add user"
                            component={
                                <Button className="cursor-pointer">
                                    <UserPlus className="h-4 w-4 lg:mr-2"/>
                                </Button>
                            }
                        >
                            <AddUserDialog onSubmit={() => console.log('submit')}/>
                        </CustomModal>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CustomGrid
                    rowData={users ? users : []}
                    columnDefs={columnDefs}
                    height="600px"
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    enableSearch={true}
                    darkMode={false}
                    pagination={true}
                    paginationPageSize={10}
                />
            </CardContent>

        </Card>
    );
};

export default UserManagementExample;