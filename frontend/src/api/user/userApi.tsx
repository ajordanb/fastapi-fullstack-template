import { useAuth } from "@/hooks/useAuth";
import {
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
    return {
        useUserProfileQuery,
        useAllUsersQuery
    };
};