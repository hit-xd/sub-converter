// Serialize parsed proxies into a FLClash (mihomo/Clash.Meta) YAML string,
// in either "full config" or "proxies only" form.

import yaml from 'js-yaml'
import type { ClashProxy, OutputMode } from '../types'
import { baseConfig, baseRules, GROUP_AUTO, GROUP_SELECT } from './template'

const DUMP_OPTS: yaml.DumpOptions = {
  lineWidth: -1, // never wrap; keeps long paths/keys intact
  noRefs: true,
  quotingType: '"',
  forceQuotes: false,
  sortKeys: false,
}

function buildGroups(names: string[]): Array<Record<string, unknown>> {
  return [
    {
      name: GROUP_SELECT,
      type: 'select',
      proxies: [GROUP_AUTO, 'DIRECT', ...names],
    },
    {
      name: GROUP_AUTO,
      type: 'url-test',
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
      tolerance: 50,
      proxies: names.length ? names : ['DIRECT'],
    },
  ]
}

/** Build the config object (before serialization) for the given mode. */
export function buildConfigObject(
  proxies: ClashProxy[],
  mode: OutputMode,
): Record<string, unknown> {
  if (mode === 'proxies') {
    return { proxies }
  }
  const names = proxies.map((p) => p.name)
  return {
    ...baseConfig(),
    proxies,
    'proxy-groups': buildGroups(names),
    rules: baseRules(),
  }
}

/** Build the YAML string for the given proxies and output mode. */
export function buildConfig(proxies: ClashProxy[], mode: OutputMode): string {
  if (proxies.length === 0) return ''
  return yaml.dump(buildConfigObject(proxies, mode), DUMP_OPTS)
}
