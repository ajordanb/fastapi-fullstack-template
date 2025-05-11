import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeBalham, themeQuartz } from 'ag-grid-community';
import { 
   type GridApi, 
   type GridReadyEvent, 
   type ICellRendererParams, 
   type ColDef,
   ClientSideRowModelModule,
   ModuleRegistry,
   ColumnAutoSizeModule
} from 'ag-grid-community';
import { useApi } from '@/api/api';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Button,
  buttonVariants
} from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  RefreshCw,
  Search,
  UserPlus,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  Key
} from 'lucide-react';

import type { User, UserRole, ApiKey } from '@/api/user/model';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule]);


// Sample data - replace with your API call
const initialUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john.doe@example.com',
    is_active: true,
    name: 'John Doe',
    source: 'local',
    email_confirmed: true,
    roles: [
      {
        name: 'admin',
        description: 'Administrator',
        created_by: 'system',
        scopes: ['users:read', 'users:write']
      }
    ],
    api_keys: [
      {
        id: 'key1',
        client_id: 'client1',
        scopes: ['api:read'],
        active: true
      }
    ]
  },
  {
    id: '2',
    username: 'janedoe',
    email: 'jane.doe@example.com',
    is_active: true,
    name: 'Jane Doe',
    source: 'google',
    email_confirmed: true,
    roles: [
      {
        name: 'user',
        description: 'Standard User',
        created_by: 'system',
        scopes: ['users:read']
      }
    ]
  },
  {
    id: '3',
    username: 'bobsmith',
    email: 'bob.smith@example.com',
    is_active: false,
    name: 'Bob Smith',
    source: 'local',
    email_confirmed: false,
    roles: [
      {
        name: 'user',
        description: 'Standard User',
        created_by: 'system',
        scopes: ['users:read']
      }
    ]
  }
];

// Status Badge component
const StatusBadge: React.FC<ICellRendererParams> = (params) => {
  const isActive = params.value;
  
  return isActive ? (
    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
      <CheckCircle className="h-3.5 w-3.5 mr-1" />
      Active
    </Badge>
  ) : (
    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
      <XCircle className="h-3.5 w-3.5 mr-1" />
      Inactive
    </Badge>
  );
};

// Email Confirmation Badge component
const EmailConfirmationBadge: React.FC<ICellRendererParams> = (params) => {
  const isConfirmed = params.value;
  
  return isConfirmed ? (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
      Verified
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
      Unverified
    </Badge>
  );
};

// Source Badge component
const SourceBadge: React.FC<ICellRendererParams> = (params) => {
  const source = params.value as string;
  
  switch(source.toLowerCase()) {
    case 'google':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
          Google
        </Badge>
      );
    case 'github':
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50">
          GitHub
        </Badge>
      );
    case 'local':
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50">
          Local
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50">
          {source}
        </Badge>
      );
  }
};

// Roles Badge component
const RolesBadge: React.FC<ICellRendererParams> = (params) => {
  const roles = params.value as UserRole[];
  
  if (!roles || roles.length === 0) {
    return <span className="text-gray-400">No roles</span>;
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map(role => (
        <Badge 
          key={role.name} 
          variant="outline"
          className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
        >
          {role.name}
        </Badge>
      ))}
    </div>
  );
};

// API Keys component
const ApiKeysBadge: React.FC<ICellRendererParams> = (params) => {
  const apiKeys = params.value as ApiKey[] | undefined;
  
  if (!apiKeys || apiKeys.length === 0) {
    return <span className="text-gray-400">No API keys</span>;
  }
  
  const activeKeys = apiKeys.filter(key => key.active).length;
  
  return (
    <Badge 
      variant="outline"
      className="bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-50"
    >
      <Key className="h-3.5 w-3.5 mr-1" />
      {activeKeys} active key{activeKeys !== 1 ? 's' : ''}
    </Badge>
  );
};

