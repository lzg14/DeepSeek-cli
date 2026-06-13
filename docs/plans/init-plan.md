# DeepSeek CLI (seek) 初始化计划

## 概述

仿照 mmx-cli 架构，为 DeepSeek API 开发一个命令行工具。

**名字：** `seek`
**命令前缀：** `seek`
**位置：** `D:/ProjectFile/DeepSeek-cli`（用户已建目录）

## 核心命令

| 命令 | 说明 | API 端点 |
|---|---|---|
| `seek chat` | 文本对话（支持思考模式） | `POST /chat/completions` |
| `seek models` | 列出可用模型 | `GET /models` |
| `seek balance` | 查询账户余额 | `GET /user/balance` |
| `seek complete` | FIM 代码补全（Beta） | `POST /completions` |

## 目录结构（参考 mmx-cli）

```
seek-cli/
├── src/
│   ├── main.ts           # 入口
│   ├── registry.ts        # 命令注册
│   ├── args.ts           # 参数解析
│   ├── command.ts         # 命令定义
│   ├── client/
│   │   ├── http.ts       # HTTP 客户端
│   │   └── endpoints.ts  # 端点管理
│   ├── config/
│   │   ├── loader.ts     # 配置加载
│   │   └── schema.ts     # 配置 schema
│   ├── auth/
│   │   └── credentials.ts # 凭证管理
│   ├── errors/
│   │   ├── base.ts
│   │   ├── codes.ts
│   │   └── handler.ts
│   ├── output/
│   │   └── formatter.ts  # 输出格式化
│   ├── commands/
│   │   ├── chat.ts
│   │   ├── models.ts
│   │   ├── balance.ts
│   │   └── complete.ts
│   └── utils/
│       └── image.ts
├── docs/
│   └── plans/
│       └── init-plan.md
├── package.json
└── README.md
```

## API 信息

**Base URL：** `https://api.deepseek.com`

**认证：** Bearer Token（API Key）

**模型：**
- `deepseek-v4-flash` — 低价，1M 上下文
- `deepseek-v4-pro` — 高性能

**价格（每百万 tokens）：**
| 模型 | 输入（缓存命中） | 输入（未命中） | 输出 |
|---|---|---|---|
| deepseek-v4-flash | 0.02 元 | 1 元 | 2 元 |
| deepseek-v4-pro | 0.025 元 | 3 元 | 6 元 |

## 技术栈

- **运行时：** Bun + TypeScript
- **依赖：** 极简，主要用原生 `fetch`
- **构建：** Bun 内置

## 实现步骤

### Phase 1：基础框架
1. [ ] 初始化项目结构（package.json, tsconfig.json）
2. [ ] 实现 main.ts 入口
3. [ ] 实现 registry.ts 命令注册
4. [ ] 实现 args.ts 参数解析
5. [ ] 实现 config/ 配置管理
6. [ ] 实现 client/ HTTP 客户端
7. [ ] 实现 auth/ 凭证管理

### Phase 2：核心命令
8. [ ] 实现 `seek chat`
9. [ ] 实现 `seek models`
10. [ ] 实现 `seek balance`

### Phase 3：扩展
11. [ ] 实现 `seek complete`（FIM Beta）
12. [ ] 思考模式支持（`--think` / `--no-think`）
13. [ ] 流式输出支持（`--stream`）
14. [ ] 交互式 REPL 模式

### Phase 4：完善
15. [ ] 代理支持
16. [ ] 更新检查
17. [ ] 错误处理优化
18. [ ] README 文档
