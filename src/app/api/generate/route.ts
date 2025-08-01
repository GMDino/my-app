import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { name, job } = body;

    if (!name || !job) {
      return NextResponse.json({ error: 'Missing name or job' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are a search engine similar to google, but for presenting professional and educational resumes of people. Find and create a list of the professional and educational background of ${name}, who currently has a job at ${job}. These facts should be grounded in publicly available Google Search insights and results and so they are public information. Compile into a list, make it concise and easy to read. Ensure dates are accurate too. Do not bold or style any of the text except you can use a bulleted or numbered list.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    });

    const response = result.response;
    const text = response.text();

    return NextResponse.json({ output: text });
  } catch (error: unknown) {
    console.error('Error in /api/generate route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
