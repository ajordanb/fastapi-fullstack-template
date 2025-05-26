import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Spin } from "antd";
import { CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute('/validateMagicLink')({
  component: ValidateMagicLink,
});

function ValidateMagicLink() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Validating your magic link...");
  const navigate = useNavigate();

  const token = ""

  useEffect(() => {
    const validateToken = async () => {
      // Make sure there's a token to validate
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing token. Please request a new magic link.");
        return;
      }

      try {
        // Simulate API call to validate the token
        // Replace this with your actual validation logic
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For demonstration purposes - replace with actual API call
        // const response = await fetch('/api/auth/validate-magic-link', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ token })
        // });

        // if (!response.ok) throw new Error('Failed to validate token');

        // Success path
        setStatus("success");
        setMessage("Magic link validated successfully!");

        // Redirect after successful validation
        setTimeout(() => {
          navigate({ to: '/' });
        }, 1500);

      } catch (error) {
        console.error("Error validating magic link:", error);
        setStatus("error");
        setMessage("Failed to validate your magic link. Please try again.");
      }
    };

    validateToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Magic Link Authentication</h1>

          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            {status === "loading" && (
              <Spin size="large" tip="Validating your magic link..." />
            )}

            {status === "success" && (
              <div className="flex flex-col items-center text-green-600">
                <CheckCircle className="h-16 w-16 mb-2" />
                <p className="text-lg font-medium">{message}</p>
                <p className="text-sm text-gray-500 mt-1">Redirecting you shortly...</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center text-red-600">
                <XCircle className="h-16 w-16 mb-2" />
                <p className="text-lg font-medium">{message}</p>
                <button
                  onClick={() => navigate({ to: '/requestMagicLink' })}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Request New Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}