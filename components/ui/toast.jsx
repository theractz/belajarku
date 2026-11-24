"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createId } from "@/lib/utils";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const styles = {
  success: "text-success",
  error: "text-danger",
  info: "text-sky-500",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, variant = "success") => {
      const id = createId("toast");
      setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
        {toasts.map((item) => {
          const Icon = icons[item.variant] || Info;
          return (
            <div
              key={item.id}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg animate-toast-in"
            >
              <Icon className={`h-5 w-5 shrink-0 ${styles[item.variant] || ""}`} />
              <p className="flex-1 text-sm font-medium">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-1 text-muted transition hover:bg-muted-bg hover:text-foreground"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus dipakai di dalam ToastProvider");
  }
  return context;
}