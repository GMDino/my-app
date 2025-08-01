import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, job } = await req.json()

    if (!name || !job) {
      return NextResponse.json({ output: null, error: 'Missing fields' }, { status: 400 })
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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    const data = await geminiRes.json()
    console.log('Gemini API response:', JSON.stringify(data, null, 2))

    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || null

    if (!output) {
      console.error('Gemini returned no valid output:', JSON.stringify(data, null, 2))
    }

    return NextResponse.json({ output })
  } catch (err) {
    console.error('Error in /api/generate route:', err)
    return NextResponse.json({ output: null }, { status: 500 })
  }
}
