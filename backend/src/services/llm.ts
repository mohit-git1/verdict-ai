import OpenAI from 'openai'
import { z } from 'zod'

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
})

const QuestionSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  text: z.string(),
  type: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.union([z.string(), z.number()]).transform(val => Number(val)),
  answer: z.string().optional()
})

const SectionSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  title: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema)
})

const PaperSchema = z.object({
  paperTitle: z.string(),
  subject: z.string(),
  className: z.string(),
  timeAllowed: z.string(),
  maximumMarks: z.union([z.string(), z.number()]).transform(val => Number(val)),
  sections: z.array(SectionSchema)
})

export type GeneratedPaper = z.infer<typeof PaperSchema>

export async function generateQuestionPaper(prompt: string): Promise<GeneratedPaper> {
  console.log('🤖 Calling NVIDIA LLM...')

  const completion = await client.chat.completions.create({
    model: 'meta/llama-3.1-8b-instruct',
    messages: [
      {
        role: 'system',
        content: 'You are an expert teacher. Always respond with valid JSON only. No markdown, no explanation, no code blocks.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4000
  })

  const rawText = completion.choices[0]?.message?.content || ''
  console.log('🤖 Raw LLM response received, parsing...')

  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  let parsed: any
  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    console.error('❌ JSON parse failed:', cleaned.substring(0, 200))
    throw new Error('LLM returned invalid JSON')
  }

  const result = PaperSchema.safeParse(parsed)
  if (!result.success) {
    console.error('❌ Zod validation failed:', result.error.flatten())
console.error('❌ Raw parsed response:', JSON.stringify(parsed, null, 2))
    throw new Error('LLM response did not match expected schema')
  }

  console.log('✅ LLM response validated successfully')
  return result.data
}