
import type { UserApi } from "./user/model";
import {userApi} from "./user/userApi";

interface ApiCollection {
    user: UserApi;
    // Add other API modules here as you create them
    // auth: AuthAPI;
}



export const useApi = (): ApiCollection => {
return {
    user: userApi(),
}

}