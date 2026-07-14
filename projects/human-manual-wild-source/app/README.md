# 应用路由

这里采用 Next.js App Router，并由 vinext 编译到 Cloudflare Worker。

## 路由

- `/`：公开首页；已登录时同步用户档案
- `/journey`：三轮渐进测评，匿名用户也可完成
- `/api/reports`：已登录用户保存阶段报告；服务端重新验证完整题序
- `/dashboard`：当前用户的报告历史
- `/report/[id]`：报告详情；仅所有者或管理员可访问
- `/admin`：管理员总览

## 身份边界

`chatgpt-auth.ts` 只读取 Sites 注入的可信请求头，并提供登录、退出和安全的站内返回地址。依赖用户身份的页面必须保留 `dynamic = "force-dynamic"`，不得把角色校验移到客户端。

## 修改约束

- 测评题目和报告算法统一放在 `lib/assessment.ts`，不要复制到页面中。
- 保存接口必须调用 `validateProgress`，不能只检查答案数量。
- 新增页面时复用 `components/` 中的公共组件和 `app/globals.css` 中的设计变量。
- 所有自我探索结论都应保持非诊断措辞。
