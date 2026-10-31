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
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    error: "border-rose-400/20 bg-rose-400/10 text-rose-100",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    info: "border-sky-400/20 bg-sky-400/10 text-sky-100",
  };

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${toneMap[toast.type]}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
