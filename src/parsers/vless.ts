// vless://uuid@host:port?params#name
// Key query params: encryption, security(tls|reality|none), sni, fp, type(network),
// host, path, serviceName, flow, pbk(public-key), sid(short-id), alpn

import type { ClashProxy } from '../types'
import { decodeName, isTruthy, parseAlpn, setIf, splitUri } from './utils'

export function parseVless(link: string): ClashProxy {
  const { userinfo, host, port, query, fragment } = splitUri(link)
  if (!userinfo) throw new Error('vless 缺少 uuid')

  const network = (query.type || 'tcp').toLowerCase()
  const proxy: ClashProxy = {
    name: decodeName(fragment, `${host}:${port}`),
    type: 'vless',
    server: host,
    port,
    uuid: userinfo,
    udp: true,
    network,
  }

  const security = (query.security || 'none').toLowerCase()
  if (security === 'tls' || security === 'reality') {
    proxy.tls = true
    setIf(proxy, 'servername', query.sni || query.host)
    setIf(proxy, 'client-fingerprint', query.fp)
    setIf(proxy, 'alpn', parseAlpn(query.alpn))
    if (isTruthy(query.allowInsecure)) proxy['skip-cert-verify'] = true
  }

  if (security === 'reality') {
    const reality: Record<string, string> = {}
    if (query.pbk) reality['public-key'] = query.pbk
    if (query.sid) reality['short-id'] = query.sid
    if (Object.keys(reality).length) proxy['reality-opts'] = reality
  }

  setIf(proxy, 'flow', query.flow)

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
  } else if (network === 'http' || network === 'h2') {
    proxy['h2-opts'] = {
      ...(wsHost ? { host: [wsHost] } : {}),
      ...(path ? { path } : {}),
    }
  }

  return proxy
}
