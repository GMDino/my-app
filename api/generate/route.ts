// /app/api/generate/route.ts (Next.js 13+ App Router)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, job } = await req.json()

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

  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    }),
  })

  const data = await geminiRes.json()
  const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No information found.'
  return NextResponse.json({ output })
}
