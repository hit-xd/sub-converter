// Base config template for "full config" output. Kept minimal but immediately
// usable in FLClash/mihomo: mixed-port, rule mode, fake-ip DNS, and a couple of
// proxy-groups + a minimal rule set are filled in by buildConfig().

export const GROUP_SELECT = '🚀 节点选择'
export const GROUP_AUTO = '♻️ 自动选择'

// Everything except `proxies` / `proxy-groups` / `rules`, which buildConfig injects.
export function baseConfig(): Record<string, unknown> {
  return {
    'mixed-port': 7890,
    'allow-lan': false,
    mode: 'rule',
    'log-level': 'info',
    ipv6: true,
    'external-controller': '127.0.0.1:9090',
    'unified-delay': true,
    'tcp-concurrent': true,
    profile: {
      'store-selected': true,
      'store-fake-ip': true,
    },
    dns: {
      enable: true,
      ipv6: true,
      'enhanced-mode': 'fake-ip',
      'fake-ip-range': '198.18.0.1/16',
      'default-nameserver': ['223.5.5.5', '119.29.29.29'],
      nameserver: ['https://223.5.5.5/dns-query', 'https://doh.pub/dns-query'],
      fallback: ['https://8.8.8.8/dns-query', 'https://1.1.1.1/dns-query'],
    },
  }
}

// Minimal, sane rule set: direct for CN/private, everything else via the group.
export function baseRules(): string[] {
  return [
    'GEOIP,LAN,DIRECT,no-resolve',
    'GEOIP,CN,DIRECT',
    `MATCH,${GROUP_SELECT}`,
  ]
}
