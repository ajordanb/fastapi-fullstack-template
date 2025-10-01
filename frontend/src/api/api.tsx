
import type { UserApi } from "./user/model";
import type { AuthApi } from "./auth/model";
import type { RoleApi } from "./role/model";
import type { DramatiqApi } from "./dramatiq/model";
import { userApi } from "./user/userApi";
import { authApi } from "./auth/authApi";
import { roleApi } from "./role/roleApi";
import { dramatiqApi } from "./dramatiq/dramatiqApi";

interface ApiCollection {
    user: UserApi;
    auth: AuthApi;
    role: RoleApi;
    dramatiq: DramatiqApi;
}

export const useApi = (): ApiCollection => {
    return {
        user: userApi(),
        auth: authApi(),
        role: roleApi(),
        dramatiq: dramatiqApi(),
    };
};