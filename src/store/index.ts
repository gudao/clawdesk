import { create } from "zustand";
import type {
  Page,
  ServiceStatus,
  InstallStatus,
  AppConfig,
  ToastMessage,
  VersionInfo,
} from "../types";
import { DEFAULT_CONFIG } from "../types";

interface AppState {
  // Navigation
  currentPage: Page;
  setCurrentPage: (page: Page) => void;

  // Install
  installStatus: InstallStatus;
  setInstallStatus: (status: InstallStatus) => void;
  installLog: string[];
  appendLog: (line: string) => void;
  clearLog: () => void;

  // Service
  serviceStatus: ServiceStatus;
  setServiceStatus: (status: ServiceStatus) => void;
  serviceLog: string[];
  appendServiceLog: (line: string) => void;
  clearServiceLog: () => void;

  // Config
  config: AppConfig;
  setConfig: (config: Partial<AppConfig>) => void;
  configDirty: boolean;
  setConfigDirty: (dirty: boolean) => void;

  // Version
  versionInfo: VersionInfo;
  setVersionInfo: (info: Partial<VersionInfo>) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (type: ToastMessage["type"], message: string) => void;
  removeToast: (id: string) => void;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentPage: "install",
  setCurrentPage: (page) => set({ currentPage: page }),

  // Install
  installStatus: "checking",
  setInstallStatus: (status) => set({ installStatus: status }),
  installLog: [],
  appendLog: (line) =>
    set((s) => ({ installLog: [...s.installLog.slice(-200), line] })),
  clearLog: () => set({ installLog: [] }),

  // Service
  serviceStatus: "unknown",
  setServiceStatus: (status) => set({ serviceStatus: status }),
  serviceLog: [],
  appendServiceLog: (line) =>
    set((s) => ({ serviceLog: [...s.serviceLog.slice(-500), line] })),
  clearServiceLog: () => set({ serviceLog: [] }),

  // Config
  config: DEFAULT_CONFIG,
  setConfig: (patch) =>
    set((s) => ({ config: { ...s.config, ...patch }, configDirty: true })),
  configDirty: false,
  setConfigDirty: (dirty) => set({ configDirty: dirty }),

  // Version
  versionInfo: { installed: null, latest: null, hasUpdate: false },
  setVersionInfo: (info) =>
    set((s) => ({ versionInfo: { ...s.versionInfo, ...info } })),

  // Toast
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Theme
  darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      document.documentElement.classList.toggle("dark", next);
      return { darkMode: next };
    }),
}));
