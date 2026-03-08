import { useEffect, useState } from "react";
import { RefreshCw, ExternalLink, Download, Clover } from "lucide-react";
import { useAppStore } from "../store";
import { checkLatestVersion } from "../lib/tauri";

const APP_VERSION = "0.1.0";
const GITHUB_URL = "https://github.com/unclecode/crawl4ai";
const DOCS_URL = "https://docs.crawl4ai.com";

export function AboutPage() {
  const { versionInfo, setVersionInfo, addToast } = useAppStore();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    handleCheckUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheckUpdate() {
    setChecking(true);
    try {
      const info = await checkLatestVersion();
      setVersionInfo(info);
    } catch {
      // ignore silently
    } finally {
      setChecking(false);
    }
  }

  async function handleUpdate() {
    addToast("info", "正在打开下载页面...");
    // open release page
    window.open(`${GITHUB_URL}/releases/latest`, "_blank");
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          关于 & 更新
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          版本信息与更新检测
        </p>
      </div>

      {/* App Info Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg">
            <Clover size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              ClawDesk
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              OpenClaw GUI Manager
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              App v{APP_VERSION}
            </p>
          </div>
        </div>
      </div>

      {/* OpenClaw Version */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          OpenClaw 版本
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              当前安装版本
            </p>
            <p className="mt-1 text-sm font-mono font-medium text-gray-800 dark:text-gray-200">
              {versionInfo.installed ?? "未安装"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">最新版本</p>
            <p className="mt-1 text-sm font-mono font-medium text-gray-800 dark:text-gray-200">
              {checking ? "检测中..." : (versionInfo.latest ?? "未知")}
            </p>
          </div>
        </div>

        {versionInfo.hasUpdate && (
          <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
                🎉 发现新版本 {versionInfo.latest}
              </p>
              <p className="text-xs text-brand-600 dark:text-brand-500 mt-0.5">
                建议立即更新以获得最新功能
              </p>
            </div>
            <button onClick={handleUpdate} className="btn-primary text-sm">
              <Download size={14} />
              立即更新
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCheckUpdate}
            disabled={checking}
            className="btn-secondary text-sm"
          >
            <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
            {checking ? "检测中..." : "检查更新"}
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          相关链接
        </h3>
        {[
          { label: "GitHub 仓库", url: GITHUB_URL },
          { label: "官方文档", url: DOCS_URL },
          { label: "Issue 反馈", url: `${GITHUB_URL}/issues` },
          { label: "发布日志", url: `${GITHUB_URL}/releases` },
        ].map(({ label, url }) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800
                       group transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {label}
            </span>
            <ExternalLink
              size={14}
              className="text-gray-400 group-hover:text-brand-500 transition-colors"
            />
          </a>
        ))}
      </div>

      {/* Footer */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-600 pb-2">
        Built with Tauri + React · MIT License
      </p>
    </div>
  );
}
