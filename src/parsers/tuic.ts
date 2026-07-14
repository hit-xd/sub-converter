// tuic://uuid:password@host:port?params#name   (v5)
// tuic://token@host:port?params#name            (v4, less common)
// params: sni, congestion_control, udp_relay_mode, alpn, allow_insecure, disable_sni

import type { ClashProxy } from '../types'
import { decodeName, isTruthy, parseAlpn, setIf, splitUri } from './utils'

export function parseTuic(link: string): ClashProxy {
  const { userinfo, host, port, query, fragment } = splitUri(link)
  if (!userinfo) throw new Error('tuic 缺少认证信息')

  const proxy: ClashProxy = {
    name: decodeName(fragment, `${host}:${port}`),
    type: 'tuic',
    server: host,
    port,
    udp: true,
  }

  // v5 uses uuid:password; v4 uses a single token.
  const colon = userinfo.indexOf(':')
  if (colon !== -1) {
    proxy.uuid = decodeURIComponent(userinfo.slice(0, colon))
    proxy.password = decodeURIComponent(userinfo.slice(colon + 1))
  } else {
    proxy.token = decodeURIComponent(userinfo)
  }

  setIf(proxy, 'sni', query.sni)
  setIf(proxy, 'alpn', parseAlpn(query.alpn))
  setIf(proxy, 'congestion-controller', query.congestion_control || query.congestion)
  setIf(proxy, 'udp-relay-mode', query.udp_relay_mode)
  if (isTruthy(query.allow_insecure) || isTruthy(query.insecure)) {
    proxy['skip-cert-verify'] = true
  }
  if (isTruthy(query.disable_sni)) proxy['disable-sni'] = true

  return proxy
}
