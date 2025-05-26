import React, {useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

export interface UserFormData {
    name: string;
    email: string;
    username: string;
    roles: {
        user: boolean;
        admin: boolean;
    };
    is_active: boolean;
}

interface AddUserDialogProps {
    onSubmit: (userData: UserFormData) => void;
    initialData?: Partial<UserFormData>;
}

const defaultFormData: UserFormData = {
    name: "",
    email: "",
    username: "",
    roles: {
        user: false,
        admin: false,
    },
    is_active: true,
};

const AddUserDialog: React.FC<AddUserDialogProps> = ({
                                                         onSubmit,
                                                         initialData = {},
                                                     }) => {
    const [formData, setFormData] = useState<UserFormData>({
        ...defaultFormData,
        ...initialData,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (

        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right text-sm font-medium">
                        Name
                    </label>
                    <Input
                        id="name"
                        placeholder="Full name"
                        className="col-span-3"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
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
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <label
                        htmlFor="username"
                        className="text-right text-sm font-medium"
                    >
                        Username
                    </label>
                    <Input
                        id="username"
                        placeholder="Username"
                        className="col-span-3"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right text-sm font-medium">Roles</div>
                    <div className="col-span-3 space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="role-user"
                                checked={formData.roles.user}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        roles: {
                                            ...prev.roles,
                                            user: checked === true
                                        }
                                    }))
                                }
                            />
                            <label
                                htmlFor="role-user"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                User
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="role-admin"
                                checked={formData.roles.admin}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        roles: {
                                            ...prev.roles,
                                            admin: checked === true
                                }
                                }))
                                }
                            />
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
                            <Checkbox
                                id="active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        is_active: checked === true  // Fixed from isActive to is_active
                                    }))
                                }
                            />
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
        </form>
    );
};

export default AddUserDialog;