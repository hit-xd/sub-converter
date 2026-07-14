import { useMemo, useState } from 'react'
import type { OutputMode, ParseResult } from './types'
import { parseInput } from './parsers'
import { buildConfig } from './generator'
import InputPanel from './components/InputPanel'
import NodeList from './components/NodeList'
import OutputPanel from './components/OutputPanel'

export default function App() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<OutputMode>('full')

  // Parse on every input change — parsing is cheap and fully client-side.
  const results = useMemo<ParseResult[]>(() => parseInput(input), [input])

  const proxies = useMemo(
    () => results.filter((r): r is Extract<ParseResult, { ok: true }> => r.ok).map((r) => r.proxy),
    [results],
  )

  const yamlText = useMemo(() => buildConfig(proxies, mode), [proxies, mode])

  const okCount = proxies.length
  const failCount = results.length - okCount

  return (
    <div className="app">
      <header className="app__header">
        <h1>订阅链接 → FLClash 配置</h1>
        <p className="app__subtitle">
          支持 vmess · vless · ss · ssr · trojan · hysteria2 · hysteria · tuic ——
          所有解析在浏览器本地完成，<strong>数据不出本机</strong>。
        </p>
      </header>

      <main className="app__main">
        <section className="pane">
          <InputPanel value={input} onChange={setInput} mode={mode} onModeChange={setMode} />
          <NodeList results={results} okCount={okCount} failCount={failCount} />
        </section>

        <section className="pane">
          <OutputPanel yamlText={yamlText} mode={mode} count={okCount} />
        </section>
      </main>

      <footer className="app__footer">
        输出为 mihomo (Clash.Meta) 格式，可直接导入 FLClash / Clash.Meta 内核。
      </footer>
    </div>
  )
}
