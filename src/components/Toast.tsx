import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "../store";
import type { ToastMessage } from "../types";

const toastConfig: Record<
  ToastMessage["type"],
  { icon: typeof CheckCircle; color: string }
> = {
  success: {
    icon: CheckCircle,
    color: "border-green-400 bg-green-50 dark:bg-green-900/30 dark:border-green-700",
  },
  error: {
    icon: XCircle,
    color: "border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-700",
  },
  warning: {
    icon: AlertTriangle,
    color: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-700",
  },
  info: {
    icon: Info,
    color: "border-blue-400 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700",
  },
};

function Toast({ toast }: { toast: ToastMessage }) {
  const removeToast = useAppStore((s) => s.removeToast);
  const { icon: Icon, color } = toastConfig[toast.type];

  return (
    <div
      className={clsx(
        "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm",
        "animate-in slide-in-from-right-5",
        color
      )}
    >
      <Icon size={18} className="mt-0.5 flex-shrink-0" />
      <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
