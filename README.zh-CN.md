# 订阅转换器 (Sub Converter)

一个基于网页的工具，可将订阅链接（vless、vmess、ss、ssr、trojan、hysteria、hysteria2、tuic）转换为 FLClash（mihomo/Clash.Meta）配置。

## 功能特性

- **多协议支持**：支持转换 vmess、vless、shadowsocks、ssr、trojan、hysteria、hysteria2 和 tuic 链接
- **本地处理**：所有解析和转换操作都在浏览器本地完成 — 您的数据不会发送到任何服务器
- **多种输出格式**：支持完整配置和节点列表两种输出模式
- **Web 界面**：简洁直观的界面，方便快速转换
- **直接导入**：输出为 mihomo（Clash.Meta）格式，可直接导入 FLClash 或其他兼容客户端

## 快速开始

### 前置要求

- Node.js（v16 或更高版本）
- pnpm（v10.33.0 或更高版本）

### 安装

```bash
pnpm install
```

### 开发

启动开发服务器：

```bash
pnpm dev
```

应用将在 `http://localhost:5173` 可用

### 构建

为生产环境构建：

```bash
pnpm build
```

预览生产构建：

```bash
pnpm preview
```

### 测试

运行测试：

```bash
pnpm test
```

监视模式：

```bash
pnpm test:watch
```

## 使用说明

1. 在浏览器中打开应用
2. 在输入面板中粘贴一个或多个订阅链接
3. 在节点列表中查看解析的节点
4. 从输出面板复制生成的 FLClash 配置
5. 直接导入到 FLClash 或 Clash.Meta 客户端

### 支持的协议

- **VLESS**：Variable-length Protocol（可变长度协议）
- **VMESS**：Customizable Relay Protocol（可定制中继协议）
- **Shadowsocks (SS)**：轻量级代理协议
- **Shadowsocks R (SSR)**：Shadowsocks 的扩展版本
- **Trojan**：Unidentifiable Mechanism Protocol（不可识别机制协议）
- **Hysteria**：快速可靠的代理协议
- **Hysteria 2**：Hysteria 的改进版本
- **TUIC**：轻量级 UDP 中继协议

## 项目结构

```
src/
├── components/       # React 组件
│   ├── InputPanel.tsx      # 输入面板组件
│   ├── NodeList.tsx        # 节点列表组件
│   └── OutputPanel.tsx     # 输出面板组件
├── parsers/         # 协议解析器
│   ├── base64.ts           # Base64 编码/解码
│   ├── vmess.ts            # VMESS 协议解析
│   ├── vless.ts            # VLESS 协议解析
│   ├── shadowsocks.ts      # Shadowsocks 协议解析
│   ├── ssr.ts              # SSR 协议解析
│   ├── trojan.ts           # Trojan 协议解析
│   ├── hysteria.ts         # Hysteria 协议解析
│   ├── hysteria2.ts        # Hysteria2 协议解析
│   └── tuic.ts             # TUIC 协议解析
├── generator/       # 配置生成器
│   ├── index.ts
│   └── template.ts
├── types.ts         # TypeScript 类型定义
├── App.tsx          # 根组件
└── main.tsx         # 应用入口点
```

## 工作原理

1. **输入解析**：应用接受原始订阅链接或 Base64 编码的字符串
2. **协议解析**：根据协议方案（vmess://、vless:// 等）解析链接
3. **节点提取**：每条链接都被转换为包含所有必要配置的代理节点
4. **配置生成**：节点被组装成完整的 Clash 配置（YAML 格式）
5. **输出**：配置可被复制并直接导入兼容的客户端

## 隐私和安全

- **无服务器通信**：所有处理完全在您的浏览器中进行
- **数据不存储**：输入数据不会被存储或发送到任何地方
- **开源项目**：您可以查看源代码，了解工具的具体工作原理

## 技术栈

- **React** - UI 框架
- **TypeScript** - 类型安全的开发
- **Vite** - 构建工具和开发服务器
- **js-yaml** - YAML 生成库
- **Vitest** - 测试框架

## 许可证

ISC

## 贡献

欢迎贡献！请随时提交问题和拉取请求。

## 免责声明

本工具仅供教育和合法使用。在任何网络上使用代理协议前，请确保获得了适当的授权。
