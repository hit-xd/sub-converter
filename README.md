# Sub Converter

A web-based tool to convert subscription links (vless, vmess, ss, ssr, trojan, hysteria, hysteria2, tuic) into FLClash (mihomo/Clash.Meta) configuration.

## Features

- **Multiple Protocol Support**: Convert links from vmess, vless, shadowsocks, ssr, trojan, hysteria, hysteria2, and tuic
- **Client-Side Processing**: All parsing and conversion happens locally in your browser — your data never leaves your machine
- **Multiple Output Formats**: Support for full config and node list output modes
- **Web-Based UI**: Clean, intuitive interface for easy conversion
- **Direct Import**: Output is in mihomo (Clash.Meta) format for seamless import into FLClash or Clash.Meta compatible clients

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (v10.33.0 or higher)

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### Building

Build for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

### Testing

Run tests:

```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

## Usage

1. Open the application in your browser
2. Paste one or more subscription links in the input panel
3. View parsed nodes in the node list
4. Copy the generated FLClash configuration from the output panel
5. Import directly into FLClash or Clash.Meta

### Supported Protocols

- **VLESS**: Variable-length Protocol
- **VMESS**: Customizable Relay Protocol
- **Shadowsocks (SS)**: Lightweight proxy protocol
- **Shadowsocks R (SSR)**: Extended version of Shadowsocks
- **Trojan**: Unidentifiable Mechanism Protocol
- **Hysteria**: Fast and reliable proxy protocol
- **Hysteria 2**: Improved version of Hysteria
- **TUIC**: Lightweight UDP relay protocol

## Project Structure

```
src/
├── components/       # React components for UI
│   ├── InputPanel.tsx
│   ├── NodeList.tsx
│   └── OutputPanel.tsx
├── parsers/         # Protocol parsers
│   ├── base64.ts
│   ├── vmess.ts
│   ├── vless.ts
│   ├── shadowsocks.ts
│   ├── ssr.ts
│   ├── trojan.ts
│   ├── hysteria.ts
│   ├── hysteria2.ts
│   └── tuic.ts
├── generator/       # Config generator
│   ├── index.ts
│   └── template.ts
├── types.ts         # TypeScript type definitions
├── App.tsx          # Root component
└── main.tsx         # Application entry point
```

## How It Works

1. **Input Parsing**: The app accepts raw subscription links or base64-encoded strings
2. **Protocol Parsing**: Links are parsed based on their protocol scheme (vmess://, vless://, etc.)
3. **Node Extraction**: Each link is converted into a proxy node with all necessary configuration
4. **Config Generation**: Nodes are assembled into a complete Clash configuration in YAML format
5. **Output**: The configuration can be copied and directly imported into compatible clients

## Privacy & Security

- **No Server Communication**: All processing happens entirely in your browser
- **No Data Storage**: Input data is not stored or transmitted anywhere
- **Open Source**: You can review the code to understand exactly what it does

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and development server
- **js-yaml** - YAML generation
- **Vitest** - Testing framework

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Disclaimer

This tool is provided for educational and legitimate use only. Ensure you have proper authorization before using proxy protocols on any network.
