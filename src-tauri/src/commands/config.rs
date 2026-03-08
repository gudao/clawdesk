use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::AppHandle;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default = "default_host")]
    pub host: String,
    #[serde(default)]
    pub data_dir: String,
    #[serde(default = "default_log_level")]
    pub log_level: String,
    #[serde(default)]
    pub auto_start: bool,
    #[serde(default)]
    pub enable_proxy: bool,
    #[serde(default)]
    pub proxy_url: String,
    #[serde(default = "default_concurrency")]
    pub max_concurrency: u32,
    #[serde(default = "default_timeout")]
    pub timeout: u32,
    // Agent
    #[serde(default)]
    pub agent_enabled: bool,
    #[serde(default)]
    pub agent_endpoint: String,
    // Security
    #[serde(default)]
    pub api_key_enabled: bool,
    #[serde(default)]
    pub api_key: String,
    #[serde(default = "default_origins")]
    pub allowed_origins: String,
}

fn default_port() -> u16 { 11235 }
fn default_host() -> String { "0.0.0.0".to_string() }
fn default_log_level() -> String { "info".to_string() }
fn default_concurrency() -> u32 { 5 }
fn default_timeout() -> u32 { 60 }
fn default_origins() -> String { "*".to_string() }

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            port: default_port(),
            host: default_host(),
            data_dir: String::new(),
            log_level: default_log_level(),
            auto_start: false,
            enable_proxy: false,
            proxy_url: String::new(),
            max_concurrency: default_concurrency(),
            timeout: default_timeout(),
            agent_enabled: false,
            agent_endpoint: String::new(),
            api_key_enabled: false,
            api_key: String::new(),
            allowed_origins: default_origins(),
        }
    }
}

fn config_path(_app: &AppHandle) -> PathBuf {
    let mut path = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."));
    path.push("ClawDesk");
    path.push("config.json");
    path
}

/// Load config from disk (returns defaults if not found).
#[tauri::command]
pub async fn load_config(app: AppHandle) -> AppConfig {
    let path = config_path(&app);
    if let Ok(content) = fs::read_to_string(&path) {
        serde_json::from_str::<AppConfig>(&content).unwrap_or_default()
    } else {
        AppConfig::default()
    }
}

/// Save config to disk.
#[tauri::command]
pub async fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    let path = config_path(&app);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {e}"))?;
    }
    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("序列化失败: {e}"))?;
    fs::write(&path, json).map_err(|e| format!("写入文件失败: {e}"))?;
    Ok(())
}

/// Open the data directory in Finder/Explorer.
#[tauri::command]
pub async fn open_data_dir(app: AppHandle) -> Result<(), String> {
    let cfg = load_config(app.clone()).await;
    let dir = if cfg.data_dir.is_empty() {
        dirs::data_dir()
            .map(|mut p| { p.push("ClawDesk"); p })
            .ok_or_else(|| "无法确定数据目录".to_string())?
    } else {
        PathBuf::from(&cfg.data_dir)
    };

    fs::create_dir_all(&dir).ok();

    #[cfg(target_os = "macos")]
    std::process::Command::new("open").arg(&dir).spawn().ok();
    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer").arg(&dir).spawn().ok();
    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open").arg(&dir).spawn().ok();

    Ok(())
}

/// Check PyPI for the latest version of crawl4ai.
#[tauri::command]
pub async fn check_latest_version() -> Result<VersionInfo, String> {
    // Get installed version
    let installed = get_pip_version();

    // Fetch latest from PyPI
    let latest = fetch_pypi_latest().await.ok();

    let has_update = match (&installed, &latest) {
        (Some(inst), Some(lat)) => {
            semver::Version::parse(lat).ok()
                > semver::Version::parse(inst).ok()
        }
        _ => false,
    };

    Ok(VersionInfo { installed, latest, has_update })
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VersionInfo {
    pub installed: Option<String>,
    pub latest: Option<String>,
    pub has_update: bool,
}

fn get_pip_version() -> Option<String> {
    use std::process::Command;
    for pip in &["pip3", "pip"] {
        let out = Command::new(pip)
            .args(["show", "crawl4ai"])
            .output()
            .ok()?;
        if out.status.success() {
            for line in String::from_utf8_lossy(&out.stdout).lines() {
                if line.starts_with("Version:") {
                    return Some(line.trim_start_matches("Version:").trim().to_string());
                }
            }
        }
    }
    None
}

async fn fetch_pypi_latest() -> Result<String, String> {
    #[derive(Deserialize)]
    struct PyPiInfo {
        version: String,
    }
    #[derive(Deserialize)]
    struct PyPiResponse {
        info: PyPiInfo,
    }

    let resp = reqwest::get("https://pypi.org/pypi/crawl4ai/json")
        .await
        .map_err(|e| e.to_string())?
        .json::<PyPiResponse>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(resp.info.version)
}
