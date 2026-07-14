// trojan://password@host:port?params#name
// params: sni, type(network), path, host, serviceName, alpn, allowInsecure/insecure
// Note: trojan uses `sni`, not `servername`.

import type { ClashProxy } from '../types'
import { decodeName, isTruthy, parseAlpn, setIf, splitUri } from './utils'

export function parseTrojan(link: string): ClashProxy {
  const { userinfo, host, port, query, fragment } = splitUri(link)
  if (!userinfo) throw new Error('trojan 缺少密码')

  const proxy: ClashProxy = {
    name: decodeName(fragment, `${host}:${port}`),
    type: 'trojan',
    server: host,
    port,
    password: decodeURIComponent(userinfo),
    udp: true,
  }

  setIf(proxy, 'sni', query.sni || query.peer)
  setIf(proxy, 'alpn', parseAlpn(query.alpn))
  if (isTruthy(query.allowInsecure) || isTruthy(query.insecure)) {
    proxy['skip-cert-verify'] = true
  }

  const network = (query.type || '').toLowerCase()
  if (network && network !== 'tcp' && network !== 'original') {
    proxy.network = network
    const path = query.path
    const wsHost = query.host
    if (network === 'ws') {
      const headers: Record<string, string> = {}
      if (wsHost) headers.Host = wsHost
      proxy['ws-opts'] = {
        ...(path ? { path } : {}),
        ...(Object.keys(headers).length ? { headers } : {}),
      }
    } else if (network === 'grpc') {
      const svc = query.serviceName || query.servicename
      setIf(proxy, 'grpc-opts', svc ? { 'grpc-service-name': svc } : undefined)
    }
  }

  return proxy
}
