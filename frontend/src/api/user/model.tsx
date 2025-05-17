import {type UseMutationResult, type UseQueryResult} from "@tanstack/react-query";

export interface UserApi {
    useUserProfileQuery: () => UseQueryResult<User, Error>;
    useAllUsersQuery: () => UseQueryResult<User[], Error>;
     sendUserPasswordReset: UseMutationResult<unknown, Error, string>;
}

export interface UserRole {
  name: string;
  description: string;
  created_by: string;
  scopes: string[];
}

export interface AuthResponse<T = any> {
  data?: T;
  error?: string;
  msg?: string;
  status?: number;
}

export interface ApiKey {
  id: string;
  client_id: string;
  scopes: string[];
  active: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  name: string;
  source: string;
  email_confirmed: boolean;
  roles: UserRole[];
  api_keys?: ApiKey[];
}