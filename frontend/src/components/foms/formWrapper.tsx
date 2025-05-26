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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0"></div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-2xl">
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
              <Badge variant="secondary" className="bg-slate-800/50 text-slate-300 border-slate-600 px-3 py-1 text-xs">
                Secure Form
              </Badge>
            </div>

            {heading && (
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {heading}
              </h1>
            )}
            {subheading && (
              <p className="text-lg text-slate-300">
                {subheading}
              </p>
            )}
          </div>

          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-red-400 text-sm">{error}</p>
                    {onErrorDismiss && (
                      <Button
                        onClick={onErrorDismiss}
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
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
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-300 text-sm">Loading...</p>
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
              className="text-sm text-slate-500 hover:text-slate-400 hover:underline"
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