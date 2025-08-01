'use client'

import { useState } from 'react'

export default function Home() {
  const [name, setName] = useState('')
  const [job, setJob] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, job }),
      })

      if (!res.ok) {
        const errText = await res.text()
        setResult(`Error ${res.status}: ${errText || 'Failed to generate resume.'}`)
      } else {
        const data = await res.json()
        setResult(data.output || 'No information found.')
      }
    } catch (err) {
      setResult('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-6 flex items-center justify-center">
      <main className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Gemini Resume Finder
        </h1>

        {/* Resume form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Job Title or Organization"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            required
          />
          <button
            className={`w-full py-2 font-semibold rounded-md transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Resume'}
          </button>
        </form>

        {/* Resume result */}
        {result && (
          <div className="mt-6 p-4 bg-gray-100 border rounded-md text-sm whitespace-pre-wrap text-gray-800">
            {result}
          </div>
        )}
      </main>
    </div>
  )
}
