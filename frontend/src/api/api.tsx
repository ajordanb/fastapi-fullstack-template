
import type { UserApi } from "./user/model";
import type { AuthApi } from "./auth/model";
import { userApi } from "./user/userApi";
import { authApi } from "./auth/authApi";

interface ApiCollection {
    user: UserApi;
    auth: AuthApi;
}

export const useApi = (): ApiCollection => {
    return {
        user: userApi(),
        auth: authApi(),
    };
};