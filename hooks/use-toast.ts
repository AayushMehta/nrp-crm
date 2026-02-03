// hooks/use-toast.ts
// Simple toast hook for notifications

import * as React from "react";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

type Toast = ToastProps & {
  id: string;
};

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...props, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);

    // For now, just use console.log as fallback
    const prefix = props.variant === "destructive" ? "❌" : "✓";
    console.log(`${prefix} ${props.title}${props.description ? `: ${props.description}` : ""}`);
  }, []);

  return { toast, toasts };
}
