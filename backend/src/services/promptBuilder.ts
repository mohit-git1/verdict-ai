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
    ? `\n\nUse the following uploaded content as source material:\n${input.fileContent.substring(0, 3000)}`
    : ''

  return `You are an expert teacher creating a formal exam question paper.

Subject: ${input.subject || 'General Science'}
Total Questions: ${totalQuestions}
Total Marks: ${totalMarks}
Additional Instructions: ${input.additionalInstructions || 'None'}
${contextText}

Create a question paper with these sections:
${sectionDetails}

Difficulty distribution per section: 30% easy, 50% medium, 20% hard.

Return ONLY valid JSON. No markdown, no explanation, no code blocks. Just raw JSON:

{
  "paperTitle": "Question Paper",
  "subject": "${input.subject || 'General Science'}",
  "className": "Class 10",
  "timeAllowed": "3 Hours",
  "maximumMarks": ${totalMarks},
  "sections": [
    {
      "id": "A",
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks.",
      "questions": [
        {
          "id": 1,
          "text": "Question text here?",
          "type": "short",
          "difficulty": "easy",
          "marks": 2,
          "answer": "Detailed answer here"
        }
      ]
    }
  ]
}`
}
