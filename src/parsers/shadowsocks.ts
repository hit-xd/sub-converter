// shadowsocks — two encodings:
//   1) legacy: ss://base64(method:password@host:port)#name
//   2) SIP002: ss://base64(method:password)@host:port?plugin=...#name
//              (userinfo may also be plain "method:password")

import type { ClashProxy } from '../types'
import { decodeBase64 } from './base64'
import { decodeName, parseQuery, splitHostPort } from './utils'

interface PluginConfig {
  plugin: string
  opts: Record<string, unknown>
}

/** Translate a SIP003 `plugin=...;k=v;...` string into mihomo plugin config. */
function parsePlugin(pluginStr: string): PluginConfig | undefined {
  if (!pluginStr) return undefined
  const parts = pluginStr.split(';')
  const rawName = parts.shift() || ''
  const params: Record<string, string> = {}
  for (const p of parts) {
    const eq = p.indexOf('=')
    if (eq === -1) params[p] = 'true'
    else params[p.slice(0, eq)] = p.slice(eq + 1)
  }

  if (rawName === 'obfs-local' || rawName === 'simple-obfs') {
    return {
      plugin: 'obfs',
      opts: {
        mode: params.obfs || 'http',
        ...(params['obfs-host'] ? { host: params['obfs-host'] } : {}),
      },
    }
  }
  if (rawName === 'v2ray-plugin') {
    return {
      plugin: 'v2ray-plugin',
      opts: {
        mode: params.mode || 'websocket',
        ...(params.tls != null ? { tls: true } : {}),
        ...(params.host ? { host: params.host } : {}),
        ...(params.path ? { path: params.path } : {}),
      },
    }
  }
  // Unknown plugin: pass through name, best-effort opts.
  return { plugin: rawName, opts: params }
}

function buildProxy(
  name: string,
  cipher: string,
  password: string,
  host: string,
  port: number,
  plugin: PluginConfig | undefined,
): ClashProxy {
  if (!cipher || !password) throw new Error('ss 缺少加密方式或密码')
  const proxy: ClashProxy = {
    name,
    type: 'ss',
    server: host,
    port,
    cipher,
    password,
    udp: true,
  }
  if (plugin) {
    proxy.plugin = plugin.plugin
    if (Object.keys(plugin.opts).length) proxy['plugin-opts'] = plugin.opts
  }
  return proxy
}

export function parseShadowsocks(link: string): ClashProxy {
  let body = link.slice('ss://'.length)

  // Split off #fragment (name) first.
  let fragment: string | undefined
  const hashIdx = body.indexOf('#')
  if (hashIdx !== -1) {
    fragment = body.slice(hashIdx + 1)
    body = body.slice(0, hashIdx)
  }

  // Split off ?query (plugin) if present.
  let query: Record<string, string> = {}
  const qIdx = body.indexOf('?')
  if (qIdx !== -1) {
    query = parseQuery(body.slice(qIdx))
    body = body.slice(0, qIdx)
  }

  const atIdx = body.lastIndexOf('@')
  if (atIdx !== -1) {
    // SIP002: userinfo @ host:port. userinfo is base64(method:pass) or plain.
    const userinfoRaw = body.slice(0, atIdx)
    const authority = body.slice(atIdx + 1)
    let userinfo = userinfoRaw
    if (!userinfoRaw.includes(':')) {
      try {
        userinfo = decodeBase64(userinfoRaw)
      } catch {
        throw new Error('ss userinfo 解码失败')
      }
    }
    const colon = userinfo.indexOf(':')
    if (colon === -1) throw new Error('ss userinfo 缺少 method:password')
    const cipher = userinfo.slice(0, colon)
    const password = userinfo.slice(colon + 1)
    const { host, port } = splitHostPort(authority)
    const plugin = parsePlugin(query.plugin || '')
    return buildProxy(decodeName(fragment, `${host}:${port}`), cipher, password, host, port, plugin)
  }

  // Legacy: whole body is base64(method:password@host:port).
  let decoded: string
  try {
    decoded = decodeBase64(body)
  } catch {
    throw new Error('ss 载荷 base64 解码失败')
  }
  const at = decoded.lastIndexOf('@')
  if (at === -1) throw new Error('ss 载荷缺少 @host:port')
  const cred = decoded.slice(0, at)
  const authority = decoded.slice(at + 1)
  const colon = cred.indexOf(':')
  if (colon === -1) throw new Error('ss 载荷缺少 method:password')
  const cipher = cred.slice(0, colon)
  const password = cred.slice(colon + 1)
  const { host, port } = splitHostPort(authority)
  return buildProxy(decodeName(fragment, `${host}:${port}`), cipher, password, host, port, undefined)
}
