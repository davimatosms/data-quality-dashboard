export type FreshnessStatus = 'FRESH' | 'STALE' | 'UNKNOWN'
export type QualityStatus = 'PASSING' | 'FAILING' | 'UNKNOWN'

export interface RuleResult {
  rule_name: string
  passed: boolean
  message?: string | null
}

export interface Metrics {
  [key: string]: number
}

export interface Check {
  id: number
  source_id: number
  checked_at: string
  status: Exclude<QualityStatus, 'UNKNOWN'>
  rule_results: RuleResult[]
  metrics: Metrics
}

export interface Source {
  id: number
  name: string
  description?: string | null
  expected_frequency_minutes: number
  freshness_tolerance: number
  quality_rules: string[]
  freshness: FreshnessStatus
  quality: QualityStatus
}

export interface SourceStatus {
  source_id: number
  freshness: FreshnessStatus
  quality: QualityStatus
  latest_check: Check | null
  history: Check[]
}

export interface SourceInput {
  name: string
  description?: string
  expected_frequency_minutes: number
  freshness_tolerance: number
  quality_rules: string[]
}
