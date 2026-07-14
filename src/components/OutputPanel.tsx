import { useState } from 'react'
import type { OutputMode } from '../types'

interface Props {
  yamlText: string
  mode: OutputMode
  count: number
}

export default function OutputPanel({ yamlText, mode, count }: Props) {
  const [copied, setCopied] = useState(false)

  const filename = mode === 'full' ? 'config.yaml' : 'proxies.yaml'
  const disabled = yamlText.length === 0

  async function handleCopy() {
    if (disabled) return
    try {
      await navigator.clipboard.writeText(yamlText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be blocked (insecure context); ignore silently.
    }
  }

  function handleDownload() {
    if (disabled) return
    const blob = new Blob([yamlText], { type: 'text/yaml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="output-panel">
      <div className="toolbar">
        <span className="toolbar__label">
          {mode === 'full' ? '完整配置' : '节点列表'}
          {count > 0 && <span className="toolbar__count"> · {count} 个节点</span>}
        </span>
        <div className="toolbar__spacer" />
        <button className="btn" type="button" onClick={handleCopy} disabled={disabled}>
          {copied ? '已复制 ✓' : '复制'}
        </button>
        <button className="btn btn--primary" type="button" onClick={handleDownload} disabled={disabled}>
          下载 {filename}
        </button>
      </div>

      <pre className="output-panel__code">
        {disabled ? <span className="output-panel__empty">配置将在这里生成…</span> : yamlText}
      </pre>
    </div>
  )
}
