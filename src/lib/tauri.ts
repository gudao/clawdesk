/**
 * Tauri command bridge
 * All IPC calls to the Rust backend go through this module.
 */
import { invoke } from "@tauri-apps/api/core";
import type { AppConfig, VersionInfo } from "../types";

// ---------- Install ----------

export async function checkInstalled(): Promise<boolean> {
  return invoke<boolean>("check_installed");
}

export async function getInstalledVersion(): Promise<string | null> {
  return invoke<string | null>("get_installed_version");
}

export async function installOpenClaw(): Promise<void> {
  return invoke<void>("install_openclaw");
}

export async function uninstallOpenClaw(): Promise<void> {
  return invoke<void>("uninstall_openclaw");
}

// ---------- Service ----------

export async function startService(): Promise<void> {
  return invoke<void>("start_service");
}

export async function stopService(): Promise<void> {
  return invoke<void>("stop_service");
}

export async function restartService(): Promise<void> {
  return invoke<void>("restart_service");
}

export async function getServiceStatus(): Promise<string> {
  return invoke<string>("get_service_status");
}

// ---------- Config ----------

export async function loadConfig(): Promise<AppConfig> {
  return invoke<AppConfig>("load_config");
}

export async function saveConfig(config: AppConfig): Promise<void> {
  return invoke<void>("save_config", { config });
}

export async function openDataDir(): Promise<void> {
  return invoke<void>("open_data_dir");
}

// ---------- Version / Update ----------

export async function checkLatestVersion(): Promise<VersionInfo> {
  return invoke<VersionInfo>("check_latest_version");
}
