import api from '@/lib/api'

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
    imageUrl?: string | null
  }>
}

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent'

async function callGemini(prompt: string, maxToken = 2048): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured')

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: maxToken,
      },
    //   thinkingConfig: {
    //     thinkingBudget: 0,
    //   },
    }),
  })

  const json = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(json?.error?.message ?? `API returned ${response.status}`)
  }

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text === 'string' && text.trim().length > 0) return text.trim()

  throw new Error('No text in Gemini response')
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

  const text = await callGemini(prompt, 4096)

  const jsonText = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  try {
    return JSON.parse(jsonText) as GeneratedPractical
  } catch {
    if (jsonText.length > 0 && !jsonText.endsWith('}')) {
      throw new Error('Response was cut off — please try again')
    }
    throw new Error('AI returned invalid JSON — try again')
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

  return callGemini(prompt, 512)
}

export async function generateLabImage(
  title: string,
  subject: string,
  stepInstruction?: string
): Promise<string> {
  const response = await api.post('/admin/practicals/generate-image', {
    title,
    subject,
    stepInstruction,
  })

  const imageUrl = response.data?.imageUrl
  if (typeof imageUrl !== 'string' || !imageUrl.startsWith('data:image/')) {
    throw new Error('Image generation returned an invalid image')
  }

  return imageUrl
}
