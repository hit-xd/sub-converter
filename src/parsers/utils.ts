// Shared parsing utilities: URI splitting, query access, name handling,
// and small coercion helpers used across all protocol parsers.

import type { ClashProxy } from '../types'

/** Decode the `#fragment` of a link into a human-readable node name. */
export function decodeName(fragment: string | undefined, fallback: string): string {
  if (!fragment) return fallback
  try {
    const name = decodeURIComponent(fragment).trim()
    return name.length > 0 ? name : fallback
  } catch {
    return fragment.trim() || fallback
  }
}

/** Parse the query string of a link into a plain object (last value wins). */
export function parseQuery(search: string): Record<string, string> {
  const out: Record<string, string> = {}
  const qs = search.startsWith('?') ? search.slice(1) : search
  if (!qs) return out
  for (const pair of qs.split('&')) {
    if (!pair) continue
    const idx = pair.indexOf('=')
    const key = idx === -1 ? pair : pair.slice(0, idx)
    const val = idx === -1 ? '' : pair.slice(idx + 1)
    try {
      out[decodeURIComponent(key)] = decodeURIComponent(val)
    } catch {
      out[key] = val
    }
  }
  return out
}

/**
 * Split a `scheme://[userinfo@]host:port[/path][?query][#fragment]` link into
 * parts. We avoid the URL constructor because several schemes (ss/ssr/vmess)
 * are not spec-compliant and trip it up; this is deliberately lenient.
 */
export interface UriParts {
  scheme: string
  userinfo?: string
  host: string
  port: number
  path: string
  query: Record<string, string>
  fragment?: string
}

export function splitUri(link: string): UriParts {
  const schemeIdx = link.indexOf('://')
  if (schemeIdx === -1) throw new Error('缺少协议前缀 (scheme://)')
  const scheme = link.slice(0, schemeIdx).toLowerCase()
  let rest = link.slice(schemeIdx + 3)

  let fragment: string | undefined
  const hashIdx = rest.indexOf('#')
  if (hashIdx !== -1) {
    fragment = rest.slice(hashIdx + 1)
    rest = rest.slice(0, hashIdx)
  }

  let query: Record<string, string> = {}
  const qIdx = rest.indexOf('?')
  if (qIdx !== -1) {
    query = parseQuery(rest.slice(qIdx))
    rest = rest.slice(0, qIdx)
  }

  let userinfo: string | undefined
  const atIdx = rest.lastIndexOf('@')
  if (atIdx !== -1) {
    userinfo = rest.slice(0, atIdx)
    rest = rest.slice(atIdx + 1)
  }

  let path = ''
  const slashIdx = rest.indexOf('/')
  if (slashIdx !== -1) {
    path = rest.slice(slashIdx)
    rest = rest.slice(0, slashIdx)
  }

  const { host, port } = splitHostPort(rest)
  return { scheme, userinfo, host, port, path, query, fragment }
}

/** Split a `host:port` authority, supporting bracketed IPv6 (`[::1]:443`). */
export function splitHostPort(authority: string): { host: string; port: number } {
  let host = authority
  let portStr = ''
  if (authority.startsWith('[')) {
    const close = authority.indexOf(']')
    if (close === -1) throw new Error('IPv6 地址缺少闭合括号')
    host = authority.slice(1, close)
    const after = authority.slice(close + 1)
    if (after.startsWith(':')) portStr = after.slice(1)
  } else {
    const colon = authority.lastIndexOf(':')
    if (colon !== -1) {
      host = authority.slice(0, colon)
      portStr = authority.slice(colon + 1)
    }
  }
  if (!host) throw new Error('缺少服务器地址')
  const port = Number(portStr)
  if (!portStr || !Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`端口无效: "${portStr}"`)
  }
  return { host, port }
}

/** Interpret common truthy string flags (1/true/yes) from query params. */
export function isTruthy(value: string | undefined): boolean {
  if (value == null) return false
  const v = value.toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

/** Split a comma-separated alpn list into an array, or undefined if empty. */
export function parseAlpn(value: string | undefined): string[] | undefined {
  if (!value) return undefined
  const list = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return list.length ? list : undefined
}

/** Assign a value onto a proxy only when it is meaningful (skip empty). */
export function setIf<K extends keyof ClashProxy>(
  proxy: ClashProxy,
  key: K,
  value: ClashProxy[K] | undefined | null | '',
): void {
  if (value === undefined || value === null || value === '') return
  proxy[key] = value as ClashProxy[K]
}

/**
 * Ensure every proxy name is unique (Clash requires it). Mutates names in place
 * by appending ` #2`, ` #3`, ... to duplicates.
 */
export function dedupeNames(proxies: ClashProxy[]): void {
  const seen = new Map<string, number>()
  for (const p of proxies) {
    const base = p.name
    const count = seen.get(base) ?? 0
    if (count > 0) p.name = `${base} #${count + 1}`
    seen.set(base, count + 1)
  }
}
