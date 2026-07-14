import { describe, expect, it } from 'vitest'
import yaml from 'js-yaml'
import { encodeBase64 } from '../src/parsers/base64'
import { parseInput, parseLink } from '../src/parsers'
import { buildConfig } from '../src/generator'

// Build a vmess link from a JSON object (matches v2rayN base64(JSON) format).
function vmessLink(obj: Record<string, unknown>): string {
  return 'vmess://' + encodeBase64(JSON.stringify(obj))
}

describe('vmess', () => {
  it('parses a ws+tls vmess link with a Chinese name', () => {
    const link = vmessLink({
      v: '2',
      ps: '香港节点',
      add: 'a.example.com',
      port: '443',
      id: '11111111-2222-3333-4444-555555555555',
      aid: '0',
      scy: 'auto',
      net: 'ws',
      host: 'cdn.example.com',
      path: '/ray',
      tls: 'tls',
      sni: 'cdn.example.com',
    })
    const p = parseLink(link)
    expect(p.type).toBe('vmess')
    expect(p.name).toBe('香港节点')
    expect(p.server).toBe('a.example.com')
    expect(p.port).toBe(443)
    expect(p.uuid).toBe('11111111-2222-3333-4444-555555555555')
    expect(p.network).toBe('ws')
    expect(p.tls).toBe(true)
    expect(p.servername).toBe('cdn.example.com')
    expect(p['ws-opts']).toEqual({ path: '/ray', headers: { Host: 'cdn.example.com' } })
  })

  it('defaults cipher to auto and alterId to 0', () => {
    const p = parseLink(vmessLink({ add: 'h', port: 80, id: 'u', net: 'tcp' }))
    expect(p.cipher).toBe('auto')
    expect(p.alterId).toBe(0)
    expect(p.tls).toBeUndefined()
  })
})

describe('vless', () => {
  it('parses a reality vless link', () => {
    const link =
      'vless://uuid-abc@b.example.com:443?encryption=none&security=reality&sni=www.microsoft.com&fp=chrome&type=tcp&flow=xtls-rprx-vision&pbk=PUBKEY&sid=abcd#Reality节点'
    const p = parseLink(link)
    expect(p.type).toBe('vless')
    expect(p.name).toBe('Reality节点')
    expect(p.uuid).toBe('uuid-abc')
    expect(p.tls).toBe(true)
    expect(p.servername).toBe('www.microsoft.com')
    expect(p['client-fingerprint']).toBe('chrome')
    expect(p.flow).toBe('xtls-rprx-vision')
    expect(p['reality-opts']).toEqual({ 'public-key': 'PUBKEY', 'short-id': 'abcd' })
  })

  it('parses a ws vless link', () => {
    const link = 'vless://u@h:8443?security=tls&type=ws&host=w.example.com&path=%2Fws&sni=w.example.com#x'
    const p = parseLink(link)
    expect(p.network).toBe('ws')
    expect(p['ws-opts']).toEqual({ path: '/ws', headers: { Host: 'w.example.com' } })
  })
})

describe('shadowsocks', () => {
  it('parses SIP002 (base64 userinfo)', () => {
    const userinfo = encodeBase64('aes-256-gcm:secretpass')
    const link = `ss://${userinfo}@c.example.com:8388#SS节点`
    const p = parseLink(link)
    expect(p.type).toBe('ss')
    expect(p.cipher).toBe('aes-256-gcm')
    expect(p.password).toBe('secretpass')
    expect(p.server).toBe('c.example.com')
    expect(p.port).toBe(8388)
    expect(p.name).toBe('SS节点')
  })

  it('parses legacy fully-base64 form', () => {
    const link = 'ss://' + encodeBase64('aes-128-gcm:pw@d.example.com:8389') + '#legacy'
    const p = parseLink(link)
    expect(p.cipher).toBe('aes-128-gcm')
    expect(p.password).toBe('pw')
    expect(p.server).toBe('d.example.com')
    expect(p.port).toBe(8389)
  })

  it('parses obfs plugin', () => {
    const userinfo = encodeBase64('aes-256-gcm:pw')
    const link = `ss://${userinfo}@e.example.com:80?plugin=obfs-local%3Bobfs%3Dhttp%3Bobfs-host%3Dbing.com#obfs`
    const p = parseLink(link)
    expect(p.plugin).toBe('obfs')
    expect(p['plugin-opts']).toEqual({ mode: 'http', host: 'bing.com' })
  })
})

describe('ssr', () => {
  it('parses an ssr link', () => {
    const pass = encodeBase64('mypassword')
    const obfsparam = encodeBase64('cloudfront.example.com')
    const remarks = encodeBase64('SSR节点')
    const main = `f.example.com:8388:auth_aes128_md5:aes-256-cfb:tls1.2_ticket_auth:${pass}`
    const query = `obfsparam=${obfsparam}&remarks=${remarks}`
    const link = 'ssr://' + encodeBase64(`${main}/?${query}`)
    const p = parseLink(link)
    expect(p.type).toBe('ssr')
    expect(p.server).toBe('f.example.com')
    expect(p.port).toBe(8388)
    expect(p.protocol).toBe('auth_aes128_md5')
    expect(p.cipher).toBe('aes-256-cfb')
    expect(p.obfs).toBe('tls1.2_ticket_auth')
    expect(p.password).toBe('mypassword')
    expect(p['obfs-param']).toBe('cloudfront.example.com')
    expect(p.name).toBe('SSR节点')
  })
})

