import { attachTo } from './identity.client'

export async function fetchWithIdentity(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = attachTo(new Headers(init?.headers))
  return fetch(input, { ...init, headers })
}
