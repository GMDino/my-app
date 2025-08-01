// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const { name, job } = await req.json()

    if (!name || !job) {
      return NextResponse.json({ output: null, error: 'Missing fields' }, { status: 400 })
    }

    const prompt = `
You are an AI that outputs professional bios and resumes. Given a name and job/org, generate a brief profile that is in a list format. Include all educational background and previous and current positions. Ensure accurate dates are included too. 

Name: ${name}
Job/Organization: ${job}

Bio:
`

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        maxOutputTokens: 2048
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        }
      ]
    })

    const text = await result.response.text()

    return NextResponse.json({ output: text })
  } catch (err: any) {
    console.error('Error in /api/generate route:', err)

    if (err.status === 429 || err?.response?.status === 429) {
      return NextResponse.json(
        {
          output: null,
          error: 'You’ve hit the API rate limit. Please wait and try again later.'
        },
        { status: 429 }
      )
    }

    return NextResponse.json({ output: null, error: 'Internal server error' }, { status: 500 })
  }
}
