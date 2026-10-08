import type { FreshnessStatus, QualityStatus } from '../types/api'

interface StatusBadgeProps {
  kind: 'freshness' | 'quality'
  value: FreshnessStatus | QualityStatus
}

export function StatusBadge({ kind, value }: StatusBadgeProps) {
  const label = kind === 'freshness' ? 'Freshness' : 'Qualidade'
  return (
    <span
      className={`status-badge status-${value.toLowerCase()}`}
      aria-label={`${label}: ${value}`}
    >
      {value}
    </span>
  )
}
