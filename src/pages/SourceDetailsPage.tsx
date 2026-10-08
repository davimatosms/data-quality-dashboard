import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteSource, getSourceStatus, listSources } from '../api/sources'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { StatusBadge } from '../components/StatusBadge'
import type { Check, Source, SourceStatus } from '../types/api'

function formatDate(value?: string | null) {
  if (!value) return 'Ainda não verificado'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function MetricList({ check }: { check: Check | null }) {
  if (!check || Object.keys(check.metrics).length === 0) {
    return <p className="muted">Nenhuma métrica disponível.</p>
  }
  return (
    <dl className="metrics-grid">
      {Object.entries(check.metrics).map(([name, value]) => (
        <div className="detail-item" key={name}><dt>{name}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  )
}

export function SourceDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const sourceId = Number(id)
  const [source, setSource] = useState<Source | null>(null)
  const [status, setStatus] = useState<SourceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!Number.isInteger(sourceId) || sourceId <= 0) {
      setError('O identificador da fonte é inválido.')
      setLoading(false)
      return
    }
    try {
      const [sources, sourceStatus] = await Promise.all([listSources(), getSourceStatus(sourceId)])
      const found = sources.find((item) => item.id === sourceId)
      if (!found) throw new Error('Fonte não encontrada.')
      setSource(found)
      setStatus(sourceStatus)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro inesperado ao consultar a fonte.')
    } finally {
      setLoading(false)
    }
  }, [sourceId])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [load])

  const handleDelete = async () => {
    if (!source || !window.confirm(`Excluir a fonte "${source.name}"?`)) return
    try {
      await deleteSource(source.id)
      navigate('/')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível excluir a fonte.')
    }
  }

  if (loading) return <section className="panel"><LoadingState /></section>
  if (error || !source || !status) {
    return <section className="panel"><ErrorState message={error ?? 'Fonte não encontrada.'} onRetry={() => { setLoading(true); setError(null); void load() }} /></section>
  }

  const latestCheck = status.latest_check
  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">Detalhes da fonte</p><h1>{source.name}</h1><p className="muted">{source.description || 'Sem descrição'}</p></div>
        <div className="source-actions">
          <Link className="button button-secondary" to={`/sources/${source.id}/edit`}>Editar</Link>
          <button className="button button-danger" type="button" onClick={() => void handleDelete()}>Excluir</button>
        </div>
      </div>
      <section className="details-grid">
        <div className="detail-item"><dt>Freshness</dt><dd><StatusBadge kind="freshness" value={status.freshness} /></dd></div>
        <div className="detail-item"><dt>Qualidade</dt><dd><StatusBadge kind="quality" value={status.quality} /></dd></div>
        <div className="detail-item"><dt>Frequência esperada</dt><dd>{source.expected_frequency_minutes} minutos</dd></div>
        <div className="detail-item"><dt>Tolerância</dt><dd>{source.freshness_tolerance}x</dd></div>
      </section>
      <section className="panel details-panel">
        <div className="panel-header"><h2>Último check</h2><span className="muted">{formatDate(latestCheck?.checked_at)}</span></div>
        <div className="panel-content"><MetricList check={latestCheck} /></div>
        {latestCheck?.rule_results.length ? <div className="rule-list">{latestCheck.rule_results.map((rule) => <div className="detail-item" key={rule.rule_name}><strong>{rule.rule_name}</strong><p className="muted">{rule.passed ? 'Aprovada' : `Falhou: ${rule.message || 'sem mensagem'}`}</p></div>)}</div> : null}
      </section>
      <section className="panel details-panel">
        <div className="panel-header"><h2>Histórico recente</h2><span className="muted">{status.history.length} checks</span></div>
        {status.history.length === 0 ? <div className="state-message"><p className="muted">Nenhum check recebido ainda.</p></div> : <div className="table-wrap"><table className="source-table"><thead><tr><th>Data</th><th>Status</th><th>Regras</th></tr></thead><tbody>{status.history.map((check) => <tr key={check.id}><td>{formatDate(check.checked_at)}</td><td><StatusBadge kind="quality" value={check.status} /></td><td>{check.rule_results.length}</td></tr>)}</tbody></table></div>}
      </section>
      <Link className="button button-secondary back-link" to="/">Voltar ao dashboard</Link>
    </>
  )
}
