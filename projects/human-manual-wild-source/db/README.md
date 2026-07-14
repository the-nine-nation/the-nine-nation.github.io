# 数据库层

项目使用 Cloudflare D1（SQLite）与 Drizzle ORM。

## 表

- `users`：邮箱、显示名、角色、创建时间和最近访问时间
- `reports`：探索会话 ID、所有者、MBTI / 原型摘要、完成轮次、答题数、原始答案和完整报告 JSON

报告 ID 由浏览器生成 UUID，并在服务端做格式、所有权和完整题序校验。同一探索会话每轮更新同一条记录，避免产生三份重复报告。

修改 `schema.ts` 后运行 `npm run db:generate`，检查迁移，再执行 `npm run check`。不要手工修改已经发布的旧迁移。
