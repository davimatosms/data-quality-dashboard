import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createSource, listSources, updateSource } from '../api/sources'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import type { SourceInput } from '../types/api'

export function SourceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState<SourceInput>({ name: '', description: '', expected_frequency_minutes: 1440, freshness_tolerance: 1.5, quality_rules: [] })
  const [rulesText, setRulesText] = useState('')
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSource = useCallback(async () => {
    if (!editing) return
    try {
      const source = (await listSources()).find((item) => item.id === Number(id))
      if (!source) throw new Error('Fonte não encontrada.')
      setForm({ name: source.name, description: source.description ?? '', expected_frequency_minutes: source.expected_frequency_minutes, freshness_tolerance: source.freshness_tolerance, quality_rules: source.quality_rules })
      setRulesText(source.quality_rules.join('\n'))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a fonte.')
    } finally {
      setLoading(false)
    }
  }, [editing, id])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadSource(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadSource])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    const input = { ...form, quality_rules: rulesText.split('\n').map((rule) => rule.trim()).filter(Boolean) }
    try {
      const source = editing ? await updateSource(Number(id), input) : await createSource(input)
      navigate(`/sources/${source.id}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a fonte.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <section className="panel"><LoadingState /></section>
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">{editing ? 'Editar fonte' : 'Nova fonte'}</p><h1>{editing ? 'Editar fonte' : 'Cadastrar fonte'}</h1><p className="muted">Configure a frequência e as regras esperadas para o monitoramento.</p></div></div>
      {error ? <ErrorState message={error} /> : null}
      <form className="form panel form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <label className="form-field">Nome<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="form-field">Descrição<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label className="form-field">Frequência esperada (minutos)<input required min="1" type="number" value={form.expected_frequency_minutes} onChange={(event) => setForm({ ...form, expected_frequency_minutes: Number(event.target.value) })} /></label>
        <label className="form-field">Tolerância<input required min="0.01" step="0.1" type="number" value={form.freshness_tolerance} onChange={(event) => setForm({ ...form, freshness_tolerance: Number(event.target.value) })} /></label>
        <label className="form-field">Regras esperadas<textarea rows={5} placeholder="Uma regra por linha" value={rulesText} onChange={(event) => setRulesText(event.target.value)} /></label>
        <div className="form-actions"><button className="button button-primary" disabled={saving} type="submit">{saving ? 'Salvando...' : 'Salvar fonte'}</button><Link className="button button-secondary" to="/">Cancelar</Link></div>
      </form>
    </>
  )
}