// Action Buttons component
const ActionButtons: React.FC<ICellRendererParams> = (params) => {
  const user = params.data as User;
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  const handleEdit = () => {
    // Implementation: Open edit modal or navigate to edit page
    console.log(`Edit user: ${user.username}`);
  };
  
  const handleDelete = () => {
    setIsDeleteAlertOpen(true);
  };
  
  const confirmDelete = () => {
    // Implementation: Call API to delete user
    console.log(`Delete user: ${user.username}`);
    setIsDeleteAlertOpen(false);
  };
  
  const handleToggleStatus = () => {
    // Implementation: Call API to toggle user status
    console.log(`Toggle status for user: ${user.username} to ${!user.is_active}`);
  };
  
  const handleManageApiKeys = () => {
    // Implementation: Open modal to manage API keys
    console.log(`Manage API keys for user: ${user.username}`);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit user
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {user.is_active ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleManageApiKeys}>
            <Key className="h-4 w-4 mr-2" />
            Manage API keys
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Delete confirmation alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user <strong>{user.name}</strong> ({user.email}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const UserManagementGrid: React.FC = () => {
  const api = useApi();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  // Fetch users data from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Replace with your API call
      // const { data: fetchedUsers } = await api.userManagement.getUsers();
      // setUsers(fetchedUsers);
      
      // Using sample data for now
      setUsers(initialUsers);
      
      // Optional - using your UserApi
      // const { data: profile } = api.user.useUserProfileQuery();
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Search functionality
  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, []);
  
  useEffect(() => {
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', searchText);
    }
  }, [searchText, gridApi]);
  
  // Grid ready event handler
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);
  
  // Column definitions
  const columnDefs = useMemo<ColDef[]>(() => [
    { 
      headerName: 'User Information', 
      children: [
        { 
          field: 'name', 
          headerName: 'Name', 
          sortable: true, 
          filter: true,
          width: 180,
          cellStyle: { fontWeight: 500 },
          pinned: 'left'
        },
        { 
          field: 'username', 
          headerName: 'Username', 
          sortable: true, 
          filter: true,
          width: 150
        },
        { 
          field: 'email', 
          headerName: 'Email', 
          sortable: true, 
          filter: true,
          width: 220
        }
      ]
    },
    { 
      headerName: 'Status', 
      children: [
        { 
          field: 'is_active', 
          headerName: 'Status', 
          sortable: true, 
          filter: true,
          width: 120,
          cellRenderer: StatusBadge
        },
        { 
          field: 'email_confirmed', 
          headerName: 'Email Status', 
          sortable: true, 
          filter: true,
          width: 130,
          cellRenderer: EmailConfirmationBadge
        },
        { 
          field: 'source', 
          headerName: 'Source', 
          sortable: true, 
          filter: true,
          width: 120,
          cellRenderer: SourceBadge
        }
      ]
    },
    { 
      headerName: 'Access Control', 
      children: [
        { 
          field: 'roles', 
          headerName: 'Roles', 
          sortable: false, 
          filter: false,
          width: 180,
          cellRenderer: RolesBadge
        },
        { 
          field: 'api_keys', 
          headerName: 'API Keys', 
          sortable: false, 
          filter: false,
          width: 140,
          cellRenderer: ApiKeysBadge
        }
      ]
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      sortable: false, 
      filter: false,
      width: 100,
      cellRenderer: ActionButtons,
      pinned: 'right'
    }
  ], []);
  
  // Refresh grid data
  const handleRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Add new user dialog
  const handleAddUser = useCallback(() => {
    setIsAddUserDialogOpen(true);
  }, []);
  
  // Default column definitions
  const defaultColDef = useMemo(() => ({
    resizable: true,
    suppressMovable: true
  }), []);

  const customTheme = themeQuartz
	.withParams({
        backgroundColor: "#1f2836",
        browserColorScheme: "dark",
        chromeBackgroundColor: {
            ref: "foregroundColor",
            mix: 0.07,
            onto: "backgroundColor"
        },
        foregroundColor: "#FFF",
        headerFontSize: 14
    });
  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage system users, roles, and permissions</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-8 h-9 md:w-[200px] lg:w-[300px]"
                value={searchText}
                onChange={onSearchChange}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-9 px-2 lg:px-3"
            >
              <RefreshCw className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Refresh</span>
            </Button>
            <Button
              onClick={handleAddUser}
              size="sm"
              className="h-9"
            >
              <UserPlus className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Add User</span>
            </Button>
          </div>
        </div>
      </CardHeader>
        <div className="h-[600px] w-full">
          <AgGridReact
            theme={customTheme}
            modules={[ClientSideRowModelModule, ColumnAutoSizeModule]}
            columnDefs={columnDefs}
            rowData={users}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            animateRows={true}
            rowSelection="multiple"
            pagination={true}
            paginationPageSize={10}
            suppressCellFocus={true}
            enableCellTextSelection={true}
            loadingOverlayComponent="loadingOverlayComponent"
            loadingOverlayComponentParams={{ loadingMessage: 'Loading users...' }}
            suppressRowVirtualisation={false}
            rowBuffer={10}
          />
        </div>
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. They'll receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="Full name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="Username"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm font-medium">Roles</div>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="role-user" />
                  <label
                    htmlFor="role-user"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    User
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="role-admin" />
                  <label
                    htmlFor="role-admin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Admin
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm font-medium">Options</div>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="active" defaultChecked />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Active account
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagementGrid;