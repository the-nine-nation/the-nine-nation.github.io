# 人类说明书（野生版）

一个面向中文用户的渐进式内在探索网站。用户会依次完成 10、15、20 题三轮情境测评；每轮结束均可查看阶段报告，后续题目会根据此前信号动态选择。报告综合 MBTI、Big Five、核心价值、关系模式、情绪调节、边界与恢复弹性等维度。

> 本项目用于自我探索与交流，不构成医学诊断、心理治疗或专业咨询意见。

## 功能概览

- 三轮渐进探索，共 45 题；第二、三轮自适应选题
- 每轮生成一份当前报告，已登录用户自动保存同一探索记录
- ChatGPT 登录、个人报告历史和打印 / PDF 导出
- 管理员查看用户、报告数量、探索深度和近期类型分布
- Cloudflare D1 持久化，运行于 OpenAI Sites / Cloudflare Workers

## 本地运行

要求 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

开发服务使用项目内的本地 D1 模拟环境。不要提交 `.env*`、`.wrangler/`、`dist/` 等运行产物。

## 质量检查

```bash
npm run check
```

该命令依次执行代码规范检查、生产构建和测评引擎回归测试。也可单独运行：

```bash
npm run lint
npm run build
npm test
```

## 数据库变更

1. 修改 `db/schema.ts`。
2. 运行 `npm run db:generate`。
3. 检查 `drizzle/` 中的新迁移和快照。
4. 运行 `npm run check` 后再发布。

生产环境首次请求也会通过 `lib/data.ts` 做兼容性建表与旧字段补齐，但它不能替代正式迁移。

## 身份与管理员

身份由 Sites 注入的 ChatGPT 登录请求头提供。首位注册用户会在未配置管理员名单时成为初始管理员；也可在托管环境设置逗号分隔的 `ADMIN_EMAILS`。名单中的用户在下次访问时会被提升为管理员。

不要在客户端信任角色信息。管理员页面和报告读取权限均在服务端校验。

## 目录说明

- `app/`：页面、路由和身份辅助函数
- `components/`：跨页面界面组件
- `lib/`：自适应测评引擎与数据访问层
- `db/`：Drizzle 数据库连接和模式
- `drizzle/`：按顺序执行的 D1 迁移
- `worker/`：Cloudflare Worker 入口
- `build/`：Sites 构建打包插件
- `tests/`：业务规则回归测试
- `.openai/`：Sites 托管资源声明

各目录内的 `README.md` 记录了该模块的职责、约束和修改注意事项。

## GitHub Pages 浏览器版

`github-pages/` 是不依赖服务端的 GitHub Pages 入口。运行 `npm run build:pages` 后，静态产物写入 `pages-dist/`。它保留三轮自适应测评、阶段报告、打印、本机档案与本机观察室；由于 GitHub Pages 无法运行服务端代码，数据只保存在当前浏览器，完整登录和 D1 数据库能力仍由 Sites 版本提供。
