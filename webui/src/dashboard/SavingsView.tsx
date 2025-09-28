import { useEffect, useState } from 'react'
import type { SavingsMetric } from '../types'
import { fetchSavingsSummary } from '../services/api'

const SURFACE = 'bg-slate-800'

type SavingsViewProps = {
  onBack: () => void
}

function SavingsView({ onBack }: SavingsViewProps) {
  const [metrics, setMetrics] = useState<SavingsMetric[]>([])

  useEffect(() => {
    fetchSavingsSummary().then(setMetrics)
  }, [])

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Savings summary</h2>
          <p className="mt-2 text-sm text-slate-400">
            Review your cumulative savings and projected value over time.
          </p>
        </div>
        <button
          onClick={onBack}
          className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-indigo-400 hover:text-white"
        >
          Back to dashboard
        </button>
      </header>

      <section className={`${SURFACE} rounded-3xl p-8 shadow-xl`}>
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{metric.amount}</p>
              <p className="mt-2 text-xs text-slate-500">{metric.helper}</p>
            </article>
          ))}

          {metrics.length === 0 && (
            <div className="col-span-full h-32 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40"></div>
          )}
        </div>
      </section>

      <section className={`${SURFACE} rounded-3xl p-8 shadow-xl`}>
        <h3 className="text-lg font-semibold text-white">Projected milestones</h3>
        <p className="mt-2 text-sm text-slate-400">
          Estimate how much you could save by sticking with your optimized card mix.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">90 days</p>
            <p className="mt-3 text-2xl font-semibold text-white">+$210</p>
            <p className="mt-2 text-xs text-slate-500">Assuming your current average checkout volume.</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">12 months</p>
            <p className="mt-3 text-2xl font-semibold text-white">+$1,020</p>
            <p className="mt-2 text-xs text-slate-500">Targets cumulative rewards against standard cards.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SavingsView
