# Sites 构建辅助

`sites-vite-plugin.ts` 在生产构建结束后，把 `.openai/hosting.json` 和 `drizzle/` 迁移复制进 `dist/.openai/`。Sites 发布流程依赖这些文件创建正确的运行时资源。

不要删除该插件或从 `vite.config.ts` 中移除 `sites()`。修改打包逻辑后，检查 `dist/server/index.js`、`dist/.openai/hosting.json` 和 `dist/.openai/drizzle/` 是否存在。
