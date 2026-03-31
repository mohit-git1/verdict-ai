import { IQuestionType } from '../models/Assignment'

interface PromptInput {
  subject: string
  dueDate: string
  questionTypes: IQuestionType[]
  additionalInstructions: string
  fileContent?: string
}

export function buildPrompt(input: PromptInput): string {
  const totalQuestions = input.questionTypes.reduce((sum, qt) => sum + qt.numQuestions, 0)
  const totalMarks = input.questionTypes.reduce((sum, qt) => sum + (qt.numQuestions * qt.marks), 0)

  const sectionDetails = input.questionTypes.map((qt, i) => {
    const sectionLabel = String.fromCharCode(65 + i)
    return `Section ${sectionLabel}: ${qt.numQuestions} x ${qt.type} questions, ${qt.marks} marks each`
  }).join('\n')

  const contextText = input.fileContent
    ? `\n\nUse the following Job Description context as source material:\n${input.fileContent.substring(0, 3000)}`
    : ''

  return `You are a technical hiring manager. Generate a complete assessment.

Role: ${input.subject}
Context: ${input.additionalInstructions || 'None'}
${contextText}

Sections to generate:
${sectionDetails}

Rules:
- MCQ: exactly 4 options labeled A B C D
- Coding: include input/output example
- All questions relevant to: ${input.subject}
- Mix: 30% easy, 50% medium, 20% hard
- Include answer for every question

Return ONLY this exact JSON, no extra text:
{
  "paperTitle": "Technical Assessment",
  "subject": "${input.subject}",
  "className": "Candidate Assessment",
  "timeAllowed": "90 Minutes",
  "maximumMarks": ${totalMarks},
  "sections": [
    {
      "id": "A",
      "title": "Section A",
      "instruction": "Answer all questions.",
      "questions": [
        {
          "id": "1",
          "text": "question here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 2,
          "options": ["A. option", "B. option", "C. option", "D. option"],
          "answer": "A. correct answer with brief explanation"
        }
      ]
    }
  ]
}`
}
