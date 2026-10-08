import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSources } from '../api/sources'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { StatusBadge } from '../components/StatusBadge'
import { SummaryCard } from '../components/SummaryCard'
import type { FreshnessStatus, QualityStatus, Source } from '../types/api'

const freshnessOptions: Array<FreshnessStatus | 'ALL'> = ['ALL', 'FRESH', 'STALE', 'UNKNOWN']
const qualityOptions: Array<QualityStatus | 'ALL'> = ['ALL', 'PASSING', 'FAILING', 'UNKNOWN']

export function DashboardPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [freshness, setFreshness] = useState<FreshnessStatus | 'ALL'>('ALL')
  const [quality, setQuality] = useState<QualityStatus | 'ALL'>('ALL')

  const loadSources = useCallback(async () => {
    try {
      setSources(await listSources())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro inesperado ao consultar a API.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSources()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSources])

  const refreshSources = () => {
    setLoading(true)
    setError(null)
    void loadSources()
  }

  const filteredSources = useMemo(
    () => sources.filter((source) => (
      (freshness === 'ALL' || source.freshness === freshness)
      && (quality === 'ALL' || source.quality === quality)
    )),
    [freshness, quality, sources],
  )

  const count = (predicate: (source: Source) => boolean) => sources.filter(predicate).length

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1>Saúde das fontes</h1>
          <p className="muted">Acompanhe freshness e qualidade dos seus dados.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={refreshSources}>
          Atualizar
        </button>
      </div>

      {!loading && !error && sources.length > 0 ? (
        <>
          <section className="summary-grid" aria-label="Resumo das fontes">
            <SummaryCard label="Total de fontes" value={sources.length} />
            <SummaryCard label="Fresh" value={count((source) => source.freshness === 'FRESH')} />
            <SummaryCard label="Stale" value={count((source) => source.freshness === 'STALE')} />
            <SummaryCard label="Qualidade passando" value={count((source) => source.quality === 'PASSING')} />
          </section>
          <section className="panel">
            <div className="panel-header">
              <h2>Fontes monitoradas</h2>
              <div className="filters">
                <label>
                  Freshness
                  <select value={freshness} onChange={(event) => setFreshness(event.target.value as FreshnessStatus | 'ALL')}>
                    {freshnessOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Qualidade
                  <select value={quality} onChange={(event) => setQuality(event.target.value as QualityStatus | 'ALL')}>
                    {qualityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            </div>
            {filteredSources.length === 0 ? (
              <div className="state-message"><h2>Nenhuma fonte corresponde aos filtros</h2></div>
            ) : (
              <div className="table-wrap">
                <table className="source-table">
                  <thead>
                    <tr><th>Fonte</th><th>Freshness</th><th>Qualidade</th><th>Frequência</th><th>Último check</th><th>Ações</th></tr>
                  </thead>
                  <tbody>
                    {filteredSources.map((source) => (
                      <tr key={source.id}>
                        <td><strong>{source.name}</strong><br /><span className="muted">{source.description || 'Sem descrição'}</span></td>
                        <td><StatusBadge kind="freshness" value={source.freshness} /></td>
                        <td><StatusBadge kind="quality" value={source.quality} /></td>
                        <td>{source.expected_frequency_minutes} min</td>
                        <td>Consulte os detalhes</td>
                        <td><Link className="button button-secondary" to={`/sources/${source.id}`}>Detalhes</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : loading ? <section className="panel"><LoadingState /></section>
        : error ? <section className="panel"><ErrorState message={error} onRetry={refreshSources} /></section>
          : <section className="panel"><EmptyState /></section>}
    </>
  )
}
