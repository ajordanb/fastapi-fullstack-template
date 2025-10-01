import { useAuth } from "@/hooks/useAuth";
import {
    useMutation,
    useQuery,
    type UseQueryResult,
} from "@tanstack/react-query";
import type {
    User,
    UserApi,
    Message,
    UserCreateRequest,
    UpdatePasswordRequest,
    ResetPasswordRequest,
    CreateApiKeyRequest,
    UpdateApiKeyRequest,
    ApiKey
} from "./model";

export const userApi = (): UserApi => {
    const { authGet, authPost, authPut, authDelete, isAuthenticated } = useAuth();
    const baseUrl = "user";

    // Query hooks
    const useUserProfileQuery = (): UseQueryResult<User, Error> =>
        useQuery({
            queryKey: ["profile"],
            queryFn: async () => {
                return await authGet<User>(`${baseUrl}/me`);
            },
            enabled: isAuthenticated,
        });

    const useAllUsersQuery = (skip: number = 0, limit: number = 1000): UseQueryResult<User[], Error> =>
        useQuery({
            queryKey: ["allUsers", skip, limit],
            queryFn: async () => {
                return await authGet<User[]>(`${baseUrl}/all`, {
                    params: { skip, limit }
                });
            },
            enabled: isAuthenticated,
        });

    const useUserByIdQuery = (userId: string, enabled: boolean = true): UseQueryResult<User, Error> =>
        useQuery({
            queryKey: ["userById", userId],
            queryFn: async () => {
                return await authGet<User>(`${baseUrl}/by_id/${userId}`);
            },
            enabled: isAuthenticated && enabled && !!userId,
        });

    const useUserByEmailQuery = (email: string, enabled: boolean = true): UseQueryResult<User, Error> =>
        useQuery({
            queryKey: ["userByEmail", email],
            queryFn: async () => {
                return await authGet<User>(`${baseUrl}/by_email/${email}`);
            },
            enabled: isAuthenticated && enabled && !!email,
        });

    // Mutations
    const sendUserPasswordReset = useMutation<Message, Error, string>({
        mutationFn: async (email) => authPost<Message>(
            `${baseUrl}/email_password_reset_link`,
            {},
            { params: { email } }
        )
    });

    const sendMagicLink = useMutation<Message, Error, string>({
        mutationFn: async (email) => authPost<Message>(
            `${baseUrl}/send_magic_link`,
            {},
            { params: { email } }
        )
    });

    const resetPassword = useMutation<Message, Error, ResetPasswordRequest>({
        mutationFn: async ({ new_password, token }) => authPost<Message>(
            `${baseUrl}/reset_password`,
            { new_password },
            { params: { token } }
        )
    });

    const createUser = useMutation<User, Error, UserCreateRequest>({
        mutationFn: async (userData) => authPost<User>(
            `${baseUrl}/register`,
            userData
        )
    });

    const updateUser = useMutation<User, Error, User>({
        mutationFn: async (userData) => authPut<User>(
            `${baseUrl}/update`,
            userData
        )
    });

    const deleteUser = useMutation<Message, Error, string>({
        mutationFn: async (userId) => authDelete<Message>(
            `${baseUrl}/delete/${userId}`
        )
    });

    const updateMyPassword = useMutation<Message, Error, UpdatePasswordRequest>({
        mutationFn: async (passwordData) => authPut<Message>(
            `${baseUrl}/me/update_password`,
            passwordData
        )
    });

    const updateMyProfile = useMutation<User, Error, User>({
        mutationFn: async (userData) => authPut<User>(
            `${baseUrl}/me/update`,
            userData
        )
    });

    // API Key mutations
    const createApiKey = useMutation<ApiKey, Error, CreateApiKeyRequest>({
        mutationFn: async ({ email, api_key }) => authPost<ApiKey>(
            `${baseUrl}/api_key/create`,
            { ...api_key, email }
        )
    });

    const updateApiKey = useMutation<ApiKey, Error, UpdateApiKeyRequest>({
        mutationFn: async (keyData) => authPut<ApiKey>(
            `${baseUrl}/api_key/update`,
            keyData
        )
    });

    const deleteApiKey = useMutation<Message, Error, string>({
        mutationFn: async (clientId) => authDelete<Message>(
            `${baseUrl}/api_key/delete/${clientId}`
        )
    });

    return {
        useUserProfileQuery,
        useAllUsersQuery,
        useUserByIdQuery,
        useUserByEmailQuery,
        sendUserPasswordReset,
        sendMagicLink,
        resetPassword,
        createUser,
        updateUser,
        deleteUser,
        updateMyPassword,
        updateMyProfile,
        createApiKey,
        updateApiKey,
        deleteApiKey,
    };
};