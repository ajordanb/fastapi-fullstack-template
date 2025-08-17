import { type ReactNode } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {Link} from "@tanstack/react-router";

interface FormWrapperProps {
  heading?: string;
  subheading?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
  };
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

export function FormWrapper({
  heading,
  subheading,
  logo,
  children,
  isLoading = false,
  error = null,
  onErrorDismiss
}: FormWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-black rounded-2xl shadow-lg">
                {logo?.src ? (
                  <img
                    src={logo.src}
                    className="w-12 h-12 object-contain"
                    alt={logo.alt}
                  />
                ) : (
                  <Shield className="w-12 h-12 text-white" />
                )}
              </div>
            </div>

            <div className="mb-4">
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-300 px-3 py-1 text-xs">
                Secure Form
              </Badge>
            </div>

            {heading && (
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {heading}
              </h1>
            )}
            {subheading && (
              <p className="text-lg text-gray-600">
                {subheading}
              </p>
            )}
          </div>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-red-600 text-sm">{error}</p>
                    {onErrorDismiss && (
                      <Button
                        onClick={onErrorDismiss}
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                        aria-label="Dismiss error"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 text-sm">Loading...</p>
                </div>
              ) : (
                <div className="min-h-[120px]">
                  {children}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-600 hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormWrapper;