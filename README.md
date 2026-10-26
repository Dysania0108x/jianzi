# 见字 · Jianzi

一款本地优先的中文写作、私人书单与灵感墙应用。

## 当前阶段

第一版桌面工程骨架及前端原型正在搭建，包含：

- **文字**：随笔、日记、小说、歌词、摘抄、灵感、未分类。
- **灵感墙**：独立主题墙，从文字中关联内容；以自动排版呈现，不要求手动拖动。
- **书单**：独立页面，紧凑文字卡片、评分、阅读状态、标签、人物及读后感搜索。
- **本地演示存储**：当前前端使用浏览器 `localStorage`，并支持 JSON 备份。
- **Tauri 2 工程配置**：已加入 Rust 工程骨架与 SQLite 插件依赖；正式 SQLite 数据层及桌面构建还未完成。

示例数据只用于展示界面，不是实际阅读记录。

## 开发

推荐 macOS，安装 Node.js LTS、Rust 工具链以及 Tauri 所需的 macOS 系统依赖。

```bash
npm install
npm run dev
```

浏览器开发地址为 `http://localhost:1420`。

```bash
npm run build
npm run tauri dev
npm run tauri build
```

## 隐私提醒

当前演示数据保存在浏览器 `localStorage` 中；清除浏览器数据可能导致丢失。请先使用 JSON 导出备份。**SQLite 本地持久化与可靠的版本恢复尚未完成，因此暂时不要把唯一的私人原稿保存在此版本。** 数据库、构建产物与环境变量已列入 `.gitignore`。
