import type { FetchOptions } from 'ofetch'
import { useRequestHeaders } from '#app'

export async function apiFetch<T>(
  url: string,
  options: FetchOptions<'json'> = {}
) {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiUrl || ''

  const headers: Record<string, string> = {}
  if (options.headers && typeof options.headers === 'object') {
    Object.assign(headers, options.headers as Record<string, string>)
  }

  if (process.server) {
    const requestHeaders = useRequestHeaders(['cookie'])
    if (requestHeaders.cookie && !headers.cookie) {
      headers.cookie = requestHeaders.cookie
    }
  }

  return $fetch<T>(url, {
    baseURL,
    credentials: 'include',
    ...options,
    headers,
  })
}
