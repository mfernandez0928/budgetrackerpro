import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const queue: Toast[] = [];
const listeners = new Set<(toasts: Toast[]) => void>();

function emit() {
  listeners.forEach((listener) => listener([...queue]));
}

// eslint-disable-next-line react-refresh/only-export-components
export function showToast(message: string, type: ToastType = "info", duration = 3200) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  queue.push({ id, message, type });
  emit();

  window.setTimeout(() => {
    const index = queue.findIndex((toast) => toast.id === id);
    if (index >= 0) {
      queue.splice(index, 1);
      emit();
    }
  }, duration);
}

function useToasts() {
  const [toasts, setToasts] = useState([...queue]);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return toasts;
}

export default function ToastContainer() {
  const toasts = useToasts();
  const toneMap: Record<ToastType, string> = {
    success: "border-pos/30 text-pos",
    error: "border-neg/30 text-neg",
    warning: "border-warn/30 text-warn",
    info: "border-line text-ink",
  };

  return (
    <div className="pt-safe pointer-events-none fixed right-4 top-4 z-[60] flex max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border bg-surface px-4 py-3 text-sm font-medium shadow-xl ${toneMap[toast.type]}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
