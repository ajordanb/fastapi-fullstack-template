import React, {createContext, useRef} from 'react';
import {toast} from 'sonner';
import {Spin} from "antd";

interface ToastContextType {
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
  setAlert: (message: string) => void;
  setLoading: (message: string, loading: boolean) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadingToastRef = useRef<string | number | null>(null);

  const setSuccess = (message: string) => {
    toast.success(message);
  };

  const setError = (message: string) => {
    toast.error(message);
  };

  const setAlert = (message: string) => {
    toast.warning(message);
  };

 const setLoading = (message: string, loading: boolean) => {
  if (loading) {
    if (loadingToastRef.current) {
      toast.dismiss(loadingToastRef.current);
    }
      loadingToastRef.current = toast(
        <div className="flex items-center gap-4">
            <Spin className="w-4 h-4"/>
            <span>{message}</span>
        </div>,
        {
            duration: Infinity,
        }
    );
  } else {
    if (loadingToastRef.current) {
      toast.dismiss(loadingToastRef.current);
      loadingToastRef.current = null;
    }
  }
};

  return (
    <ToastContext.Provider
      value={{
        setSuccess,
        setError,
        setAlert,
        setLoading,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};