describe('trojan', () => {
  it('parses a trojan link with sni', () => {
    const link = 'trojan://mypass@g.example.com:443?sni=g.example.com&allowInsecure=1#Trojan节点'
    const p = parseLink(link)
    expect(p.type).toBe('trojan')
    expect(p.password).toBe('mypass')
    expect(p.sni).toBe('g.example.com')
    expect(p['skip-cert-verify']).toBe(true)
    expect(p.servername).toBeUndefined() // trojan uses sni, not servername
  })
})

describe('hysteria2', () => {
  it('parses hysteria2 with obfs', () => {
    const link =
      'hysteria2://mypassword@h.example.com:443?sni=h.example.com&insecure=1&obfs=salamander&obfs-password=xyz#HY2'
    const p = parseLink(link)
    expect(p.type).toBe('hysteria2')
    expect(p.password).toBe('mypassword')
    expect(p.sni).toBe('h.example.com')
    expect(p['skip-cert-verify']).toBe(true)
    expect(p.obfs).toBe('salamander')
    expect(p['obfs-password']).toBe('xyz')
  })

  it('accepts hy2:// alias', () => {
    const p = parseLink('hy2://pw@i.example.com:8443#alias')
    expect(p.type).toBe('hysteria2')
    expect(p.server).toBe('i.example.com')
  })
})

describe('hysteria (v1)', () => {
  it('parses hysteria v1 with bandwidth', () => {
    const link = 'hysteria://j.example.com:443?auth=tok&peer=j.example.com&upmbps=50&downmbps=200&alpn=h3&insecure=1#HY1'
    const p = parseLink(link)
    expect(p.type).toBe('hysteria')
    expect(p['auth-str']).toBe('tok')
    expect(p.sni).toBe('j.example.com')
    expect(p.up).toBe('50 Mbps')
    expect(p.down).toBe('200 Mbps')
    expect(p.alpn).toEqual(['h3'])
    expect(p['skip-cert-verify']).toBe(true)
  })
})

describe('tuic', () => {
  it('parses tuic v5 (uuid:password)', () => {
    const link =
      'tuic://uuid-x:pass-y@k.example.com:443?sni=k.example.com&congestion_control=bbr&udp_relay_mode=native&alpn=h3#TUIC'
    const p = parseLink(link)
    expect(p.type).toBe('tuic')
    expect(p.uuid).toBe('uuid-x')
    expect(p.password).toBe('pass-y')
    expect(p['congestion-controller']).toBe('bbr')
    expect(p['udp-relay-mode']).toBe('native')
    expect(p.alpn).toEqual(['h3'])
  })
})

describe('parseInput', () => {
  it('parses multiple links and reports failures', () => {
    const input = [
      'vless://u@h:443?security=tls#a',
      'garbage://not-a-real-thing',
      'hy2://pw@h2:443#b',
    ].join('\n')
    const results = parseInput(input)
    expect(results).toHaveLength(3)
    expect(results[0].ok).toBe(true)
    expect(results[1].ok).toBe(false)
    expect(results[2].ok).toBe(true)
  })

  it('decodes a base64 subscription blob', () => {
    const sub = ['vless://u@h:443?security=tls#a', 'trojan://pw@h2:443#b'].join('\n')
    const results = parseInput(encodeBase64(sub))
    expect(results).toHaveLength(2)
    expect(results.every((r) => r.ok)).toBe(true)
  })

  it('dedupes duplicate node names', () => {
    const input = ['trojan://p@h:443#dup', 'trojan://p@h2:443#dup'].join('\n')
    const results = parseInput(input)
    const names = results.filter((r) => r.ok).map((r) => (r.ok ? r.proxy.name : ''))
    expect(names).toEqual(['dup', 'dup #2'])
  })
})

describe('buildConfig', () => {
  it('produces valid YAML for full config that round-trips', () => {
    const results = parseInput('vless://u@h:443?security=tls#node1\nhy2://pw@h2:443#node2')
    const proxies = results.filter((r) => r.ok).map((r) => (r.ok ? r.proxy : null)).filter(Boolean) as never[]
    const text = buildConfig(proxies, 'full')
    const parsed = yaml.load(text) as Record<string, unknown>
    expect(parsed).toHaveProperty('proxies')
    expect(parsed).toHaveProperty('proxy-groups')
    expect(parsed).toHaveProperty('rules')
    expect((parsed.proxies as unknown[]).length).toBe(2)
  })

  it('produces proxies-only YAML', () => {
    const results = parseInput('vless://u@h:443?security=tls#node1')
    const proxies = results.filter((r) => r.ok).map((r) => (r.ok ? r.proxy : null)).filter(Boolean) as never[]
    const text = buildConfig(proxies, 'proxies')
    const parsed = yaml.load(text) as Record<string, unknown>
    expect(Object.keys(parsed)).toEqual(['proxies'])
  })

  it('returns empty string for no proxies', () => {
    expect(buildConfig([], 'full')).toBe('')
  })
})
