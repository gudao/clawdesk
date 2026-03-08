export type Page = "install" | "service" | "settings" | "about";

export type ServiceStatus = "running" | "stopped" | "starting" | "stopping" | "unknown";

export type InstallStatus = "installed" | "not_installed" | "checking" | "installing" | "uninstalling";

export interface AppConfig {
  port: number;
  host: string;
  dataDir: string;
  logLevel: "debug" | "info" | "warn" | "error";
  autoStart: boolean;
  enableProxy: boolean;
  proxyUrl: string;
  maxConcurrency: number;
  timeout: number;
  // Agent settings (future expansion)
  agentEnabled: boolean;
  agentEndpoint: string;
  // Security settings (future expansion)
  apiKeyEnabled: boolean;
  apiKey: string;
  allowedOrigins: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  port: 11235,
  host: "0.0.0.0",
  dataDir: "",
  logLevel: "info",
  autoStart: false,
  enableProxy: false,
  proxyUrl: "",
  maxConcurrency: 5,
  timeout: 60,
  agentEnabled: false,
  agentEndpoint: "",
  apiKeyEnabled: false,
  apiKey: "",
  allowedOrigins: "*",
};

export interface VersionInfo {
  installed: string | null;
  latest: string | null;
  hasUpdate: boolean;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}
