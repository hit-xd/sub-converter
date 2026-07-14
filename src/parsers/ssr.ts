// ssr://base64( host:port:protocol:method:obfs:base64url(password) /?params )
// params: obfsparam, protoparam, remarks, group  (each base64url-encoded)

import type { ClashProxy } from '../types'
import { decodeBase64 } from './base64'
import { parseQuery } from './utils'

export function parseSsr(link: string): ClashProxy {
  const payload = link.slice('ssr://'.length)
  let decoded: string
  try {
    decoded = decodeBase64(payload)
  } catch {
    throw new Error('ssr 载荷 base64 解码失败')
  }

  // decoded: host:port:protocol:method:obfs:base64pass/?query
  let main = decoded
  let query: Record<string, string> = {}
  const qIdx = decoded.indexOf('/?')
  if (qIdx !== -1) {
    main = decoded.slice(0, qIdx)
    query = parseQuery(decoded.slice(qIdx + 1))
  }

  const parts = main.split(':')
  if (parts.length < 6) throw new Error('ssr 字段不足 (需要 host:port:protocol:method:obfs:pass)')
  // password may itself contain ':' -> take the last 5 as fixed, rest is host.
  const passB64 = parts.pop() as string
  const obfs = parts.pop() as string
  const method = parts.pop() as string
  const protocol = parts.pop() as string
  const portStr = parts.pop() as string
  const host = parts.join(':')

  const port = Number(portStr)
  if (!host) throw new Error('ssr 缺少服务器地址')
  if (!Number.isInteger(port) || port <= 0) throw new Error('ssr 端口无效')

  let password = ''
  try {
    password = decodeBase64(passB64)
  } catch {
    throw new Error('ssr 密码解码失败')
  }

  const safeDecode = (v: string | undefined): string | undefined => {
    if (!v) return undefined
    try {
      const d = decodeBase64(v)
      return d || undefined
    } catch {
      return undefined
    }
  }

  const remarks = safeDecode(query.remarks)
  const proxy: ClashProxy = {
    name: remarks || `${host}:${port}`,
    type: 'ssr',
    server: host,
    port,
    cipher: method,
    password,
    protocol,
    obfs,
    udp: true,
  }
  const obfsParam = safeDecode(query.obfsparam)
  const protoParam = safeDecode(query.protoparam)
  if (obfsParam) proxy['obfs-param'] = obfsParam
  if (protoParam) proxy['protocol-param'] = protoParam

  return proxy
}
