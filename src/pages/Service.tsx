import { useEffect, useRef } from "react";
import { Play, Square, RotateCcw, Trash2 } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useAppStore } from "../store";
import { listen } from "@tauri-apps/api/event";
import {
  startService,
  stopService,
  restartService,
  getServiceStatus,
} from "../lib/tauri";
import type { ServiceStatus } from "../types";

export function ServicePage() {
  const {
    serviceStatus,
    setServiceStatus,
    serviceLog,
    appendServiceLog,
    clearServiceLog,
    config,
    addToast,
  } = useAppStore();

  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [serviceLog]);

  // Listen for service log events
  useEffect(() => {
    const unlisten = listen<string>("service_log", (e) => {
      appendServiceLog(e.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [appendServiceLog]);

  // Poll status every 5s
  useEffect(() => {
    refreshStatus();
    const timer = setInterval(refreshStatus, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshStatus() {
    try {
      const status = await getServiceStatus();
      setServiceStatus(status as ServiceStatus);
    } catch {
      setServiceStatus("unknown");
    }
  }

  async function handleStart() {
    setServiceStatus("starting");
    try {
      await startService();
      setServiceStatus("running");
      appendServiceLog("✅ 服务启动成功");
      addToast("success", "OpenClaw 服务已启动");
    } catch (err) {
      setServiceStatus("stopped");
      appendServiceLog(`❌ 启动失败: ${err}`);
      addToast("error", `服务启动失败: ${err}`);
    }
  }

  async function handleStop() {
    setServiceStatus("stopping");
    try {
      await stopService();
      setServiceStatus("stopped");
      appendServiceLog("⏹ 服务已停止");
      addToast("info", "OpenClaw 服务已停止");
    } catch (err) {
      setServiceStatus("running");
      appendServiceLog(`❌ 停止失败: ${err}`);
      addToast("error", `服务停止失败: ${err}`);
    }
  }

  async function handleRestart() {
    setServiceStatus("stopping");
    try {
      await restartService();
      setServiceStatus("running");
      appendServiceLog("🔄 服务已重启");
      addToast("success", "OpenClaw 服务已重启");
    } catch (err) {
      setServiceStatus("unknown");
      appendServiceLog(`❌ 重启失败: ${err}`);
      addToast("error", `服务重启失败: ${err}`);
    }
  }

  const isBusy =
    serviceStatus === "starting" || serviceStatus === "stopping";

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          服务控制
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理 OpenClaw 后台服务的运行状态
        </p>
      </div>

      {/* Status Card */}
      <div className="card p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              服务状态
            </p>
            <div className="mt-2">
              <StatusBadge status={serviceStatus} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              监听地址
            </p>
            <p className="mt-2 text-sm font-mono text-gray-700 dark:text-gray-300">
              {config.host}:{config.port}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleStart}
          disabled={isBusy || serviceStatus === "running"}
          className="btn-primary"
        >
          <Play size={16} />
          {serviceStatus === "starting" ? "启动中..." : "启动"}
        </button>
        <button
          onClick={handleStop}
          disabled={isBusy || serviceStatus === "stopped" || serviceStatus === "unknown"}
          className="btn-danger"
        >
          <Square size={16} />
          {serviceStatus === "stopping" ? "停止中..." : "停止"}
        </button>
        <button
          onClick={handleRestart}
          disabled={isBusy || serviceStatus !== "running"}
          className="btn-secondary"
        >
          <RotateCcw size={16} />
          重启
        </button>
      </div>

      {/* Service Log */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            实时日志
          </span>
          <button
            onClick={clearServiceLog}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} />
            清除
          </button>
        </div>
        <div
          ref={logRef}
          className="p-4 h-64 overflow-y-auto font-mono text-xs bg-gray-900 dark:bg-black"
        >
          {serviceLog.length === 0 ? (
            <p className="text-gray-600">暂无日志...</p>
          ) : (
            serviceLog.map((line, i) => (
              <div
                key={i}
                className={`leading-relaxed ${
                  line.startsWith("❌")
                    ? "text-red-400"
                    : line.startsWith("✅") || line.startsWith("🔄")
                    ? "text-green-400"
                    : "text-gray-300"
                }`}
              >
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
