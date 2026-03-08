import { useEffect, useState } from "react";
import { Save, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import { useAppStore } from "../store";
import { loadConfig, saveConfig, openDataDir } from "../lib/tauri";

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

function Section({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        className={`w-full flex items-center justify-between px-5 py-4 text-left ${
          collapsible ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : ""
        }`}
        onClick={() => collapsible && setOpen(!open)}
        disabled={!collapsible}
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        {collapsible &&
          (open ? (
            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
          ))}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { config, setConfig, configDirty, setConfigDirty, addToast } =
    useAppStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig()
      .then((cfg) => {
        setConfig(cfg);
        setConfigDirty(false);
      })
      .catch(() => {
        // Use defaults on error
        setConfigDirty(false);
      });
  }, [setConfig, setConfigDirty]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveConfig(config);
      setConfigDirty(false);
      addToast("success", "配置已保存");
    } catch (err) {
      addToast("error", `保存失败: ${err}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            配置设置
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            管理 OpenClaw 的运行参数
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!configDirty || saving}
          className="btn-primary"
        >
          <Save size={15} />
          {saving ? "保存中..." : "保存配置"}
        </button>
      </div>

      {/* Basic Settings */}
      <Section title="基础配置" description="服务监听地址、端口等基本参数">
        <div className="grid grid-cols-2 gap-4">
          <Field label="监听地址" hint="0.0.0.0 表示监听所有网络接口">
            <input
              type="text"
              className="input-field"
              value={config.host}
              onChange={(e) => setConfig({ host: e.target.value })}
              placeholder="0.0.0.0"
            />
          </Field>
          <Field label="端口" hint="默认 11235">
            <input
              type="number"
              className="input-field"
              value={config.port}
              onChange={(e) => setConfig({ port: Number(e.target.value) })}
              min={1024}
              max={65535}
            />
          </Field>
        </div>

        <Field label="数据目录">
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              value={config.dataDir}
              onChange={(e) => setConfig({ dataDir: e.target.value })}
              placeholder="默认路径"
            />
            <button
              onClick={openDataDir}
              className="btn-secondary px-3"
              title="打开目录"
            >
              <FolderOpen size={15} />
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="日志级别">
            <select
              className="input-field"
              value={config.logLevel}
              onChange={(e) =>
                setConfig({
                  logLevel: e.target.value as typeof config.logLevel,
                })
              }
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </Field>
          <Field label="最大并发数" hint="同时处理的爬取任务数">
            <input
              type="number"
              className="input-field"
              value={config.maxConcurrency}
              onChange={(e) =>
                setConfig({ maxConcurrency: Number(e.target.value) })
              }
              min={1}
              max={50}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="超时时间（秒）">
            <input
              type="number"
              className="input-field"
              value={config.timeout}
              onChange={(e) => setConfig({ timeout: Number(e.target.value) })}
              min={5}
              max={300}
            />
          </Field>
          <Field label="自动启动">
            <div className="flex items-center gap-3 h-10">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={config.autoStart}
                  onChange={(e) => setConfig({ autoStart: e.target.checked })}
                />
                <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-brand-500
                                rounded-full peer peer-checked:after:translate-x-full after:content-['']
                                after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full
                                after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600" />
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                随系统启动
              </span>
            </div>
          </Field>
        </div>
      </Section>

      {/* Proxy */}
      <Section
        title="代理设置"
        description="为爬取请求配置 HTTP/HTTPS 代理"
        collapsible
        defaultOpen={false}
      >
        <div className="flex items-center gap-3 mb-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={config.enableProxy}
              onChange={(e) => setConfig({ enableProxy: e.target.checked })}
            />
            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-brand-500
                            rounded-full peer peer-checked:after:translate-x-full after:content-['']
                            after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full
                            after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600" />
          </label>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            启用代理
          </span>
        </div>
        <Field label="代理地址" hint="例如 http://127.0.0.1:7890">
          <input
            type="text"
            className="input-field"
            value={config.proxyUrl}
            onChange={(e) => setConfig({ proxyUrl: e.target.value })}
            disabled={!config.enableProxy}
            placeholder="http://127.0.0.1:7890"
          />
        </Field>
      </Section>

      {/* Agent (Future) */}
      <Section
        title="Agent 能力"
        description="AI Agent 集成配置（开发中）"
        collapsible
        defaultOpen={false}
      >
        <div className="flex items-center gap-3 mb-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={config.agentEnabled}
              onChange={(e) => setConfig({ agentEnabled: e.target.checked })}
            />
            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-brand-500
                            rounded-full peer peer-checked:after:translate-x-full after:content-['']
                            after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full
                            after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600" />
          </label>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            启用 Agent
          </span>
        </div>
        <Field label="Agent Endpoint">
          <input
            type="text"
            className="input-field"
            value={config.agentEndpoint}
            onChange={(e) => setConfig({ agentEndpoint: e.target.value })}
            disabled={!config.agentEnabled}
            placeholder="http://localhost:8080"
          />
        </Field>
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            🚧 Agent 能力模块正在开发中，敬请期待。
          </p>
        </div>
      </Section>

      {/* Security (Future) */}
      <Section
        title="安全设置"
        description="API 密钥认证、跨域访问控制"
        collapsible
        defaultOpen={false}
      >
        <div className="flex items-center gap-3 mb-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={config.apiKeyEnabled}
              onChange={(e) => setConfig({ apiKeyEnabled: e.target.checked })}
            />
            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-brand-500
                            rounded-full peer peer-checked:after:translate-x-full after:content-['']
                            after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full
                            after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600" />
          </label>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            启用 API Key 认证
          </span>
        </div>
        <Field label="API Key" hint="留空则自动生成">
          <input
            type="password"
            className="input-field"
            value={config.apiKey}
            onChange={(e) => setConfig({ apiKey: e.target.value })}
            disabled={!config.apiKeyEnabled}
            placeholder="sk-..."
          />
        </Field>
        <Field label="允许的来源 (CORS)" hint="多个来源用逗号分隔，* 表示允许所有">
          <input
            type="text"
            className="input-field"
            value={config.allowedOrigins}
            onChange={(e) => setConfig({ allowedOrigins: e.target.value })}
            placeholder="*"
          />
        </Field>
      </Section>
    </div>
  );
}
