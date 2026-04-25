# Love Admin CMS Service

基于 Koa 3、Sequelize、MySQL 的博客 CMS 后端服务，包含公开内容接口和后台管理接口。

## 已具备能力

- 公开侧：文章列表、文章详情、归档、标签、分类、导航、友链、最近文章。
- 后台侧：登录鉴权、仪表盘统计、文章管理、标签管理、分类管理、导航管理、友链管理、站点设置、用户管理、上传、审计日志。
- 内容能力：分页、搜索、草稿/发布/删除状态、浏览量、置顶、推荐、排序、SEO 字段、文章别名。
- 安全基础：JWT、刷新 token、密码哈希、角色权限、权限元数据、登录失败锁定、接口限流、统一异常响应。
- 运维基础：文件访问日志、错误日志、PM2 配置、环境变量样例、OpenAPI 接口文档、数据库备份脚本、真实数据库集成测试脚本。

## 启动

```powershell
pnpm install
Copy-Item .env.example .env
pnpm run dev
```

默认接口前缀是 `/api/v1`。

```text
GET /api/v1/health
```

## 验证

语法和入口检查：

```powershell
pnpm run check
```

真实 MySQL 接口验证：

```powershell
pnpm run test:integration
```

该脚本会初始化 `cms_*` 表，创建临时测试数据，跑登录、刷新 token、分类、标签、导航、上传、文章、后台列表、审计日志等接口，然后清理测试数据。

数据库 JSON 备份：

```powershell
pnpm run backup:db
```

备份文件会生成到 `backups` 目录，该目录不会提交到 Git。

OpenAPI 接口文档：

```text
GET /api/v1/openapi.json
```

OpenAPI 可视化页面：

```text
GET /api/v1/docs
```

## 生产运行

生产环境必须配置：

```text
NODE_ENV=production
JWT_SECRET=<强随机密钥>
ADMIN_PASSWORD=<强密码>
DB_NAME=<数据库名>
DB_HOST=<数据库地址>
DB_USER=<数据库用户>
DB_PASSWORD=<数据库密码>
```

PM2 启动：

```powershell
pm2 start ecosystem.config.cjs
```

## 常用接口

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/articles?page=1&pageSize=10&keyword=
GET  /api/v1/article?id=1
GET  /api/v1/article?slug=hello-world
GET  /api/v1/categories
GET  /api/v1/navs
GET  /api/v1/settings
GET  /api/v1/openapi.json
GET  /api/v1/docs
GET  /api/v1/admin/dashboard
GET  /api/v1/admin/articles
POST /api/v1/admin/articles
GET  /api/v1/admin/settings
POST /api/v1/admin/settings
POST /api/v1/admin/uploads/base64
GET  /api/v1/admin/audit_logs
```

后台接口需要请求头：

```text
Authorization: Bearer <token>
```

## 上传接口

当前提供 base64 上传：

```text
POST /api/v1/admin/uploads/base64
```

请求体：

```json
{
  "mime": "image/png",
  "content": "<base64内容>"
}
```

也支持 `dataUrl`：

```json
{
  "dataUrl": "data:image/png;base64,..."
}
```

上传文件保存到 `public/uploads`，该目录不会提交到 Git。
