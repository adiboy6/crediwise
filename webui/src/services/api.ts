import type { AuthUser, CardOption, ComparisonOffer, SavingsMetric } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const data = await response.json()
      if (typeof data?.message === 'string') {
        message = data.message
      }
    } catch (error) {
      // ignore parse errors, fallback to default message
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function loginUser(
  email: string,
  firstName: string,
  lastName: string,
): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, firstName, lastName }),
  })

  return handleResponse<AuthUser>(response)
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function fetchCards(): Promise<CardOption[]> {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    method: 'GET',
    credentials: 'include',
  })

  const data = await handleResponse<{ cards: CardOption[] }>(response)
  return data.cards
}

export async function fetchComparisonOffers(): Promise<ComparisonOffer[]> {
  const response = await fetch(`${API_BASE_URL}/cards/comparison`, {
    method: 'GET',
    credentials: 'include',
  })

  const data = await handleResponse<{ offers: ComparisonOffer[] }>(response)
  return data.offers
}

export async function fetchSavingsSummary(): Promise<SavingsMetric[]> {
  const response = await fetch(`${API_BASE_URL}/savings`, {
    method: 'GET',
    credentials: 'include',
  })

  const data = await handleResponse<{ summary: SavingsMetric[] }>(response)
  return data.summary
}

export async function fetchCardSelections(userId: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/cards`, {
    method: 'GET',
    credentials: 'include',
  })

  const data = await handleResponse<{ cardIds: string[] }>(response)
  return data.cardIds
}

export async function saveCardSelection(userId: string, cardIds: string[]): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ cardIds }),
  })

  const data = await handleResponse<{ cardIds: string[] }>(response)
  return data.cardIds
}
