# 见字 · Jianzi

一款本地优先的中文写作、私人书单与灵感墙应用。视觉方向：现代文学排版 + 明快的 Doodle 插画；操作简单，分类可选。

## 当前版本

- **文字**：随笔、日记、小说、歌词、摘抄、灵感、未分类。
- **灵感墙**：独立主题墙，从文字中关联内容；自动排版，不要求手动拖动。
- **书单**：独立页面、紧凑文字卡片、评分、阅读状态、关键词、人物及读后感搜索；可按评分和状态筛选。
- **持久化**：Tauri 桌面版会尝试使用本地 SQLite；浏览器预览使用 localStorage。提供 JSON 备份导出。
- **视觉素材**：独立 Doodle 风格狗狗 SVG，使用明亮的青柠绿、天空蓝和杏黄点缀，与纸白底色和中文字体统一。
- **构建检查**：GitHub Actions 会在 push / PR 时运行前端 TypeScript 与 Vite 构建。

演示数据仅用于展示界面，不是实际阅读记录。

## 开发

推荐 macOS，安装 Node.js LTS、Rust 工具链以及 Tauri 所需的 macOS 系统依赖。

```bash
npm install
npm run dev
```

浏览器开发地址为 `http://localhost:1420`。

```bash
npm run build
npm run icon:dog
npm run tauri dev
npm run tauri build
```

## 重要说明

- 当前项目已接入 SQLite 初始化与数据快照保存逻辑，但还需要通过 GitHub Actions 验证前端构建，并在 macOS 上实际验证 Tauri / SQLite 插件的运行与打包。
- 小说章节、历史版本、独立结局分支、图片导入及更完整的备份恢复流程仍待后续开发。
- 浏览器预览的数据保存在 localStorage，清理浏览器数据可能导致丢失。请定期使用 JSON 导出备份。
- 不要将私人小说、日记、真实数据库或密钥提交到 GitHub。数据库文件、构建产物和环境变量已加入 `.gitignore`。

Mac Dock 图标使用用户提供的原始 Gemini 探头小狗 `public/doodles/gemini-dog-6.webp`。首次运行或更换图标后，先执行 `npm install` 和 `npm run icon:dog`，自动生成 Tauri 所需的 PNG / ICNS 等图标，再运行 `npm run tauri dev` 或 `npm run tauri build`。注意：`tauri dev` 窗口标题旁的系统图标或 Dock 缓存可能需要重启 App 才更新。
