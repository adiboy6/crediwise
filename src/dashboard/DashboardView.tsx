import { useEffect, useState } from 'react'
import type { CardOption, ComparisonOffer } from '../types'
import { fetchComparisonOffers } from '../services/api'

const SURFACE = 'bg-slate-800'

const BEST_CARD_PLACEHOLDER_TEXT =
  'We’ll surface the top card and savings details once data is available.'

type DashboardViewProps = {
  selectedCards: CardOption[]
  onReset: () => void
  onOpenSavings: () => void
}

function DashboardView({ selectedCards, onReset, onOpenSavings }: DashboardViewProps) {
  const [comparison, setComparison] = useState<ComparisonOffer[]>([])

  useEffect(() => {
    fetchComparisonOffers().then(setComparison)
  }, [])

  const bestCard = selectedCards[0]

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Checkout recommendation</h2>
          <p className="mt-2 text-sm text-slate-400">
            See the best card to use right now and how other cards would compare.
          </p>
        </div>
        <button
          onClick={onOpenSavings}
          className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-indigo-400 hover:text-white"
        >
          Savings summary
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className={`${SURFACE} rounded-3xl p-8 shadow-xl`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Best card recommendation</h3>
              <p className="mt-2 text-sm text-slate-400">
                {bestCard ? `Use ${bestCard.name} for the highest projected savings.` : BEST_CARD_PLACEHOLDER_TEXT}
              </p>
            </div>
            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200">
              {selectedCards.length} cards active
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
            {bestCard ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-white">{bestCard.name}</p>
                  <p className="text-xs text-slate-400">{bestCard.issuer} • {bestCard.network}</p>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  {bestCard.rewards.map((reward) => (
                    <li key={reward} className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-indigo-400"></span>
                      <span>{reward}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-2xl bg-slate-800/70 p-4 text-sm">
                  <p className="text-xs uppercase tracking-wide text-indigo-300">Estimated yearly rewards</p>
                  <p className="mt-2 text-2xl font-semibold text-white">${bestCard.yearlyRewards}</p>
                </div>
              </div>
            ) : (
              <div className="h-48 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40"></div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className={`${SURFACE} rounded-3xl p-6 shadow-xl`}>
            <h3 className="text-lg font-semibold text-white">Comparison</h3>
            <p className="mt-2 text-sm text-slate-400">Review how alternative cards would perform.</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {comparison.map((offer) => (
                <article key={offer.cardName} className="rounded-2xl border border-slate-700 bg-slate-900/40 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{offer.cardName}</span>
                    <span className="text-indigo-300">{offer.offer}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Estimated savings ${offer.estimatedSavings}</p>
                </article>
              ))}

              {comparison.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-3">
                  Waiting for card data
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      <div>
        <button
          onClick={onReset}
          className="mt-6 inline-flex items-center rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-indigo-400 hover:text-white"
        >
          Manage cards
        </button>
      </div>
    </div>
  )
}

export default DashboardView
