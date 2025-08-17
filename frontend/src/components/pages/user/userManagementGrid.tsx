import React, {useState, useCallback, useMemo, useEffect} from "react";
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
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const {setLoading} = useToast();

    const api = useApi()
    const {data: users, refetch, isLoading, isFetching} = api.user.useAllUsersQuery();
    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columnDefs = useMemo<ColDef[]>(
        () => [
            {
                field: "name",
                headerName: "Name",
                sortable: true,
                filter: true,
                minWidth: 120,
                flex: 1,
            },

            {
                field: "email",
                headerName: "Email",
                sortable: true,
                filter: true,
                minWidth: 180,
                flex: 2,
            },
            {
                field: "is_active",
                headerName: "Status",
                sortable: true,
                filter: true,
                cellRenderer: StatusBadge,
                width: 100,
                flex: 0,
            },
            {
                field: "email_confirmed",
                headerName: "Email Status",
                sortable: true,
                filter: true,
                cellRenderer: EmailConfirmationBadge,
                width: 120,
                flex: 0,
                hide: windowWidth < 1024,
            },
            {
                field: "source",
                headerName: "Source",
                sortable: true,
                filter: true,
                cellRenderer: SourceBadge,
                width: 100,
                flex: 0,
                hide: windowWidth < 1024,
            },
            {
                field: "roles",
                headerName: "Roles",
                sortable: false,
                filter: false,
                cellRenderer: RolesBadge,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: {
                    values: ['admin', 'user', 'manager', 'editor', 'viewer'],
                },
                editable: true,
                minWidth: 120,
                flex: 1,
                hide: windowWidth < 768,
                cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            },
            {
                field: "api_keys",
                headerName: "API Keys",
                sortable: false,
                filter: false,
                cellRenderer: ApiKeysBadge,
                width: 100,
                flex: 0,
                hide: windowWidth < 1024,
            },
            {
                field: "actions",
                headerName: "Actions",
                sortable: false,
                filter: false,
                cellRenderer: ActionButtons,
                width: 120,
                flex: 0,
                pinned: 'right',
            },
        ],
        [windowWidth]
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
                    height="calc(100vh - 300px)"
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