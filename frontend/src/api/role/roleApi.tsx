import { useAuth } from "@/hooks/useAuth";
import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseQueryResult,
} from "@tanstack/react-query";
import type {
    Role,
    RoleApi,
    Message,
    RoleCreateRequest,
    RoleUpdateRequest
} from "./model";

export const roleApi = (): RoleApi => {
    const { authGet, authPost, authPut, authDelete, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const baseUrl = "role";

    // Query hooks
    const useAllRolesQuery = (skip: number = 0, limit: number = 100): UseQueryResult<Role[], Error> =>
        useQuery({
            queryKey: ["allRoles", skip, limit],
            queryFn: async () => {
                return await authGet<Role[]>(`${baseUrl}/all`, {
                    params: { skip, limit }
                });
            },
            enabled: isAuthenticated,
        });

    const useRoleByIdQuery = (roleId: string, enabled: boolean = true): UseQueryResult<Role, Error> =>
        useQuery({
            queryKey: ["roleById", roleId],
            queryFn: async () => {
                return await authGet<Role>(`${baseUrl}/by_id/${roleId}`);
            },
            enabled: isAuthenticated && enabled && !!roleId,
        });

    // Mutations
    const createRole = useMutation<Role, Error, RoleCreateRequest>({
        mutationFn: async (roleData) => authPost<Role>(
            `${baseUrl}/create`,
            roleData
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allRoles"] });
        }
    });

    const updateRole = useMutation<Role, Error, RoleUpdateRequest>({
        mutationFn: async ({ id, ...roleData }) => authPut<Role>(
            `${baseUrl}/update/${id}`,
            roleData
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allRoles"] });
            queryClient.invalidateQueries({ queryKey: ["roleById"] });
        }
    });

    const deleteRole = useMutation<Message, Error, string>({
        mutationFn: async (roleId) => authDelete<Message>(
            `${baseUrl}/delete/${roleId}`
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allRoles"] });
        }
    });

    return {
        useAllRolesQuery,
        useRoleByIdQuery,
        createRole,
        updateRole,
        deleteRole,
    };
};