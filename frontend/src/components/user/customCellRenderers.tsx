import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import type {ICellRendererParams} from "ag-grid-community";
import {CheckCircle, Edit, Key, MoreHorizontal, Trash2, UserPlus, XCircle} from "lucide-react";
import type {ApiKey, User, UserRole} from "@/api/user/model.tsx";
import React, {useState} from "react";
import {Button} from "../ui/button.tsx";
import CustomModal from "@/components/customModal.tsx";
import AddUserDialog from "@/components/user/addUserDialog.tsx";


export const StatusBadge: React.FC<ICellRendererParams> = (params) => {
    const isActive = params.value;

    return isActive ? (
        <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
        >
            <CheckCircle className="h-3.5 w-3.5 mr-1"/>
            Active
        </Badge>
    ) : (
        <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 hover:bg-red-100"
        >
            <XCircle className="h-3.5 w-3.5 mr-1"/>
            Inactive
        </Badge>
    );
};

export const EmailConfirmationBadge: React.FC<ICellRendererParams> = (params) => {
    const isConfirmed = params.value;

    return isConfirmed ? (
        <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
        >
            Verified
        </Badge>
    ) : (
        <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"
        >
            Unverified
        </Badge>
    );
};

export const SourceBadge: React.FC<ICellRendererParams> = (params) => {
    const source = params.value as string;

    switch (source.toLowerCase()) {
        case "google":
            return (
                <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                    Google
                </Badge>
            );
        case "github":
            return (
                <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50"
                >
                    GitHub
                </Badge>
            );
        case "local":
            return (
                <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50"
                >
                    Local
                </Badge>
            );
        default:
            return (
                <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50"
                >
                    {source}
                </Badge>
            );
    }
};


export const RolesBadge: React.FC<ICellRendererParams> = (params) => {
    const roles = params.value as UserRole[];

    if (!roles || roles.length === 0) {
        return <span className="text-gray-400">No roles</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
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

export const ApiKeysBadge: React.FC<ICellRendererParams> = (params) => {
    const apiKeys = params.value as ApiKey[] | undefined;

    if (!apiKeys || apiKeys.length === 0) {
        return <span className="text-gray-400">No API keys</span>;
    }

    const activeKeys = apiKeys.filter((key) => key.active).length;

    return (
        <Badge
            variant="outline"
            className="bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-50"
        >
            <Key className="h-3.5 w-3.5 mr-1"/>
            {activeKeys} active key{activeKeys !== 1 ? "s" : ""}
        </Badge>
    );
};

export const ActionButtons: React.FC<ICellRendererParams> = (params) => {
    const user = params.data as User;
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    const handleDelete = () => {
        setIsDeleteAlertOpen(true);
    };

    const confirmDelete = () => {
        // Implementation: Call API to delete user
        console.log(`Delete user: ${user.username}`);
        setIsDeleteAlertOpen(false);
    };

    const handleToggleStatus = () => {
        console.log(
            `Toggle status for user: ${user.username} to ${!user.is_active}`
        );
    };

    const handleManageApiKeys = () => {
        console.log(`Manage API keys for user: ${user.username}`);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <CustomModal
                        id="edit-user-modal"
                        title="Edit user"
                        modalContent={<AddUserDialog onSubmit={() => console.log('submit')}/>}
                    >
                        {(openFn) => (
                            <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFn();
                            }}>
                                <Edit className="h-4 w-4 mr-2"/>
                                Edit user
                            </DropdownMenuItem>
                        )}
                    </CustomModal>

                    <DropdownMenuItem onClick={handleToggleStatus}>
                        {user.is_active ? (
                            <>
                                <XCircle className="h-4 w-4 mr-2"/>
                                Deactivate
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2"/>
                                Activate
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleManageApiKeys}>
                        <Key className="h-4 w-4 mr-2"/>
                        Manage API keys
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="h-4 w-4 mr-2"/>
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
                            This action will permanently delete the user{" "}
                            <strong>{user.name}</strong> ({user.email}). This action cannot be
                            undone.
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