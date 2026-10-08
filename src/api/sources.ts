import { request } from './client'
import type { Source, SourceInput, SourceStatus } from '../types/api'

export function listSources(): Promise<Source[]> {
  return request<Source[]>('/sources')
}

export function getSourceStatus(id: number): Promise<SourceStatus> {
  return request<SourceStatus>(`/sources/${id}/status`)
}

export function createSource(input: SourceInput): Promise<Source> {
  return request<Source>('/sources', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateSource(id: number, input: SourceInput): Promise<Source> {
  return request<Source>(`/sources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteSource(id: number): Promise<void> {
  return request<void>(`/sources/${id}`, { method: 'DELETE' })
}
