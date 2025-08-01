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

    console.log('Generating for:', { name, job })

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, job }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Generate API error:', res.status, errText)
        setResult(`Error ${res.status}: ${errText || 'Failed to generate resume.'}`)
      } else {
        const data = await res.json()
        if (!data.output) {
          console.warn('No output from API:', data)
          setResult('No information found.')
        } else {
          setResult(data.output)
        }
      }
    } catch (err) {
      console.error('Generate API exception:', err)
      setResult('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gemini Resume Finder</h1>

      {/* Resume form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border px-4 py-2"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-full border px-4 py-2"
          placeholder="Job Title or Organization"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          required
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Generate Resume'}
        </button>
      </form>

      {/* Resume result */}
      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50 whitespace-pre-line">
          {result}
        </div>
      )}
    </main>
  )
}
