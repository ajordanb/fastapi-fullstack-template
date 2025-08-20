import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useApi } from "@/api/api";

export const SSOPage = () => {
  const [hasProcessed, setHasProcessed] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ from: "/sso" });
  const token = search.token;
  const api = useApi();
  
  // Use the query to validate magic link
  const { data, error, isLoading, isSuccess, isError } = api.auth.useValidateMagicLinkQuery(token);

  // Derive status and message from query state
  const getStatus = () => {
    if (!token) return "error";
    if (isLoading) return "loading";
    if (isSuccess) return "success";
    if (isError) return "error";
    return "loading";
  };

  const getMessage = () => {
    if (!token) return "Invalid or missing authentication token. Please request a new magic link.";
    if (isLoading) return "We're working magic...";
    if (isSuccess) return "Authentication successful! Redirecting you...";
    if (isError) return "Authentication failed. Please try again or request a new magic link.";
    return "We're working magic...";
  };

  const status = getStatus();
  const message = getMessage();

  useEffect(() => {
    if (isSuccess && data && !hasProcessed) {
      setHasProcessed(true);
      
      // Handle successful authentication with minimum 3 second delay
      const processSuccess = async () => {
        // Ensure minimum 3 second wait
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Store tokens in localStorage (same pattern as auth context)
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        
        // Redirect after successful validation
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      };
      
      processSuccess();
    }
  }, [isSuccess, data, hasProcessed]);

  return (
    <div className="min-h-screen flex items-center justify-center form-wrapper-background">
      <Card className="w-full max-w-md p-8 form-card">
        <div className="text-center">
          <div className="mb-6">
            <div className="form-header-icon w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              <MagicWand className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold form-text-primary mb-2">
              {status === "loading" && "Working Magic"}
              {status === "success" && "Success!"}
              {status === "error" && "Authentication Error"}
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6 py-6">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 mb-4">
                  <MagicSparkles />
                </div>
                <p className="form-text-secondary text-lg">{message}</p>
                <div className="mt-4 flex space-x-1">
                  <LoadingDots />
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center text-green-600">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium">{message}</p>
                <p className="text-sm form-text-secondary mt-2">You'll be redirected shortly...</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center text-red-600">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium">{message}</p>
                <button
                  onClick={() => navigate({ to: "/requestMagicLink" })}
                  className="mt-6 px-6 py-2 form-button-primary rounded-lg transition-colors"
                >
                  Request New Magic Link
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Magic wand icon component
const MagicWand = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L14.37 8.7c.39-.38.39-1.02 0-1.41z"/>
  </svg>
);

// Animated sparkles component
const MagicSparkles = () => (
  <div className="relative w-full h-full">
    <div className="absolute inset-0 animate-spin">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse delay-450"></div>
    </div>
    <div className="absolute inset-2 animate-spin-reverse">
      <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-1 right-1 w-1 h-1 bg-red-400 rounded-full animate-ping delay-200"></div>
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-indigo-400 rounded-full animate-ping delay-400"></div>
      <div className="absolute top-1 left-1 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-600"></div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <MagicWand className="w-8 h-8 text-black animate-pulse" />
    </div>
  </div>
);

// Loading dots component
const LoadingDots = () => (
  <>
    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-100"></div>
    <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-200"></div>
  </>
);

// Icon components
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);