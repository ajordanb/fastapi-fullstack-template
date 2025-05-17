
export interface AuthResponse<T = any> {
  data?: T;
  error?: string;
  msg?: string;
  status?: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  currentUser: string | null;
  socialLogin: (params: SocialLoginParams) => Promise<void>;
  basicLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (requiredRoles: string | string[]) => boolean;
  hasScope: (requiredScopes: string | string[]) => boolean;
  authPost: <T = any>(
    url: string,
    body?: any,
    options?: AuthPostOptions
  ) => Promise<T | Blob | AuthResponse<T>>;
}

export interface AuthPostOptions {
  params?: any;
  isFormdata?: boolean;
  isFileResp?: boolean;
  forceGravitateTenant?: boolean;
}

export interface TokenData {
  accessToken: string;
  accessTokenExpires: string;
  refreshToken: string;
  refreshTokenExpires: string;
}

export interface TokenDecodedData {
  sub: string;
  exp: string;
  client_id?: string;
  scopes?: string[];
  roles?: string[];
}

export interface SocialLoginParams {
  provider: string;
  data: any;
}