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
                const response = await authPost<User>(`${baseUrl}/me`);
                return response;
            },
            enabled: isAuthenticated,
        });

    return {
        useUserProfileQuery,
    };
};