import { clsx } from "clsx";
import type { ServiceStatus, InstallStatus } from "../types";

type Status = ServiceStatus | InstallStatus;

const statusConfig: Record<
  Status,
  { label: string; color: string; dot: string }
> = {
  running: {
    label: "运行中",
    color: "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30",
    dot: "bg-green-500 animate-pulse",
  },
  stopped: {
    label: "已停止",
    color: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
    dot: "bg-gray-400",
  },
  starting: {
    label: "启动中",
    color: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30",
    dot: "bg-blue-500 animate-pulse",
  },
  stopping: {
    label: "停止中",
    color: "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30",
    dot: "bg-orange-500 animate-pulse",
  },
  unknown: {
    label: "未知",
    color: "text-gray-500 bg-gray-100 dark:text-gray-500 dark:bg-gray-800",
    dot: "bg-gray-400",
  },
  installed: {
    label: "已安装",
    color: "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30",
    dot: "bg-green-500",
  },
  not_installed: {
    label: "未安装",
    color: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
    dot: "bg-gray-400",
  },
  checking: {
    label: "检测中",
    color: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30",
    dot: "bg-blue-500 animate-pulse",
  },
  installing: {
    label: "安装中",
    color: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30",
    dot: "bg-blue-500 animate-pulse",
  },
  uninstalling: {
    label: "卸载中",
    color: "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30",
    dot: "bg-orange-500 animate-pulse",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status] ?? statusConfig.unknown;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        cfg.color
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
