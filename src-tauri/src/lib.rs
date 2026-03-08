pub mod commands;

use commands::{config::*, install::*, service::*};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            // Install
            check_installed,
            get_installed_version,
            install_openclaw,
            uninstall_openclaw,
            // Service
            start_service,
            stop_service,
            restart_service,
            get_service_status,
            // Config
            load_config,
            save_config,
            open_data_dir,
            // Update
            check_latest_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running ClawDesk");
}
