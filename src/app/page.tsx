'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [name, setName] = useState('')
  const [job, setJob] = useState('')
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [totalSignups, setTotalSignups] = useState<number | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, job }),
    })
    const data = await res.json()
    setResult(data.output)
    setLoading(false)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailSubmitted(false)

    if (!email) return

    // Check for existing email
    const { data: existing, error: findError } = await supabase
      .from('email_signups')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      setEmailError('This email is already signed up.')
      return
    }

    const { error: insertError } = await supabase
      .from('email_signups')
      .insert({ email })

    if (!insertError) {
      setEmail('')
      setEmailSubmitted(true)
      fetchSignupCount() // update total count after signup
    } else {
      setEmailError('Something went wrong. Try again later.')
      console.error(insertError)
    }
  }

  const fetchSignupCount = async () => {
    const { count, error } = await supabase
      .from('email_signups')
      .select('*', { count: 'exact', head: true })

    if (!error && typeof count === 'number') {
      setTotalSignups(count)
    }
  }

  useEffect(() => {
    fetchSignupCount()
  }, [])

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
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          {loading ? 'Searching...' : 'Generate Resume'}
        </button>
      </form>

      {/* Resume result */}
      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50 whitespace-pre-line">{result}</div>
      )}

      {/* Email Signup */}
      <form onSubmit={handleEmailSubmit} className="mt-10 space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Optional: Sign up with your email
        </label>
        <input
          type="email"
          className="w-full border px-4 py-2"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-gray-800 text-white px-4 py-2 rounded" type="submit">
          Submit Email
        </button>

        {emailSubmitted && (
          <p className="text-green-600 text-sm mt-1">Thanks! You're on the list.</p>
        )}
        {emailError && (
          <p className="text-red-600 text-sm mt-1">{emailError}</p>
        )}
      </form>

      {/* Total signups */}
      {totalSignups !== null && (
        <p className="text-sm text-gray-600 mt-4">
          Total signups so far: <strong>{totalSignups}</strong>
        </p>
      )}
    </main>
  )
}
