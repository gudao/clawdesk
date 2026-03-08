import { useEffect, useRef } from "react";
import { Download, Trash2, RefreshCw, Terminal } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useAppStore } from "../store";
import { listen } from "@tauri-apps/api/event";
import {
  checkInstalled,
  getInstalledVersion,
  installOpenClaw,
  uninstallOpenClaw,
} from "../lib/tauri";

export function InstallPage() {
  const {
    installStatus,
    setInstallStatus,
    installLog,
    appendLog,
    clearLog,
    addToast,
    versionInfo,
    setVersionInfo,
  } = useAppStore();

  const logRef = useRef<HTMLDivElement>(null);

  // Scroll log to bottom on new line
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [installLog]);

  // Listen for install log events from Rust
  useEffect(() => {
    const unlisten = listen<string>("install_log", (e) => {
      appendLog(e.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [appendLog]);

  // Check install status on mount
  useEffect(() => {
    handleCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheck() {
    setInstallStatus("checking");
    try {
      const installed = await checkInstalled();
      if (installed) {
        const version = await getInstalledVersion();
        setVersionInfo({ installed: version });
        setInstallStatus("installed");
      } else {
        setInstallStatus("not_installed");
      }
    } catch (err) {
      setInstallStatus("not_installed");
      console.error(err);
    }
  }

  async function handleInstall() {
    clearLog();
    setInstallStatus("installing");
    appendLog("▶ 开始安装 OpenClaw...");
    try {
      await installOpenClaw();
      appendLog("✅ 安装成功！");
      setInstallStatus("installed");
      const version = await getInstalledVersion();
      setVersionInfo({ installed: version });
      addToast("success", "OpenClaw 安装成功！");
    } catch (err) {
      appendLog(`❌ 安装失败: ${err}`);
      setInstallStatus("not_installed");
      addToast("error", `安装失败: ${err}`);
    }
  }

  async function handleUninstall() {
    if (!confirm("确定要卸载 OpenClaw 吗？")) return;
    clearLog();
    setInstallStatus("uninstalling");
    appendLog("▶ 开始卸载 OpenClaw...");
    try {
      await uninstallOpenClaw();
      appendLog("✅ 卸载成功！");
      setInstallStatus("not_installed");
      setVersionInfo({ installed: null });
      addToast("success", "OpenClaw 已成功卸载");
    } catch (err) {
      appendLog(`❌ 卸载失败: ${err}`);
      setInstallStatus("installed");
      addToast("error", `卸载失败: ${err}`);
    }
  }

  const isBusy =
    installStatus === "installing" ||
    installStatus === "uninstalling" ||
    installStatus === "checking";

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          安装管理
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          通过 pip / brew 一键安装或卸载 OpenClaw
        </p>
      </div>

      {/* Status Card */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              安装状态
            </p>
            <div className="mt-2 flex items-center gap-3">
              <StatusBadge status={installStatus} />
              {versionInfo.installed && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  版本 {versionInfo.installed}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleCheck}
            disabled={isBusy}
            className="btn-secondary text-xs px-3 py-1.5"
            title="重新检测"
          >
            <RefreshCw size={14} className={isBusy ? "animate-spin" : ""} />
            检测
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleInstall}
          disabled={isBusy || installStatus === "installed"}
          className="btn-primary"
        >
          <Download size={16} />
          {installStatus === "installing" ? "安装中..." : "一键安装"}
        </button>
        <button
          onClick={handleUninstall}
          disabled={isBusy || installStatus === "not_installed"}
          className="btn-danger"
        >
          <Trash2 size={16} />
          {installStatus === "uninstalling" ? "卸载中..." : "卸载"}
        </button>
      </div>

      {/* Install Method Note */}
      <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
          安装方式说明
        </p>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
          <li>
            <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
              macOS
            </span>{" "}
            — 优先使用 <code>brew install opencrawl-ai</code>，回退到 pip
          </li>
          <li>
            <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
              Windows
            </span>{" "}
            — 使用 <code>pip install crawl4ai</code>
          </li>
        </ul>
      </div>

      {/* Log */}
      {installLog.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <Terminal size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              安装日志
            </span>
          </div>
          <div
            ref={logRef}
            className="p-4 h-44 overflow-y-auto font-mono text-xs text-gray-700 dark:text-gray-300 space-y-0.5 bg-gray-900 dark:bg-black"
          >
            {installLog.map((line, i) => (
              <div key={i} className="leading-relaxed text-green-400">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
