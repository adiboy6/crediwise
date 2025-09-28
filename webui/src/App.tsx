import { useEffect, useMemo, useState } from 'react'
import type { AppView, AuthUser, CardOption } from './types'
import LoginView from './auth/LoginView'
import CardSetupView from './cards/CardSetupView'
import DashboardView from './dashboard/DashboardView'
import SavingsView from './dashboard/SavingsView'
import {
  fetchCardSelections,
  fetchCards,
  loginUser,
  logoutUser,
  saveCardSelection,
} from './services/api'

const APP_BACKGROUND = 'bg-slate-900'
const AUTH_STORAGE_KEY = 'cardwise-current-user'

function App() {
  const [view, setView] = useState<AppView>('login')
  const [selectedCards, setSelectedCards] = useState<CardOption[]>([])
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [allCards, setAllCards] = useState<CardOption[]>([])
  const [cardLoadError, setCardLoadError] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    fetchCards()
      .then((cards) => {
        setAllCards(cards)
        setCardLoadError(null)
      })
      .catch((error) => {
        console.error('Failed to load cards', error)
        setCardLoadError(error instanceof Error ? error.message : 'Failed to load cards')
      })
  }, [])

  useEffect(() => {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as AuthUser
        setAuthUser(parsed)
        setView('dashboard')
      } catch (error) {
        console.warn('Failed to parse stored user', error)
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    if (!authUser) return

    fetchCardSelections(authUser.id)
      .then((selectionIds) => {
        setSelectedCards((prev) => {
          const source = allCards.length > 0 ? allCards : prev
          return source.filter((card) => selectionIds.includes(card.id))
        })
      })
      .catch((error) => {
        console.error('Failed to fetch selections', error)
      })
  }, [authUser, allCards])

  useEffect(() => {
    if (!authUser) return
    const ids = selectedCards.map((card) => card.id)
    saveCardSelection(authUser.id, ids).catch((error) => {
      console.error('Failed to persist card selections', error)
    })
  }, [selectedCards, authUser])

  const handleLogin = async (payload: { email: string; firstName: string; lastName: string }) => {
    try {
      const user = await loginUser(payload.email, payload.firstName, payload.lastName)
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      setAuthUser(user)
      setView('dashboard')
      setLoginError(null)
    } catch (error) {
      console.error('Login failed', error)
      setLoginError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout failed', error)
    }
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuthUser(null)
    setSelectedCards([])
    setView('login')
  }

  const handleCardToggle = (card: CardOption) => {
    setSelectedCards((current) => {
      const exists = current.some((item) => item.id === card.id)
      return exists ? current.filter((item) => item.id !== card.id) : [...current, card]
    })
  }

  const mainView = useMemo(() => {
    if (!authUser) {
      return <LoginView onContinue={handleLogin} errorMessage={loginError} />
    }

    switch (view) {
      case 'card-setup':
        return (
          <CardSetupView
            selectedCards={selectedCards}
            onToggleCard={handleCardToggle}
            onContinue={() => setView('dashboard')}
            availableCards={allCards}
          />
        )
      case 'savings':
        return <SavingsView onBack={() => setView('dashboard')} />
      case 'dashboard':
      default:
        return (
          <DashboardView
            selectedCards={selectedCards}
            onReset={() => setView('card-setup')}
            onOpenSavings={() => setView('savings')}
          />
        )
    }
  }, [authUser, view, selectedCards, allCards])

  return (
    <div className={`${APP_BACKGROUND} min-h-screen w-full text-slate-100`}>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Cardwise</h1>
            <p className="text-sm text-slate-400">Smart card rewards at checkout</p>
          </div>
          <nav className="flex items-center gap-3 text-sm text-slate-400">
            {authUser ? (
              <>
                <span className="hidden rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 md:inline-flex">
                  {authUser.firstName} {authUser.lastName}
                </span>
                <button
                  onClick={() => setView('card-setup')}
                  className={`rounded-full px-3 py-1 transition hover:text-white ${
                    view === 'card-setup' ? 'bg-slate-700 text-white' : ''
                  }`}
                >
                  Card Setup
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className={`rounded-full px-3 py-1 transition hover:text-white ${
                    view === 'dashboard' ? 'bg-slate-700 text-white' : ''
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setView('savings')}
                  className={`rounded-full px-3 py-1 transition hover:text-white ${
                    view === 'savings' ? 'bg-slate-700 text-white' : ''
                  }`}
                >
                  Savings
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-indigo-400 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <button className="rounded-full px-3 py-1 text-white">Login</button>
            )}
          </nav>
        </header>

        <main className="flex-1">{mainView}</main>
        {cardLoadError && (
          <p className="mt-6 text-center text-sm text-red-400">{cardLoadError}</p>
        )}
        {loginError && !authUser && (
          <p className="mt-6 text-center text-sm text-red-400">{loginError}</p>
        )}
      </div>
    </div>
  )
}

export default App
