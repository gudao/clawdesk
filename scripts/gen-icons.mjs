/**
 * scripts/gen-icons.mjs
 * 在 CI 或本地没有图标文件时，用 SVG→PNG 生成所有 Tauri 所需图标。
 * 依赖：ImageMagick (convert) 或系统自带的 rsvg-convert / Inkscape
 *
 * 用法（CI 中内置，无需手动执行）：
 *   node scripts/gen-icons.mjs
 */
import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");
const iconsDir = resolve(root, "src-tauri", "icons");
const svgSrc = resolve(root, "public", "claw.svg");

// 检查图标是否已存在（不重复生成）
if (existsSync(resolve(iconsDir, "icon.icns"))) {
  console.log("✅ Icons already exist, skipping generation.");
  process.exit(0);
}

mkdirSync(iconsDir, { recursive: true });

// 先将 SVG 转成 1024×1024 PNG（需要 ImageMagick 或 rsvg-convert）
const tmpPng = resolve(root, "src-tauri", "icon-source.png");

try {
  // 优先使用 rsvg-convert（质量更好）
  execSync(`rsvg-convert -w 1024 -h 1024 "${svgSrc}" -o "${tmpPng}"`, {
    stdio: "inherit",
  });
} catch {
  try {
    // 回退到 ImageMagick（v6: convert  v7: magick）
    const magickCmd = (() => {
      try { execSync("magick -version", { stdio: "pipe" }); return "magick"; } catch { return "convert"; }
    })();
    execSync(
      `${magickCmd} -background none -resize 1024x1024 "${svgSrc}" "${tmpPng}"`,
      { stdio: "inherit" }
    );
  } catch {
    // 最终回退：纯色占位
    console.warn("⚠️  SVG 转换工具未找到，使用纯色占位图标");
    const magickCmd = (() => {
      try { execSync("magick -version", { stdio: "pipe" }); return "magick"; } catch { return "convert"; }
    })();
    execSync(
      `${magickCmd} -size 1024x1024 xc:#16a34a -fill white -gravity center -font DejaVu-Sans-Bold -pointsize 300 -annotate 0 "C" "${tmpPng}"`,
      { stdio: "inherit" }
    );
  }
}

// 使用 Tauri CLI 生成所有尺寸
console.log("🎨 Generating icons with tauri icon...");
execSync(`npx tauri icon "${tmpPng}"`, {
  stdio: "inherit",
  cwd: root,
});

console.log("✅ Icons generated successfully.");
