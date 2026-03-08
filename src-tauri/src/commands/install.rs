use std::process::Command;
use tauri::{AppHandle, Emitter};

/// Package identifier used by pip/brew
const PIP_PACKAGE: &str = "crawl4ai";
/// Homebrew formula name (if published)
const BREW_FORMULA: &str = "crawl4ai";
/// CLI binary name
const BIN_NAME: &str = "crawl4ai";

fn emit_log(app: &AppHandle, msg: &str) {
    let _ = app.emit("install_log", msg.to_string());
}

/// Returns true if the openclaw/crawl4ai binary exists on PATH.
#[tauri::command]
pub async fn check_installed() -> bool {
    which::which(BIN_NAME).is_ok()
        || pip_show().is_some()
}

/// Returns the installed version string, or None if not installed.
#[tauri::command]
pub async fn get_installed_version() -> Option<String> {
    pip_show()
}

/// Install via brew (macOS) or pip (all platforms).
#[tauri::command]
pub async fn install_openclaw(app: AppHandle) -> Result<(), String> {
    emit_log(&app, "▶ 检测安装方式...");
    platform_install(&app)
}

#[cfg(target_os = "macos")]
fn platform_install(app: &AppHandle) -> Result<(), String> {
    if which::which("brew").is_ok() {
        emit_log(app, "  → 使用 Homebrew 安装");
        run_brew_install(app)
    } else {
        emit_log(app, "  → Homebrew 未找到，回退到 pip");
        run_pip_install(app)
    }
}

#[cfg(not(target_os = "macos"))]
fn platform_install(app: &AppHandle) -> Result<(), String> {
    emit_log(app, "  → 使用 pip 安装");
    run_pip_install(app)
}

/// Uninstall via pip (universal).
#[tauri::command]
pub async fn uninstall_openclaw(app: AppHandle) -> Result<(), String> {
    emit_log(&app, "▶ 开始卸载...");
    let pip = find_pip()?;
    emit_log(&app, &format!("  → pip: {pip}"));

    let output = Command::new(&pip)
        .args(["uninstall", "-y", PIP_PACKAGE])
        .output()
        .map_err(|e| format!("执行失败: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    for line in stdout.lines().chain(stderr.lines()) {
        emit_log(&app, line);
    }

    if output.status.success() {
        Ok(())
    } else {
        Err(format!("卸载失败，退出码: {:?}", output.status.code()))
    }
}

// ---- helpers ----

fn pip_show() -> Option<String> {
    let pip = find_pip().ok()?;
    let output = Command::new(&pip)
        .args(["show", PIP_PACKAGE])
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        if line.starts_with("Version:") {
            return Some(line.trim_start_matches("Version:").trim().to_string());
        }
    }
    None
}

fn find_pip() -> Result<String, String> {
    for candidate in &["pip3", "pip", "python3 -m pip", "python -m pip"] {
        if which::which(candidate.split_whitespace().next().unwrap_or("pip")).is_ok() {
            return Ok(candidate.to_string());
        }
    }
    Err("未找到 pip / pip3，请先安装 Python".to_string())
}

fn run_pip_install(app: &AppHandle) -> Result<(), String> {
    let pip = find_pip()?;
    emit_log(app, &format!("$ {pip} install {PIP_PACKAGE} -U"));
    let (cmd, args) = if pip.contains("-m") {
        let parts: Vec<&str> = pip.split_whitespace().collect();
        (
            parts[0].to_string(),
            vec!["-m", "pip", "install", PIP_PACKAGE, "-U"],
        )
    } else {
        (pip.clone(), vec!["install", PIP_PACKAGE, "-U"])
    };

    let output = Command::new(&cmd)
        .args(&args)
        .output()
        .map_err(|e| format!("执行 pip 失败: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    for line in stdout.lines().chain(stderr.lines()) {
        emit_log(app, line);
    }

    if output.status.success() {
        Ok(())
    } else {
        Err(format!("pip install 失败，退出码: {:?}", output.status.code()))
    }
}

#[cfg(target_os = "macos")]
fn run_brew_install(app: &AppHandle) -> Result<(), String> {
    emit_log(app, &format!("$ brew install {BREW_FORMULA}"));

    // Try brew first; if formula not found, fall back to pip
    let output = Command::new("brew")
        .args(["install", BREW_FORMULA])
        .output()
        .map_err(|e| format!("执行 brew 失败: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    for line in stdout.lines().chain(stderr.lines()) {
        emit_log(app, line);
    }

    if output.status.success() {
        return Ok(());
    }

    emit_log(app, "  → brew 安装失败，回退到 pip...");
    run_pip_install(app)
}
