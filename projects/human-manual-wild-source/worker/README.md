# Worker 入口

`index.ts` 是 vinext 应用在 Cloudflare Workers 上的入口。它负责：

1. 将普通请求交给 App Router。
2. 将 `/_vinext/image` 请求交给 Cloudflare Images 转换能力。
3. 声明运行时使用的 `ASSETS`、`DB` 和 `IMAGES` 绑定类型。

业务路由不应直接写在这里。新增运行时绑定时，需要同时更新 `.openai/hosting.json`、本地 Vite 绑定和本文件的 `Env` 类型。
