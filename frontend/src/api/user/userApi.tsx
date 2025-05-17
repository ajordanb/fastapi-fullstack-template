import { useAuth } from "@/hooks/useAuth";
import {
    useMutation,
    useQuery,
    type UseQueryResult,
} from "@tanstack/react-query";
import type { User, UserApi } from "./model";



export const userApi = (): UserApi => {
    const { authPost, isAuthenticated } = useAuth();
    const baseUrl = "user";

    const useUserProfileQuery = (): UseQueryResult<User, Error> =>
        useQuery({
            queryKey: ["profile"],
            queryFn: async () => {
                return await authPost<User>(`${baseUrl}/me`);
            },
            enabled: isAuthenticated,
        });

    const useAllUsersQuery = (): UseQueryResult<User[], Error> =>
        useQuery({
            queryKey: ["allUsers"],
            queryFn: async () => {
                return await authPost<User>(`${baseUrl}/all`);
            },
            enabled: isAuthenticated,
        });

    const sendUserPasswordReset  = useMutation<unknown, Error, string>({
        mutationFn: async (email) => authPost(
            "/email_password_reset_link",
            null,
            {params: {email: email}}
        ),
        onSuccess: () => {
            console.log('Success!')
        },
        onError: (error) => {
            console.error(error);
        }
    });
    return {
        useUserProfileQuery,
        useAllUsersQuery,
        sendUserPasswordReset
    };
};