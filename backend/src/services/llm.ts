import OpenAI from 'openai'
import { z } from 'zod'

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
})

const QuestionSchema = z.object({
  id: z.union([z.string(), z.number(), z.null()]).transform(val => String(val ?? '')),
  text: z.string(),
  type: z.string().default('general'),
  difficulty: z.string().transform(val => {
    const d = val.toLowerCase()
    if (d.includes('easy')) return 'easy'
    if (d.includes('hard') || d.includes('challeng')) return 'hard'
    return 'medium'
  }).pipe(z.enum(['easy', 'medium', 'hard'])),
  marks: z.union([z.string(), z.number()]).transform(val => Number(val)),
  answer: z.union([z.string(), z.null(), z.undefined()]).optional().transform(val => val ?? undefined)
})

const SectionSchema = z.object({
  id: z.union([z.string(), z.number(), z.null()]).transform(val => String(val ?? '')),
  title: z.string(),
  instruction: z.string().default('Attempt all questions'),
  questions: z.array(QuestionSchema)
})

const PaperSchema = z.object({
  paperTitle: z.string().default('Question Paper'),
  subject: z.string().default('General'),
  className: z.string().default('Class 10'),
  timeAllowed: z.string().default('3 Hours'),
  maximumMarks: z.union([z.string(), z.number()]).transform(val => Number(val)),
  sections: z.array(SectionSchema)
})

export type GeneratedPaper = z.infer<typeof PaperSchema>

export async function generateQuestionPaper(prompt: string): Promise<GeneratedPaper> {
  const maxRetries = 3

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🤖 Calling NVIDIA LLM... (attempt ${attempt}/${maxRetries})`)

    try {
      const completion = await client.chat.completions.create({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are an expert teacher. You MUST respond with valid JSON only.
No markdown, no code blocks, no explanation. Just raw JSON.
All id fields must be strings like "1", "2", "A", "B".
All marks fields must be numbers like 2, 5, 10.
difficulty must be exactly one of: "easy", "medium", "hard" (lowercase).`
          },
          {
            role: 'user',
            content: attempt === 1
              ? prompt
              : `${prompt}\n\nCRITICAL: Return ONLY valid JSON. No text before or after. Start with { and end with }.`
          }
        ],
        temperature: attempt === 1 ? 0.7 : 0.3,
        max_tokens: 4000
      })

      const rawText = completion.choices[0]?.message?.content || ''
      console.log('🤖 Raw LLM response received, parsing...')

      let cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleaned = jsonMatch[0]
      }

      let parsed: any
      try {
        parsed = JSON.parse(cleaned)
      } catch (err) {
        console.error(`❌ JSON parse failed on attempt ${attempt}:`, cleaned.substring(0, 200))
        if (attempt === maxRetries) throw new Error('LLM returned invalid JSON after all retries')
        continue
      }

      const result = PaperSchema.safeParse(parsed)
      if (!result.success) {
        console.error(`❌ Zod validation failed on attempt ${attempt}:`, result.error.flatten())
        if (attempt === maxRetries) throw new Error('LLM response did not match expected schema after all retries')
        continue
      }

      console.log('✅ LLM response validated successfully')
      return result.data

    } catch (err: any) {
      if (attempt === maxRetries) throw err
      console.log(`⚠️ Attempt ${attempt} failed, retrying...`)
    }
  }

  throw new Error('Failed to generate question paper after all retries')
}