import { createContext, useState, useEffect } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  _formPostRequest,
  _jsonPostRequest,
  _postRequest,
  decodeToken,
} from "./_authHelpers";
import type { AuthContextType, AuthPostOptions, AuthResponse, SocialLoginParams, TokenData } from "./model";



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useLocalStorage<string | null>(
    "accessToken",
    null
  );
  const [refreshToken, setRefreshToken] = useLocalStorage<string | null>(
    "refreshToken",
    null
  );
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>(
    "currentUser",
    null
  );
  const [userRoles, setUserRoles] = useLocalStorage<string[]>("roles", []);
  const [userScopes, setUserScopes] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAuthenticationResponse = (tokenResponse: TokenData) => {
    setAccessToken(tokenResponse.accessToken);
    setRefreshToken(tokenResponse.refreshToken);
    const decodedToken = decodeToken(tokenResponse.accessToken);
    setCurrentUser(decodedToken.sub);
    setUserRoles(decodedToken.roles || []);
    setUserScopes(decodedToken.scopes || []);
  };

  const basicLogin = async (
    username: string,
    password: string
  ): Promise<void> => {
    setIsLoggingIn(true);

    return _formPostRequest("auth/token", { username, password })
      .then((response) => {
        handleAuthenticationResponse(response as TokenData);
      })
      .catch((error) => {
        logout();
        throw error;
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  };

  const socialLogin = async ({
    provider,
    data,
  }: SocialLoginParams): Promise<void> => {
    setIsLoggingIn(true);
    try {
      const response = (await _jsonPostRequest("auth/social_login", {
        provider,
        data,
      })) as TokenData;
      handleAuthenticationResponse(response);
    } catch (error) {
      console.error("Authentication failed:", error);
      logout();
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!accessToken) {
          setIsAuthenticated(false);
          return;
        }
        const decodedToken = decodeToken(accessToken);
        const isExpired = Date.now() >= parseInt(decodedToken.exp) * 1000;
        if (isExpired) {
          if (refreshToken) {
            try {
              await refresh();
              setIsAuthenticated(true);
            } catch (error) {
              console.error("Token refresh failed:", error);
              logout();
            }
          } else {
            logout();
          }
        } else {
          setCurrentUser(decodedToken.sub);
          setUserRoles(decodedToken.roles || []);
          setUserScopes(decodedToken.scopes || []);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        logout();
      }
    };
    checkAuth();

  }, [accessToken, refreshToken, setCurrentUser, setUserRoles, setUserScopes, setIsAuthenticated]);

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAccessToken(null);
    setRefreshToken(null);
    setUserRoles([]);
    setUserScopes([]);
  };

  const hasRole = (requiredRoles: string | string[]): boolean => {
    if (!currentUser) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.some(role => userRoles.includes(role));
  }
  
  return userRoles.includes(requiredRoles);
};

const hasScope = (requiredScopes: string | string[]): boolean => {
  if (!currentUser) return false;
  
  if (Array.isArray(requiredScopes)) {
    return requiredScopes.some(scope => userScopes.includes(scope));
  }
  
  return userScopes.includes(requiredScopes);
};

  const refresh = async () => {
    try {
      const response = (await _jsonPostRequest("auth/refresh", {
        refreshToken,
      })) as TokenData;
      handleAuthenticationResponse(response);
      return response;
    } catch (error) {
      console.error("Refresh failed:", error);
      logout();
      throw error;
    }
  };

  async function authPost<T = any>(
    url: string,
    body?: any,
    options: AuthPostOptions = {}
  ): Promise<T | Blob | AuthResponse<T>> {
    try {
      let response = await _postRequest(
        url,
        body,
        accessToken, // Use the state variable directly
        options.params
      );

      // Handle 401 with retry
      if (response.status === 401) {
        const tokenData = await refresh();
        if (!tokenData) {
          logout();
          throw new Error("Failed to refresh token");
        }

        // Retry with the new token from the response
        response = await _postRequest(
          url,
          body,
          tokenData.accessToken, // Use the fresh token from the response
          options.params
        );
      }

      // Handle other error statuses
      if (!response.ok) {
        switch (response.status) {
          case 401:
            logout();
            throw new Error("Authentication failed");
          case 403:
            logout();
            throw new Error("Access forbidden");
          case 429:
            const errorData = await response.json();
            return {
              error: "Too many requests",
              msg: errorData.detail,
              status: 429,
            };
          default:
            throw new Error(`Request failed with status ${response.status}`);
        }
      }

      // Handle successful response
      if (options.isFileResp) {
        return await response.blob();
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoggingIn,
        currentUser,
        basicLogin,
        logout,
        hasRole,
        hasScope,
        authPost,
        socialLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
