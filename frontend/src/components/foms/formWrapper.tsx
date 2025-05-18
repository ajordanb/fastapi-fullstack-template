import { type ReactNode } from 'react';
import { Spin } from "antd";

interface FormWrapperProps {
  heading?: string;
  subheading?: string;
  logo: {
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
    <div className="py-32">
      <div className="flex flex-col gap-4">
        <div className="mx-auto w-full max-w-sm rounded-md p-6 shadow">
          <div className="mb-6 flex flex-col items-center">
            <img src={logo.src} className="max-h-8" alt={logo.alt} />
            {heading && <h1 className="mb-2 text-2xl font-bold">{heading}</h1>}
            {subheading && <p className="text-muted-foreground">{subheading}</p>}
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-destructive">
              <div className="flex items-center justify-between">
                <p className="text-sm">{error}</p>
                {onErrorDismiss && (
                  <button
                    onClick={onErrorDismiss}
                    className="ml-2 h-5 w-5 rounded-full hover:bg-destructive/20"
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content area with Ant Design Spin loading component */}
          <Spin spinning={isLoading} tip="Loading...">
            <div className="min-h-[120px]">
              {children}
            </div>
          </Spin>
        </div>
      </div>
    </div>
  );
}

export default FormWrapper;