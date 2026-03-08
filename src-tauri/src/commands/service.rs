use std::process::Command;
use tauri::{AppHandle, Emitter};

const SERVICE_BIN: &str = "crawl4ai-server";

fn emit_log(app: &AppHandle, msg: &str) {
    let _ = app.emit("service_log", msg.to_string());
}

/// Get current service status: "running" | "stopped" | "unknown"
#[tauri::command]
pub async fn get_service_status() -> String {
    if is_process_running() {
        "running".to_string()
    } else {
        "stopped".to_string()
    }
}

/// Start the OpenClaw service in the background.
#[tauri::command]
pub async fn start_service(app: AppHandle) -> Result<(), String> {
    emit_log(&app, "▶ 启动 OpenClaw 服务...");

    // Find the binary (may be "python3 -m crawl4ai.server")
    let bin = find_service_bin()?;
    emit_log(&app, &format!("  → {bin}"));

    let parts: Vec<&str> = bin.splitn(2, ' ').collect();
    let cmd = parts[0];
    let extra_args: Vec<&str> = if parts.len() > 1 {
        parts[1].split_whitespace().collect()
    } else {
        vec![]
    };

    Command::new(cmd)
        .args(&extra_args)
        .spawn()
        .map_err(|e| format!("启动失败: {e}"))?;

    emit_log(&app, "✅ 服务已在后台启动");
    Ok(())
}

/// Stop the OpenClaw service.
#[tauri::command]
pub async fn stop_service(app: AppHandle) -> Result<(), String> {
    emit_log(&app, "⏹ 停止 OpenClaw 服务...");
    stop_service_impl(&app)?;
    emit_log(&app, "⏹ 服务已停止");
    Ok(())
}

#[cfg(target_family = "unix")]
fn stop_service_impl(app: &AppHandle) -> Result<(), String> {
    let output = Command::new("pkill")
        .args(["-f", SERVICE_BIN])
        .output()
        .map_err(|e| format!("pkill 失败: {e}"))?;
    if !output.status.success() {
        emit_log(app, "  → 进程未运行或已停止");
    }
    Ok(())
}

#[cfg(target_os = "windows")]
fn stop_service_impl(app: &AppHandle) -> Result<(), String> {
    let output = Command::new("taskkill")
        .args(["/IM", &format!("{SERVICE_BIN}.exe"), "/F"])
        .output()
        .map_err(|e| format!("taskkill 失败: {e}"))?;
    let stderr = String::from_utf8_lossy(&output.stderr);
    if !output.status.success() && !stderr.contains("not found") {
        emit_log(app, &format!("  → {stderr}"));
    }
    Ok(())
}

/// Restart the OpenClaw service.
#[tauri::command]
pub async fn restart_service(app: AppHandle) -> Result<(), String> {
    emit_log(&app, "🔄 重启服务...");
    stop_service(app.clone()).await?;
    tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
    start_service(app).await
}

// ---- helpers ----

fn find_service_bin() -> Result<String, String> {
    if let Ok(path) = which::which(SERVICE_BIN) {
        return Ok(path.to_string_lossy().to_string());
    }
    // Fallback: use crawl4ai module directly
    if which::which("python3").is_ok() {
        return Ok("python3 -m crawl4ai.server".to_string());
    }
    Err(format!(
        "未找到 {SERVICE_BIN}，请先安装 OpenClaw"
    ))
}

#[cfg(not(any(target_family = "unix", target_os = "windows")))]
fn stop_service_impl(_app: &AppHandle) -> Result<(), String> {
    Ok(())
}

#[cfg(target_family = "unix")]
fn is_process_running() -> bool {
    Command::new("pgrep")
        .args(["-f", SERVICE_BIN])
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[cfg(target_os = "windows")]
fn is_process_running() -> bool {
    Command::new("tasklist")
        .args(["/FI", &format!("IMAGENAME eq {SERVICE_BIN}.exe")])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).contains(SERVICE_BIN))
        .unwrap_or(false)
}

#[cfg(not(any(target_family = "unix", target_os = "windows")))]
fn is_process_running() -> bool { false }
