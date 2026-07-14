// hysteria (v1)://host:port?params#name
// params: auth(auth-str), peer(sni), insecure, upmbps(up), downmbps(down),
// alpn, obfs, protocol(udp|wechat-video|faketcp)

import type { ClashProxy } from '../types'
import { decodeName, isTruthy, parseAlpn, setIf, splitUri } from './utils'

export function parseHysteria(link: string): ClashProxy {
  const { host, port, query, fragment } = splitUri(link)

  const proxy: ClashProxy = {
    name: decodeName(fragment, `${host}:${port}`),
    type: 'hysteria',
    server: host,
    port,
  }

  setIf(proxy, 'auth-str', query.auth || query.authStr || query['auth_str'])
  setIf(proxy, 'sni', query.peer || query.sni)
  setIf(proxy, 'alpn', parseAlpn(query.alpn))
  setIf(proxy, 'protocol', query.protocol)
  setIf(proxy, 'obfs', query.obfs)
  if (isTruthy(query.insecure)) proxy['skip-cert-verify'] = true

  // Bandwidth hints. mihomo accepts a bare number (Mbps) or "N Mbps".
  if (query.upmbps) proxy.up = `${query.upmbps} Mbps`
  else setIf(proxy, 'up', query.up)
  if (query.downmbps) proxy.down = `${query.downmbps} Mbps`
  else setIf(proxy, 'down', query.down)

  return proxy
}
