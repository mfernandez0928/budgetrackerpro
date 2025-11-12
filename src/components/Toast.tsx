import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const toastStack: Toast[] = [];
let listeners: Set<(toasts: Toast[]) => void> = new Set();

export const showToast = (
  message: string,
  type: ToastType = "info",
  duration = 3000
) => {
  const id = Math.random().toString(36).substr(2, 9);
  const toast: Toast = { id, message, type };
  toastStack.push(toast);
  notifyListeners();

  setTimeout(() => {
    const index = toastStack.findIndex((t) => t.id === id);
    if (index > -1) {
      toastStack.splice(index, 1);
      notifyListeners();
    }
  }, duration);
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...toastStack]));
};

export const useToasts = () => {
  const [toasts, setToasts] = useState<Toast[]>([...toastStack]);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return toasts;
};

export default function ToastContainer() {
  const toasts = useToasts();

  const bgColors: Record<ToastType, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${
            bgColors[toast.type]
          } text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce`}
        >
          <span className="font-bold text-lg">{icons[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
