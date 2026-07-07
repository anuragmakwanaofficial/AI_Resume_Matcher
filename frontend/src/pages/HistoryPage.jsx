import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { historyAPI } from '../services/api'
import Navbar from '../components/Navbar'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  useEffect(() => {
    setLoading(true)
    historyAPI.getHistory(page, pageSize)
      .then((res) => {
        setHistory(res.data.items)
        setTotal(res.data.total)
      })
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [page])

  const getScoreColor = (score) => {
    if (!score && score !== 0) return 'text-on-surface-variant'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-secondary'
    if (score >= 40) return 'text-amber-600'
    return 'text-error'
  }

  const getScoreBg = (score) => {
    if (!score && score !== 0) return 'bg-surface-container'
    if (score >= 80) return 'bg-green-50 text-green-700'
    if (score >= 60) return 'bg-secondary-fixed text-secondary'
    if (score >= 40) return 'bg-amber-50 text-amber-700'
    return 'bg-error-container text-on-error-container'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-inter">
      <Navbar activePage="history" />

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
        <div className="flex items-center justify-between mb-xl fade-in-up">
          <div>
            <h1 className="text-display-lg font-bold text-on-surface">Analysis History</h1>
            <p className="text-body-md text-on-surface-variant mt-xs">{total} total analyses</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-xl">
            <div className="flex items-center gap-md text-on-surface-variant">
              <span className="loading-spinner" style={{ borderColor: '#c6c6cd', borderTopColor: '#0058be', width: 24, height: 24 }} />
              Loading history...
            </div>
          </div>
        )}

        {error && (
          <div className="p-md rounded-lg bg-error-container border border-error/30">
            <p className="text-body-md text-on-error-container">{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xl gap-md text-center">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 64 }}>history</span>
            <h2 className="text-headline-sm font-semibold text-on-surface">No analyses yet</h2>
            <p className="text-body-md text-on-surface-variant">Run your first resume–JD match to see results here.</p>
            <Link to="/" className="flex items-center gap-sm px-xl py-md bg-secondary text-on-secondary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity shadow-card">
              <span className="material-symbols-outlined">analytics</span>
              Start Analyzing
            </Link>
          </div>
        )}

        {!loading && history.length > 0 && (
          <>
            <div className="space-y-sm fade-in-up">
              {history.map((item) => (
                <Link
                  key={item.id}
                  to={`/results/${item.id}`}
                  className="block bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card hover:border-secondary hover:shadow-elevated transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-md">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant group-hover:border-secondary transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">description</span>
                      </div>
                      <div>
                        <h3 className="text-headline-sm font-semibold text-on-surface group-hover:text-secondary transition-colors">
                          {item.resume_filename || 'Pasted Resume'}
                        </h3>
                        <p className="text-body-md text-on-surface-variant mt-xs">
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-md">
                      <span className={`px-md py-sm rounded-full font-label-md text-label-md font-bold ${getScoreBg(item.overall_score)}`}>
                        {item.overall_score !== null ? `${item.overall_score}% Match` : 'N/A'}
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">chevron_right</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {total > pageSize && (
              <div className="flex items-center justify-center gap-md mt-xl">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-md py-sm border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Page {page} of {Math.ceil(total / pageSize)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * pageSize >= total}
                  className="px-md py-sm border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-surface-container-low border-t border-outline-variant w-full mt-auto">
        <div className="flex justify-between items-center px-lg py-lg w-full max-w-container-max mx-auto">
          <div className="font-label-md text-label-md font-bold text-on-surface">TalentMatch AI</div>
          <div className="text-body-md text-on-surface-variant">© 2024 TalentMatch AI</div>
        </div>
      </footer>
    </div>
  )
}
