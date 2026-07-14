// Dispatch a single link to its protocol parser, and turn a blob of input
// (pasted links or a base64 subscription) into a list of parse results.

import type { ClashProxy, ParseResult } from '../types'
import { decodeBase64, looksLikeBase64 } from './base64'
import { dedupeNames } from './utils'
import { parseVmess } from './vmess'
import { parseVless } from './vless'
import { parseShadowsocks } from './shadowsocks'
import { parseSsr } from './ssr'
import { parseTrojan } from './trojan'
import { parseHysteria2 } from './hysteria2'
import { parseHysteria } from './hysteria'
import { parseTuic } from './tuic'

type Parser = (link: string) => ClashProxy

// Longer prefixes first so `hysteria2` wins over `hysteria`, `hy2` over `hy`.
const PARSERS: Array<[string, Parser]> = [
  ['vmess://', parseVmess],
  ['vless://', parseVless],
  ['ssr://', parseSsr],
  ['ss://', parseShadowsocks],
  ['trojan://', parseTrojan],
  ['hysteria2://', parseHysteria2],
  ['hy2://', parseHysteria2],
  ['hysteria://', parseHysteria],
  ['tuic://', parseTuic],
]

/** Parse one share link into a mihomo proxy, or throw with a reason. */
export function parseLink(link: string): ClashProxy {
  const trimmed = link.trim()
  for (const [prefix, parser] of PARSERS) {
    if (trimmed.toLowerCase().startsWith(prefix)) {
      return parser(trimmed)
    }
  }
  const scheme = trimmed.split('://')[0]?.slice(0, 20) || trimmed.slice(0, 20)
  throw new Error(`不支持的协议: ${scheme}`)
}

/** True if a line starts with any protocol scheme we recognize. */
function hasKnownScheme(line: string): boolean {
  const l = line.trim().toLowerCase()
  return PARSERS.some(([prefix]) => l.startsWith(prefix))
}

/**
 * Normalize raw pasted input into individual links. Handles:
 *  - plain multi-line links
 *  - a single base64 blob (subscription content) -> decode then split
 */
export function extractLinks(input: string): string[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  // If nothing looks like a link but the whole thing looks like base64,
  // treat it as an encoded subscription and decode it.
  const anyScheme = lines.some(hasKnownScheme)
  if (!anyScheme && looksLikeBase64(trimmed)) {
    try {
      const decoded = decodeBase64(trimmed)
      return decoded
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
    } catch {
      // fall through to returning the raw lines
    }
  }

  return lines
}

/** Parse a full input blob into per-link results (order preserved). */
export function parseInput(input: string): ParseResult[] {
  const links = extractLinks(input)
  const results: ParseResult[] = []
  for (const link of links) {
    try {
      results.push({ ok: true, proxy: parseLink(link), raw: link })
    } catch (e) {
      results.push({ ok: false, raw: link, error: e instanceof Error ? e.message : String(e) })
    }
  }

  // Ensure unique names across everything that parsed successfully.
  const proxies = results.filter((r): r is Extract<ParseResult, { ok: true }> => r.ok).map((r) => r.proxy)
  dedupeNames(proxies)

  return results
}

export { parseVmess, parseVless, parseShadowsocks, parseSsr, parseTrojan, parseHysteria2, parseHysteria, parseTuic }
