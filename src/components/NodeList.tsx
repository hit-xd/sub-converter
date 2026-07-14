import { useState } from 'react'
import type { ParseResult } from '../types'

interface Props {
  results: ParseResult[]
  okCount: number
  failCount: number
}

export default function NodeList({ results, okCount, failCount }: Props) {
  const [showFails, setShowFails] = useState(true)

  if (results.length === 0) {
    return <div className="nodelist nodelist--empty">尚无输入</div>
  }

  return (
    <div className="nodelist">
      <div className="nodelist__summary">
        <span className="badge badge--ok">成功 {okCount}</span>
        {failCount > 0 && (
          <button
            type="button"
            className="badge badge--fail badge--btn"
            onClick={() => setShowFails((s) => !s)}
          >
            失败 {failCount} {showFails ? '▾' : '▸'}
          </button>
        )}
      </div>

      <ul className="nodelist__items">
        {results.map((r, i) => {
          if (r.ok) {
            return (
              <li key={i} className="node node--ok">
                <span className={`type-tag type-tag--${r.proxy.type}`}>{r.proxy.type}</span>
                <span className="node__name" title={r.proxy.name}>
                  {r.proxy.name}
                </span>
                <span className="node__addr">
                  {r.proxy.server}:{r.proxy.port}
                </span>
              </li>
            )
          }
          if (!showFails) return null
          return (
            <li key={i} className="node node--fail">
              <span className="type-tag type-tag--fail">失败</span>
              <span className="node__error" title={r.error}>
                {r.error}
              </span>
              <span className="node__raw" title={r.raw}>
                {r.raw.slice(0, 48)}
                {r.raw.length > 48 ? '…' : ''}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
