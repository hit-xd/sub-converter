import type { OutputMode } from '../types'

interface Props {
  value: string
  onChange: (value: string) => void
  mode: OutputMode
  onModeChange: (mode: OutputMode) => void
}

const PLACEHOLDER = `在此粘贴分享链接，每行一条，例如：

vmess://eyJ2IjoiMiIsInBzIjoi...
vless://uuid@host:443?security=reality&pbk=...#香港01
hysteria2://password@host:443?sni=example.com#日本01

也可直接粘贴订阅内容（一整段 base64）。`

export default function InputPanel({ value, onChange, mode, onModeChange }: Props) {
  return (
    <div className="input-panel">
      <div className="toolbar">
        <span className="toolbar__label">输出模式</span>
        <div className="segmented">
          <button
            className={mode === 'full' ? 'segmented__btn is-active' : 'segmented__btn'}
            onClick={() => onModeChange('full')}
            type="button"
          >
            完整配置
          </button>
          <button
            className={mode === 'proxies' ? 'segmented__btn is-active' : 'segmented__btn'}
            onClick={() => onModeChange('proxies')}
            type="button"
          >
            仅节点列表
          </button>
        </div>
        <button className="btn btn--ghost" type="button" onClick={() => onChange('')}>
          清空
        </button>
      </div>

      <textarea
        className="input-panel__textarea"
        spellCheck={false}
        placeholder={PLACEHOLDER}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
