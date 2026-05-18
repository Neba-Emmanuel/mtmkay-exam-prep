export interface GeneratedPractical {
  title: string
  description: string
  objective: string
  apparatus: string
  safety: string
  steps: Array<{
    order: number
    instruction: string
    observation: string | null
    calculation: string | null
    commonMistakes: string | null
  }>
}

const GEMINI_URLS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateText',
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateText',
  'https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText',
  'https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText',
]

async function callGeminiText(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured')
  }

  for (const url of GEMINI_URLS) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.2,
        maxOutputTokens: 1024,
      }),
    })

    const json = await response.json().catch(() => null)
    if (response.ok) {
      const output = json?.candidates?.[0]?.output
      if (typeof output === 'string' && output.trim().length > 0) {
        return output.trim()
      }
      throw new Error('No text output in API response')
    }

    const message = json?.error?.message ?? `API returned ${response.status}`
    const isMissingModel = response.status === 404 || /not found/i.test(message)
    if (isMissingModel) {
      continue
    }

    throw new Error(message)
  }

  throw new Error('No supported Gemini model available in this environment')
}

export async function generatePractical(
  subject: string,
  topic: string
): Promise<GeneratedPractical> {
  const prompt = `You are an expert science educator. Generate a detailed laboratory practical for secondary school students.

Subject: ${subject}
Topic: ${topic}

Respond with ONLY valid JSON (no markdown, no backticks, no extra text). Use this exact structure:
{
  "title": "Name of the practical",
  "description": "Brief overview of what this practical covers",
  "objective": "What students will learn or achieve",
  "apparatus": "Newline-separated list of materials and equipment needed",
  "safety": "Newline-separated list of safety precautions",
  "steps": [
    {
      "order": 1,
      "instruction": "What to do in this step",
      "observation": "What to observe or measure (or null)",
      "calculation": "Any calculations needed (or null)",
      "commonMistakes": "Common errors students make (or null)"
    }
  ]
}

Make the steps clear and appropriate for secondary school level. Include 4-6 steps total.`

  try {
    const text = await callGeminiText(prompt)

    let jsonText = text
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7)
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3)
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3)
    }

    const parsed: GeneratedPractical = JSON.parse(jsonText.trim())
    return parsed
  } catch (error) {
    throw new Error(
      `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function generateExplanation(
  questionText: string,
  correctOptionText: string
): Promise<string> {
  const prompt = `You are an expert educator explaining science questions to secondary school students.

Question: ${questionText}

Correct Answer: ${correctOptionText}

Provide a brief, clear explanation (2-3 sentences maximum) of why this is the correct answer, suitable for a GCE or BEPC student. Be direct and educational.`

  try {
    return await callGeminiText(prompt)
  } catch (error) {
    throw new Error(
      `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export function generateLabImage(title: string, subject: string): string {
  const prompt = `${title} ${subject} laboratory experiment setup diagram, clean educational scientific illustration, labeled equipment, white background, no people`
  const encodedPrompt = encodeURIComponent(prompt)
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true`
}
