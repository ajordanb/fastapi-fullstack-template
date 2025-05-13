import React, { useState, useCallback, useMemo } from "react";
import CustomGrid from "@/components/grid/customGrid";
import {
  type ColDef,
} from "ag-grid-community";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  RefreshCw,
  UserPlus,
} from "lucide-react";

import type { User } from "@/api/user/model";
import { ActionButtons, ApiKeysBadge, EmailConfirmationBadge, RolesBadge, SourceBadge, StatusBadge } from "@/components/grid/customCellRenderers";
import {useApi} from "@/api/api.tsx";

const initialUsers: User[] = [
  {
    id: "1",
    username: "johndoe",
    email: "john.doe@example.com",
    is_active: true,
    name: "John Doe",
    source: "local",
    email_confirmed: true,
    roles: [
      {
        name: "admin",
        description: "Administrator",
        created_by: "system",
        scopes: ["users:read", "users:write"],
      },
    ],
    api_keys: [
      {
        id: "key1",
        client_id: "client1",
        scopes: ["api:read"],
        active: true,
      },
    ],
  },
  {
    id: "2",
    username: "janedoe",
    email: "jane.doe@example.com",
    is_active: true,
    name: "Jane Doe",
    source: "google",
    email_confirmed: true,
    roles: [
      {
        name: "user",
        description: "Standard User",
        created_by: "system",
        scopes: ["users:read"],
      },
    ],
  },
  {
    id: "3",
    username: "bobsmith",
    email: "bob.smith@example.com",
    is_active: false,
    name: "Bob Smith",
    source: "local",
    email_confirmed: false,
    roles: [
      {
        name: "user",
        description: "Standard User",
        created_by: "system",
        scopes: ["users:read"],
      },
    ],
  },
];

const UserManagementExample: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  const api = useApi()
  const { data: users, refetch, isLoading } = api.user.useAllUsersQuery();


  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAddUser = useCallback(() => {
    setIsAddUserDialogOpen(true);
  }, []);

  

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
              className="h-9 px-2 lg:px-3"
            >
              <RefreshCw className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Refresh</span>
            </Button>
            <Button onClick={handleAddUser} size="sm" className="h-9">
              <UserPlus className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Add User</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      {/* Card header remains the same */}
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <span>Loading users...</span>
          </div>
        ) : (
          <CustomGrid
            rowData={users}
            columnDefs={columnDefs}
            height="600px"
            searchText={searchText}
            onSearchChange={setSearchText}
            enableSearch={true}
            darkMode={false}
            pagination={true}
            paginationPageSize={10}
          />
        )}
      </CardContent>
   
    </Card>
  );
};

export default UserManagementExample;