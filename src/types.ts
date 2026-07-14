// mihomo (Clash.Meta) proxy object types + parse result shapes.
// Parsers emit these objects directly; the generator serializes them to YAML.

export type ProxyType =
  | 'vmess'
  | 'vless'
  | 'ss'
  | 'ssr'
  | 'trojan'
  | 'hysteria2'
  | 'hysteria'
  | 'tuic'

export interface WsOpts {
  path?: string
  headers?: Record<string, string>
  'max-early-data'?: number
  'early-data-header-name'?: string
}

export interface GrpcOpts {
  'grpc-service-name'?: string
}

export interface H2Opts {
  host?: string[]
  path?: string
}

export interface HttpOpts {
  method?: string
  path?: string[]
  headers?: Record<string, string[]>
}

export interface RealityOpts {
  'public-key'?: string
  'short-id'?: string
}

export interface PluginOpts {
  mode?: string
  host?: string
  path?: string
  tls?: boolean
  'skip-cert-verify'?: boolean
  headers?: Record<string, string>
  mux?: boolean
}

// A mihomo proxy. Fields are intentionally loose (optional) because each
// protocol only fills the subset it needs. `[key: string]` keeps it extensible
// without fighting the type system for rarely-used knobs.
export interface ClashProxy {
  name: string
  type: ProxyType
  server: string
  port: number
  udp?: boolean

  // credentials (varies by protocol)
  uuid?: string
  password?: string
  cipher?: string
  alterId?: number
  'auth-str'?: string
  token?: string

  // TLS / transport
  tls?: boolean
  sni?: string
  servername?: string
  'skip-cert-verify'?: boolean
  fingerprint?: string
  'client-fingerprint'?: string
  alpn?: string[]
  flow?: string
  network?: string
  'reality-opts'?: RealityOpts
  'ws-opts'?: WsOpts
  'grpc-opts'?: GrpcOpts
  'h2-opts'?: H2Opts
  'http-opts'?: HttpOpts

  // shadowsocks / ssr
  plugin?: string
  'plugin-opts'?: PluginOpts
  protocol?: string
  obfs?: string
  'protocol-param'?: string
  'obfs-param'?: string
  'obfs-password'?: string

  // hysteria / hysteria2 / tuic
  up?: string
  down?: string
  ports?: string
  'congestion-controller'?: string
  'udp-relay-mode'?: string
  'disable-sni'?: boolean

  [key: string]: unknown
}

export interface ParseSuccess {
  ok: true
  proxy: ClashProxy
  raw: string
}

export interface ParseFailure {
  ok: false
  raw: string
  error: string
}

export type ParseResult = ParseSuccess | ParseFailure

export type OutputMode = 'full' | 'proxies'
