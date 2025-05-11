declare global {
    interface Window {
        _env_: {  // Make it optional with ?
            REACT_APP_GOOGLE_CLIENT_ID: string;
            API_URL: string;
        };
    }
}

export const getAPIURL = (): string => {
    // Provide a fallback URL if _env_ is not defined
    const apiUrl = window._env_.API_URL
    return ensureTrailingSlash(apiUrl);
};

const ensureTrailingSlash = (url: string): string => {
    if (url.lastIndexOf("/") !== url.length - 1) {
        return url + "/";
    }
    return url;
};
