import { type ReactNode } from "react";
import {
  Download,
  Play,
  Settings,
  Info,
  Moon,
  Sun,
  Clover,
} from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "../store";
import type { Page } from "../types";

interface NavItem {
  id: Page;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: "install", label: "安装管理", icon: <Download size={18} /> },
  { id: "service", label: "服务控制", icon: <Play size={18} /> },
  { id: "settings", label: "配置设置", icon: <Settings size={18} /> },
  { id: "about", label: "关于 & 更新", icon: <Info size={18} /> },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, darkMode, toggleDarkMode } =
    useAppStore();

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-200 dark:border-gray-800"
        data-tauri-drag-region
      >
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Clover size={18} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-base">
          ClawDesk
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={clsx(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              currentPage === item.id
                ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            <span
              className={clsx(
                currentPage === item.id
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="px-2 py-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
                     hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          {darkMode ? (
            <Sun size={18} className="text-gray-400 dark:text-gray-500" />
          ) : (
            <Moon size={18} className="text-gray-400 dark:text-gray-500" />
          )}
          {darkMode ? "浅色模式" : "深色模式"}
        </button>
      </div>
    </aside>
  );
}
