# Sean Blog CMS Service

基于 Koa、Sequelize、MySQL 的博客 CMS 后端服务，包含公开内容接口和后台管理接口。

## 功能

- 公开侧：文章列表、文章详情、归档、标签、友链、最近文章
- 后台侧：登录鉴权、仪表盘统计、文章管理、标签管理、友链管理、用户管理
- 安全基础：JWT 登录、密码哈希、角色权限、统一异常响应、请求体大小限制
- 内容能力：文章搜索、分页、草稿/发布/删除状态、浏览量统计

## 启动

```powershell
pnpm install
pnpm run dev
```

默认接口前缀是 `/api/v1`，健康检查接口：

```text
GET /api/v1/health
```

## 环境变量

复制 `.env.example` 后按本地环境调整。生产环境必须配置 `JWT_SECRET` 和 `ADMIN_PASSWORD`。

```powershell
Copy-Item .env.example .env
```

## 常用接口

```text
POST /api/v1/auth/login
GET  /api/v1/articles?page=1&pageSize=10&keyword=
GET  /api/v1/article?id=1
GET  /api/v1/admin/dashboard
GET  /api/v1/admin/articles
POST /api/v1/admin/articles
GET  /api/v1/admin/users
```

后台接口需要请求头：

```text
Authorization: Bearer <token>
```
