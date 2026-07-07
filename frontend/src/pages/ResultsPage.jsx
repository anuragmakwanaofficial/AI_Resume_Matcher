import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { matcherAPI } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'
import Navbar from '../components/Navbar'

/* ─── Score Ring SVG ───────────────────────────────────────── */
function ScoreRing({ score }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColorClass = (s) => {
    if (s >= 80) return { ring: '#16a34a', text: '#15803d', label: 'Excellent' }
    if (s >= 60) return { ring: '#0058be', text: '#0058be', label: 'Good' }
    if (s >= 40) return { ring: '#d97706', text: '#b45309', label: 'Fair' }
    return { ring: '#ba1a1a', text: '#ba1a1a', label: 'Low' }
  }

  const colors = getColorClass(score)

  return (
    <div className="flex flex-col items-center gap-md">
      <div className="relative flex items-center justify-center w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="#dce9ff"
            strokeWidth="8"
          />
          {/* Progress fill */}
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke={colors.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            className="score-ring-fill"
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-score-display font-bold" style={{ color: colors.text }}>
            {score}%
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Match
          </span>
        </div>
      </div>
      <span
        className="inline-flex items-center gap-xs px-md py-xs rounded-full font-label-md text-label-md font-bold"
        style={{ backgroundColor: `${colors.ring}18`, color: colors.text, border: `1px solid ${colors.ring}30` }}
      >
        {colors.label} Match
      </span>
    </div>
  )
}

/* ─── Skill Tag ────────────────────────────────────────────── */
function SkillTag({ name, status }) {
  return (
    <span className={status === 'matched' ? 'skill-tag-matched' : 'skill-tag-missing'}>
      {status === 'matched' ? (
        <span className="material-symbols-outlined filled text-green-600" style={{ fontSize: '14px' }}>check_circle</span>
      ) : (
        <span className="material-symbols-outlined text-outline" style={{ fontSize: '14px' }}>remove_circle_outline</span>
      )}
      {name}
    </span>
  )
}

/* ─── Skill Section ────────────────────────────────────────── */
function SkillSection({ title, status, mustHave, niceToHave }) {
  const isMatched = status === 'matched'
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-sm mb-md">
        <span
          className={`material-symbols-outlined filled ${isMatched ? 'text-green-600' : 'text-outline'}`}
          style={{ fontSize: '20px' }}
        >
          {isMatched ? 'check_circle' : 'info'}
        </span>
        <h3 className="text-headline-sm font-semibold text-on-surface">{title}</h3>
      </div>

      <div className="space-y-md">
        {/* Must-Have */}
        {mustHave.length > 0 && (
          <div className="bg-surface-container-low/50 p-md rounded-lg border border-outline-variant/30">
            <p className={`font-label-md text-label-md uppercase tracking-wider mb-sm font-bold ${isMatched ? 'text-secondary' : 'text-error'}`}>
              Must-Have Skills
            </p>
            <div className="flex flex-wrap gap-sm">
              {mustHave.map((skill) => (
                <SkillTag key={skill} name={skill} status={status} />
              ))}
            </div>
          </div>
        )}

        {/* Nice-to-Have */}
        {niceToHave.length > 0 && (
          <div className="p-md">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-sm">
              Nice-to-Have Skills
            </p>
            <div className="flex flex-wrap gap-sm">
              {niceToHave.map((skill) => (
                <SkillTag key={skill} name={skill} status={status} />
              ))}
            </div>
          </div>
        )}

        {mustHave.length === 0 && niceToHave.length === 0 && (
          <p className="text-body-md text-on-surface-variant italic px-md">None identified</p>
        )}
      </div>
    </div>
  )
}

