# ClawDesk

> OpenClaw GUI Manager — Windows & macOS 一键安装桌面客户端

## 功能

| 模块        | 说明                                                        |
| ----------- | ----------------------------------------------------------- |
| 安装管理    | 一键安装/卸载 OpenClaw（macOS 用 brew，Windows 用 pip）     |
| 服务控制    | 启动 / 停止 / 重启后台服务，实时日志                        |
| 配置设置    | 端口、目录、日志级别、代理等，支持后续扩展 Agent & 安全模块 |
| 关于 & 更新 | 版本检测，拉取 PyPI 最新版本                                |

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Zustand
- **桌面**: Tauri v2 (Rust)
- **构建**: Vite

## 开发环境依赖

| 工具             | 安装方式                                                          |
| ---------------- | ----------------------------------------------------------------- |
| Node.js ≥ 18     | https://nodejs.org 或 `nvm`                                       |
| Rust (stable)    | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| pnpm (可选)      | `npm i -g pnpm`                                                   |
| macOS 额外依赖   | Xcode Command Line Tools: `xcode-select --install`                |
| Windows 额外依赖 | Visual Studio C++ Build Tools / WebView2                          |

完整 Tauri 环境配置参见：https://tauri.app/start/prerequisites/

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 开发模式
npm run tauri dev

# 3. 构建发行包
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`。

## 项目结构

```
clawDesk/
├── src/                  # React 前端
│   ├── components/       # Sidebar, StatusBadge, Toast
│   ├── pages/            # Install, Service, Settings, About
│   ├── store/            # Zustand 全局状态
│   ├── lib/tauri.ts      # Tauri IPC 桥接层
│   └── types/            # TypeScript 类型定义
└── src-tauri/            # Rust 后端
    └── src/commands/
        ├── install.rs    # 安装/卸载逻辑
        ├── service.rs    # 服务启停逻辑
        └── config.rs     # 配置读写 & 版本检测
```

## 扩展指南

### 新增配置项

1. 在 `src/types/index.ts` 的 `AppConfig` 中添加字段
2. 在 `src-tauri/src/commands/config.rs` 的 `AppConfig` struct 中同步
3. 在 `src/pages/Settings.tsx` 对应 `<Section>` 中添加表单项

### 新增 IPC 命令

1. 在 `src-tauri/src/commands/` 中添加函数 + `#[tauri::command]`
2. 在 `src-tauri/src/lib.rs` 的 `invoke_handler!` 中注册
3. 在 `src/lib/tauri.ts` 中暴露对应 TypeScript 函数

## License

MIT
