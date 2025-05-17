import React, {useState, useCallback, useMemo} from "react";
import CustomGrid from "@/components/grid/customGrid";
import {
    type ColDef,
} from "ag-grid-community";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

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
} from "@/components/user/customCellRenderers.tsx";
import {useApi} from "@/api/api.tsx";
import CustomModal from "@/components/customModal.tsx";
import {Spin} from "antd";
import AddUserDialog from "@/components/user/addUserDialog.tsx";


const UserManagementExample: React.FC = () => {
    const [searchText, setSearchText] = useState("");

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
                            variant="outline"
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
                            modalContent={<AddUserDialog onSubmit={() => console.log('submit')}/>}
                        >
                            {(openFn) => (
                                <Button className="cursor-pointer" onClick={openFn}>
                                    <UserPlus className="h-4 w-4 lg:mr-2"/>
                                </Button>
                            )}
                        </CustomModal>
                    </div>
                </div>
            </CardHeader>
            {/* Card header remains the same */}
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