/* ─── ResultsPage ──────────────────────────────────────────── */
export default function ResultsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [analysis, setAnalysis] = useState(location.state?.analysis || null)
  const [loading, setLoading] = useState(!analysis)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!analysis && id) {
      matcherAPI.getAnalysis(id)
        .then((res) => setAnalysis(res.data))
        .catch(() => setError('Could not load this analysis.'))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-lg">
          <div className="loading-spinner w-12 h-12 border-4 border-secondary/30 border-t-secondary" style={{ width: 48, height: 48 }} />
          <p className="text-body-lg text-on-surface-variant ai-pulse">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-inter">
        <div className="text-center">
          <p className="text-body-lg text-error mb-md">{error || 'Analysis not found.'}</p>
          <Link to="/" className="text-secondary hover:underline font-label-md">← Run New Analysis</Link>
        </div>
      </div>
    )
  }

  /* Parse skill matches */
  const matchedMustHave = analysis.skill_matches?.filter(s => s.status === 'matched' && s.category === 'must_have').map(s => s.skill_name) || []
  const matchedNiceToHave = analysis.skill_matches?.filter(s => s.status === 'matched' && s.category === 'nice_to_have').map(s => s.skill_name) || []
  const missingMustHave = analysis.skill_matches?.filter(s => s.status === 'missing' && s.category === 'must_have').map(s => s.skill_name) || []
  const missingNiceToHave = analysis.skill_matches?.filter(s => s.status === 'missing' && s.category === 'nice_to_have').map(s => s.skill_name) || []

  const handleExportPDF = async () => {
    try {
      const response = await matcherAPI.exportPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Analysis_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Failed to export PDF');
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-inter">
      <Navbar activePage="results" />

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-xl gap-md fade-in-up">
          <div>
            <h1 className="text-display-lg font-bold text-on-surface">Analysis Results</h1>
            {analysis.resume_filename && (
              <p className="text-body-md text-on-surface-variant mt-xs">
                <span className="material-symbols-outlined text-sm mr-1">description</span>
                {analysis.resume_filename}
              </p>
            )}
          </div>
          <div className="flex gap-md">
            <button
              onClick={() => navigate('/')}
              className="px-md py-sm border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md flex items-center gap-sm"
            >
              <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              New Analysis
            </button>
            <button
              onClick={handleExportPDF}
              className="px-md py-sm bg-secondary text-on-secondary rounded-lg hover:opacity-90 transition-opacity font-label-md text-label-md flex items-center gap-sm shadow-card"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Export PDF
            </button>
          </div>
        </div>

        {/* ── 12-Col Layout ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

          {/* ── Left Rail (4 cols) ─────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-gutter">

            {/* Score Card */}
            <div className="bg-surface-container-lowest border border-outline-variant border-l-2 border-l-secondary rounded-xl p-lg shadow-card fade-in-up relative overflow-hidden">
              <div className="absolute top-0 right-0 p-sm">
                <span className="material-symbols-outlined text-secondary text-2xl">workspace_premium</span>
              </div>
              <h2 className="text-headline-sm font-semibold text-on-surface mb-md">Overall Match</h2>
              <div className="flex justify-center py-md">
                <ScoreRing score={analysis.overall_score || 0} />
              </div>
              {analysis.narrative && (
                <div className="mt-md bg-surface-container-low rounded-lg p-md border border-outline-variant/50">
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {analysis.narrative}
                  </p>
                </div>
              )}
            </div>

            {/* Suggestions Card */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-sm mb-md">
                  <span className="material-symbols-outlined text-secondary text-xl">lightbulb</span>
                  <h2 className="text-headline-sm font-semibold text-on-surface">Suggestions for Improvement</h2>
                </div>
                <ul className="space-y-sm">
                  {analysis.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors group">
                      <span className="material-symbols-outlined text-outline text-[16px] mt-xs flex-shrink-0 group-hover:text-secondary transition-colors">
                        edit_document
                      </span>
                      <span className="text-body-md text-on-surface-variant">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analysis Metadata */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">info</span>
                <h2 className="text-headline-sm font-semibold text-on-surface">Analysis Details</h2>
              </div>
              <dl className="space-y-sm text-body-md">
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Analysis ID</dt>
                  <dd className="text-on-surface font-mono text-xs truncate ml-md max-w-[120px]">{analysis.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Date</dt>
                  <dd className="text-on-surface">{new Date(analysis.created_at).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Match Score</dt>
                  <dd className="text-on-surface font-semibold">{analysis.overall_score}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Skills Matched</dt>
                  <dd className="text-on-surface">{matchedMustHave.length + matchedNiceToHave.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Skills Missing</dt>
                  <dd className="text-on-surface">{missingMustHave.length + missingNiceToHave.length}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* ── Right Stage (8 cols) ────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-gutter">

            {/* Skill Assessment Matrix */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card h-full fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-md">
                <h2 className="text-headline-md font-semibold text-on-surface">Skill Assessment Matrix</h2>
                <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-md py-xs rounded-full">
                  {(matchedMustHave.length + matchedNiceToHave.length)} matched · {(missingMustHave.length + missingNiceToHave.length)} missing
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                <SkillSection
                  title="Matched Skills"
                  status="matched"
                  mustHave={matchedMustHave}
                  niceToHave={matchedNiceToHave}
                />
                <SkillSection
                  title="Missing Skills"
                  status="missing"
                  mustHave={missingMustHave}
                  niceToHave={missingNiceToHave}
                />
              </div>
            </div>

            {/* Match Score Breakdown Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-headline-sm font-semibold text-on-surface mb-md">Match Breakdown</h2>
              <div className="space-y-md">
                {[
                  {
                    label: 'Must-Have Skills Coverage',
                    matched: matchedMustHave.length,
                    total: matchedMustHave.length + missingMustHave.length,
                    color: '#16a34a'
                  },
                  {
                    label: 'Nice-to-Have Skills Coverage',
                    matched: matchedNiceToHave.length,
                    total: matchedNiceToHave.length + missingNiceToHave.length,
                    color: '#0058be'
                  },
                ].map(({ label, matched, total, color }) => {
                  const pct = total > 0 ? Math.round((matched / total) * 100) : 0
                  return (
                    <div key={label}>
                      <div className="flex justify-between mb-xs">
                        <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
                        <span className="font-label-md text-label-md font-bold" style={{ color }}>
                          {matched}/{total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div>
                  <div className="flex justify-between mb-xs">
                    <span className="font-label-md text-label-md text-on-surface-variant">Overall AI Match</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">{analysis.overall_score}%</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${analysis.overall_score}%`,
                        backgroundColor: analysis.overall_score >= 80 ? '#16a34a' : analysis.overall_score >= 60 ? '#0058be' : analysis.overall_score >= 40 ? '#d97706' : '#ba1a1a'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant w-full mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg py-lg w-full max-w-container-max mx-auto gap-md">
          <div className="font-label-md text-label-md font-bold text-on-surface">TalentMatch AI</div>
          <div className="text-body-md text-on-surface-variant text-center">
            © 2026 TalentMatch AI. Powered by AI recruitment intelligence made by Anurag makwana
          </div>
          <div className="flex gap-md">
            {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((link) => (
              <a key={link} href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
