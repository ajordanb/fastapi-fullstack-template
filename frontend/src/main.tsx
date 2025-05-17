import {StrictMode} from "react";
import ReactDOM from "react-dom/client";
import {RouterProvider, createRouter} from "@tanstack/react-router";
import {useAuth} from "@/hooks/useAuth";
import {AuthProvider} from "@/contexts/auth/AuthContext";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {ThemeProvider} from "./contexts/theme/ThemeContext";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

import {routeTree} from "./routeTree.gen";

import "./styles.css";
import reportWebVitals from "./reportWebVitals";
import {ModalProvider} from "@/contexts/modal/ModalContext.tsx";

const router = createRouter({
    routeTree,
    context: {
        ...TanstackQuery.getContext(),
        auth: undefined!,
    },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

function InnerApp() {
    const auth = useAuth();

    return (
        <RouterProvider
            router={router}
            context={{
                ...TanstackQuery.getContext(),
                auth,
            }}
        />
    );
}

// Main App component with all providers
function App() {
    const clientId = window._env_?.REACT_APP_GOOGLE_CLIENT_ID;

    if (!clientId) {
        console.error("Google Client ID is not defined");
        return <div>Configuration error: Google Client ID is missing</div>;
    }
    return (
        <StrictMode>
            <ThemeProvider>
                <ModalProvider>

                    <GoogleOAuthProvider clientId={clientId}>
                        <TanstackQuery.Provider>
                            <AuthProvider>
                                <InnerApp/>
                            </AuthProvider>
                        </TanstackQuery.Provider>
                    </GoogleOAuthProvider>
                </ModalProvider>

            </ThemeProvider>
        </StrictMode>
    );
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App/>);
}

reportWebVitals();
