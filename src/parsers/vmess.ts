// vmess://  ->  base64-encoded JSON payload (v2rayN style).
// Reference fields: v, ps, add, port, id, aid, scy, net, type, host, path, tls, sni, alpn, fp

import type { ClashProxy } from '../types'
import { decodeBase64 } from './base64'
import { parseAlpn, setIf } from './utils'

interface VmessJson {
  v?: string | number
  ps?: string
  add?: string
  port?: string | number
  id?: string
  aid?: string | number
  scy?: string
  net?: string
  type?: string
  host?: string
  path?: string
  tls?: string
  sni?: string
  alpn?: string
  fp?: string
}

export function parseVmess(link: string): ClashProxy {
  const payload = link.slice('vmess://'.length)
  let json: VmessJson
  try {
    json = JSON.parse(decodeBase64(payload))
  } catch {
    throw new Error('vmess 载荷不是合法的 base64 JSON')
  }

  const server = String(json.add ?? '').trim()
  const port = Number(json.port)
  if (!server) throw new Error('vmess 缺少服务器地址 (add)')
  if (!Number.isInteger(port) || port <= 0) throw new Error('vmess 端口无效')
  if (!json.id) throw new Error('vmess 缺少 uuid (id)')

  const network = (json.net || 'tcp').toLowerCase()
  const proxy: ClashProxy = {
    name: (json.ps || `${server}:${port}`).trim(),
    type: 'vmess',
    server,
    port,
    uuid: String(json.id),
    alterId: Number(json.aid ?? 0) || 0,
    cipher: json.scy || 'auto',
    udp: true,
    network,
  }

  // TLS: vmess uses tls="tls" to enable.
  const tlsEnabled = String(json.tls || '').toLowerCase() === 'tls'
  if (tlsEnabled) {
    proxy.tls = true
    setIf(proxy, 'servername', json.sni || json.host)
    setIf(proxy, 'alpn', parseAlpn(json.alpn))
    setIf(proxy, 'client-fingerprint', json.fp)
  }

  const host = json.host?.trim()
  const path = json.path?.trim()

  if (network === 'ws') {
    const wsHeaders: Record<string, string> = {}
    if (host) wsHeaders.Host = host
    proxy['ws-opts'] = {
      ...(path ? { path } : {}),
      ...(Object.keys(wsHeaders).length ? { headers: wsHeaders } : {}),
    }
  } else if (network === 'grpc') {
    setIf(proxy, 'grpc-opts', path ? { 'grpc-service-name': path } : undefined)
  } else if (network === 'h2') {
    proxy['h2-opts'] = {
      ...(host ? { host: [host] } : {}),
      ...(path ? { path } : {}),
    }
  } else if (network === 'tcp' && (json.type || '').toLowerCase() === 'http') {
    proxy['http-opts'] = {
      ...(path ? { path: [path] } : {}),
      ...(host ? { headers: { Host: [host] } } : {}),
    }
  }

  return proxy
}
