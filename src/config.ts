const apiUrl = import.meta.env.VITE_API_URL?.trim()

export const config = {
  apiUrl: apiUrl ? apiUrl.replace(/\/$/, '') : 'http://localhost:8000',
} as const
