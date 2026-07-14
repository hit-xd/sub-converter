// hysteria2://auth@host:port/?params#name   (alias: hy2://)
// params: sni, insecure, obfs(salamander), obfs-password, alpn, pinSHA256
// Optional port hopping via mport / query is folded into `ports`.

import type { ClashProxy } from '../types'
import { decodeName, isTruthy, parseAlpn, setIf, splitUri } from './utils'

export function parseHysteria2(link: string): ClashProxy {
  const { userinfo, host, port, query, fragment } = splitUri(link)

  const proxy: ClashProxy = {
    name: decodeName(fragment, `${host}:${port}`),
    type: 'hysteria2',
    server: host,
    port,
    password: userinfo ? decodeURIComponent(userinfo) : '',
  }
  if (!proxy.password) {
    // Some links carry auth via query instead of userinfo.
    setIf(proxy, 'password', query.auth || query.password)
  }

  setIf(proxy, 'sni', query.sni || query.peer)
  setIf(proxy, 'alpn', parseAlpn(query.alpn))
  if (isTruthy(query.insecure) || isTruthy(query.allowInsecure)) {
    proxy['skip-cert-verify'] = true
  }

  if (query.obfs) {
    proxy.obfs = query.obfs
    setIf(proxy, 'obfs-password', query['obfs-password'] || query.obfsParam)
  }
  setIf(proxy, 'fingerprint', query.pinSHA256 || query['pinsha256'])

  // Port hopping range, if provided.
  setIf(proxy, 'ports', query.mport || query.ports)

  return proxy
}
