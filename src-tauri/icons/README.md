# Icons

Tauri 打包需要以下图标文件：

```
icons/
├── 32x32.png
├── 128x128.png
├── 128x128@2x.png
├── icon.icns        (macOS)
├── icon.ico         (Windows)
└── icon.png         (原始 1024x1024)
```

## 生成图标

准备一张 **1024×1024** 的 PNG 源图（建议使用 `../public/claw.svg` 转换），然后运行：

```bash
npm run tauri icon path/to/icon-1024.png
```

Tauri CLI 会自动生成所有尺寸。
