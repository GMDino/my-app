// File: /src/app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge' // Optional: Use 'nodejs' if Gemini API requires it

export async function POST(req: NextRequest) {
  try {
    const { name, job } = await req.json()

    if (!name || !job) {
      return NextResponse.json({ error: 'Missing name or job' }, { status: 400 })
    }

    const prompt = `
You are an AI that outputs professional bios and resumes. Given a name and job/org, generate a brief profile.

Name: ${name}
Job/Org: ${job}

Format:
- Full Name
- Professional Summary
- Notable Experience
- Education (if public)
- LinkedIn/public links (if found)
    `

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    })

    const data = await response.json()

    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No information found.'
    return NextResponse.json({ output })
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error', detail: String(err) }, { status: 500 })
  }
}
