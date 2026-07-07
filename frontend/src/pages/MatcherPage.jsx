import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { matcherAPI } from '../services/api'
import Navbar from '../components/Navbar'

/* ─── File Upload Zone ─────────────────────────────────────── */
function FileUploadZone({ onFile, acceptLabel, file }) {
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) onFile(droppedFile)
  }

  const handleChange = (e) => {
    if (e.target.files[0]) onFile(e.target.files[0])
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`w-full py-md border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-xs transition-all duration-200 cursor-pointer ${
          file
            ? 'border-secondary bg-surface-container-low'
            : 'border-outline-variant hover:border-secondary hover:bg-surface-container-low'
        }`}
      >
        <span className={`material-symbols-outlined text-2xl ${file ? 'text-secondary' : 'text-on-surface-variant'}`}>
          {file ? 'task_alt' : 'upload_file'}
        </span>
        <span className="font-label-md text-label-md text-on-surface-variant text-center">
          {file ? file.name : acceptLabel}
        </span>
        {file && (
          <span className="text-xs text-secondary font-medium">Click to change file</span>
        )}
      </button>
    </div>
  )
}

/* ─── Input Card ───────────────────────────────────────────── */
function InputCard({ icon, title, textValue, onTextChange, file, onFile, textPlaceholder, fileLabel, id }) {
  return (
    <div className="glass-card rounded-xl p-lg flex flex-col gap-md shadow-card border border-outline-variant relative overflow-hidden group hover:border-secondary transition-colors duration-300">
      {/* Left accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-surface-container-high group-hover:bg-secondary transition-colors duration-300" />

      {/* Header */}
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-secondary text-2xl">{icon}</span>
        <h2 className="text-headline-sm font-semibold text-on-surface">{title}</h2>
      </div>

      {/* File Upload */}
      <FileUploadZone onFile={onFile} acceptLabel={fileLabel} file={file} />

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-outline-variant" />
        <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-md text-label-md">OR</span>
        <div className="flex-grow border-t border-outline-variant" />
      </div>

      {/* Textarea */}
      <div className="flex-grow">
        <label className="sr-only" htmlFor={id}>Paste text</label>
        <textarea
          id={id}
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={textPlaceholder}
          rows={10}
          className="w-full p-md rounded-lg border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary outline-none resize-none bg-surface-container-lowest font-inter text-body-md text-on-surface placeholder:text-on-surface-variant transition-colors duration-200"
        />
      </div>
    </div>
  )
}

/* ─── MatcherPage ──────────────────────────────────────────── */
export default function MatcherPage() {
  const navigate = useNavigate()

  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [jdFile, setJdFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hasResume = resumeText.trim() || resumeFile
  const hasJD = jdText.trim() || jdFile

  const handleAnalyze = async () => {
    if (!hasResume || !hasJD) {
      setError('Please provide both a resume and job description before analyzing.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      if (resumeFile) formData.append('resume_file', resumeFile)
      else formData.append('resume_text', resumeText)
      if (jdFile) formData.append('jd_file', jdFile)
      else formData.append('jd_text', jdText)

      const response = await matcherAPI.runMatch(formData)
      const analysisId = response.data.id
      navigate(`/results/${analysisId}`, { state: { analysis: response.data } })
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Analysis failed. Please check your inputs and try again.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-inter">
      <Navbar activePage="dashboard" />

      <main className="flex-grow flex flex-col items-center w-full px-margin-mobile md:px-lg py-xl max-w-container-max mx-auto gap-xl">

        {/* ── Hero Section ─────────────────────────────────────── */}
        <section className="w-full text-center py-xl px-md rounded-xl hero-gradient glass-card shadow-card border border-outline-variant fade-in-up">
          <div className="flex items-center justify-center gap-sm mb-sm">
            <span className="material-symbols-outlined text-secondary text-3xl">psychology</span>
            <h1 className="text-display-lg font-bold text-on-surface">Intelligent Match Analysis</h1>
          </div>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-sm">
            Leverage proprietary AI to instantly evaluate candidate fit against your job requirements.
            Upload documents or paste text below to generate a comprehensive skill matrix and match score.
          </p>
          <div className="flex items-center justify-center gap-xl mt-lg">
            {[
              { icon: 'analytics', label: 'AI Match Score' },
              { icon: 'checklist', label: 'Skill Matrix' },
              { icon: 'lightbulb', label: 'Improvement Tips' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary">{icon}</span>
                <span className="font-label-md text-label-md">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Input Grid ───────────────────────────────────────── */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-gutter fade-in-up" style={{ animationDelay: '0.1s' }}>
          <InputCard
            icon="description"
            title="Your Resume"
            textValue={resumeText}
            onTextChange={setResumeText}
            file={resumeFile}
            onFile={setResumeFile}
            textPlaceholder="Paste your resume text here..."
            fileLabel="Upload PDF, DOCX, or TXT"
            id="resume-text"
          />
          <InputCard
            icon="work"
            title="Job Description"
            textValue={jdText}
            onTextChange={setJdText}
            file={jdFile}
            onFile={setJdFile}
            textPlaceholder="Paste the job description here..."
            fileLabel="Upload Requirements Document"
            id="jd-text"
          />
        </div>

        {/* ── Error ────────────────────────────────────────────── */}
        {error && (
          <div className="w-full flex items-start gap-sm p-md rounded-lg bg-error-container border border-error/30 fade-in-up">
            <span className="material-symbols-outlined text-error text-xl">error</span>
            <p className="text-body-md text-on-error-container font-medium">{error}</p>
          </div>
        )}

        {/* ── Analyze Button ────────────────────────────────────── */}
        <div className="w-full flex justify-center py-md fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button
            id="btn-analyze"
            onClick={handleAnalyze}
            disabled={loading || !hasResume || !hasJD}
            className={`flex items-center gap-sm px-xl py-md rounded-lg font-label-md text-label-md shadow-card transition-all duration-200 ${
              loading || !hasResume || !hasJD
                ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed'
                : 'bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant hover:shadow-elevated'
            }`}
          >
            {loading ? (
              <>
                <span className="loading-spinner" />
                <span className="ai-pulse">Analyzing with AI...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">analytics</span>
                Analyze Match
              </>
            )}
          </button>
        </div>

        {/* ── Helper Note ───────────────────────────────────────── */}
        {loading && (
          <div className="w-full text-center text-on-surface-variant text-body-md ai-pulse">
            ⚡ AI analysis typically takes 30–60 seconds. Please wait...
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-surface-container-low border-t border-outline-variant w-full mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg py-lg w-full max-w-container-max mx-auto gap-md">
          <div className="font-label-md text-label-md font-bold text-on-surface">TalentMatch AI</div>
          <div className="text-body-md text-on-surface-variant text-center">
            © 2026 TalentMatch AI. Powered by AI recruitment intelligence made by Anurag makwana
          </div>
          <div className="flex gap-md">
            {['Privacy Policy', 'Terms of Service', 'AI Ethics'].map((link) => (
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
