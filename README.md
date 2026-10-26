# 见字 · Jianzi

**收藏喜欢的故事，写下自己的文字。**

见字是一款简洁、自由的中文文字收藏与创作应用。你可以在这里整理读过的小说、记录阅读感想、收藏喜欢的句子，也可以随时写下日记、随笔与尚未完成的故事。

不必遵循固定的记录方式，也不需要复杂的分类。让阅读、灵感与创作，自然地留在同一个地方。

## 主要功能

- **私人书单**：收藏小说，记录评分、标签、人物与读后感；支持搜索、筛选、排序与批量管理。
- **自由写作**：记录小说、随笔、日记、歌词、摘抄和灵感；不要求标题或固定分类。
- **灵感墙**：将已有文字关联到不同主题，自动排版；支持卡片与列表视图，以及重命名。
- **本地存储**：无需注册账号。macOS 桌面版使用本地 SQLite 数据库保存内容。
- **数据备份**：支持将个人内容导出为 JSON 文件。

## 下载与安装

**当前版本：v0.1.0 Beta（开发测试阶段）**

面向 macOS 的早期测试版本。正式的公开下载包将在 GitHub Releases 发布：

[查看 Releases](https://github.com/Dysania0108x/jianzi/releases)

目前如无可下载的 Release，可从源代码自行构建。此项目尚未进行 Apple Developer 签名与公证，macOS 可能在首次启动时提示安全警告。请仅安装来自可信来源的版本。

## 使用说明

见字不需要账号，也不需要云端服务。日常使用时，文字与书单保存在本机。建议定期点击应用内的「导出备份」，并将备份文件妥善保存在其他位置。

**重要：** 目前尚未提供完整的应用内备份恢复功能。JSON 导出不等于已经具备一键恢复能力。请勿将唯一的重要原稿仅保存在测试版中。

## 开发者指南

项目基于 **Tauri 2 + React + TypeScript + SQLite**。在 macOS 上开发需要 Node.js、Rust 以及 Xcode Command Line Tools。

```bash
git clone https://github.com/Dysania0108x/jianzi.git
cd jianzi
npm install
npm run tauri dev
```

构建 macOS 应用：

```bash
npm run icon:dog
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`。

如果本地缺少 `public/doodles/gemini-dog-6.webp`，需要先准备相应的插画素材才能运行图标生成脚本。仓库内的前端构建检查不等同于 macOS 安装包、数据库或安装流程的完整验证。

## 当前限制

- 小说章节、历史版本和多结局分支尚未完整实现。
- 尚无跨设备同步、自动更新或一键备份恢复。
- 浏览器开发预览使用 `localStorage`，与正式桌面应用的 SQLite 存储方式不同。
- 本项目仍处于 Beta 开发阶段，功能和数据结构可能调整。

## 隐私与数据

应用本身不会自动将你的小说、日记或书单上传到 GitHub。请勿将个人数据库、导出的 JSON、私密文件或密钥提交到公开仓库。

---

*见字 · Jianzi — 一个留给文字的私人空间。*

## 公开测试版构建（维护者）

仓库包含手动运行的 [Build macOS beta](https://github.com/Dysania0108x/jianzi/actions/workflows/macos-beta.yml) 工作流，分别构建 Apple Silicon 与 Intel Mac 的未签名安装包。构建产物暂时只上传到 GitHub Actions Artifacts，**不会自动发布 Release**。

运行前请确认已将经授权的原始插画文件 `public/doodles/gemini-dog-1.webp` 至 `gemini-dog-8.webp` 提交到仓库。目前这些文件可能仅存在于开发者电脑中，缺少时工作流会主动停止，以免发布错误的占位图标。

公开发行前还需确认：
- 新安装环境中没有开发示例书籍和示例文字；
- SQLite 保存、关闭重启、删除、JSON 导出与数据恢复经过验证；
- 安装包未包含个人数据库、Notion 迁移文件或私人备份；
- 未签名安装包可能被 macOS Gatekeeper 拦截；请在发布说明中清楚标注。

通过测试后，再手动创建 GitHub Release 并上传已核验的 DMG。当前不应将 Actions 构建通过视为产品已完成正式发布。
