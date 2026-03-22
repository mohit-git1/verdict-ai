import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 120000, // 2 minutes — handles Render cold start
})

export interface QuestionType {
  type: string
  numQuestions: number
  marks: number
}

export interface Assignment {
  _id: string
  title: string
  subject: string
  dueDate: string
  questionTypes: QuestionType[]
  additionalInstructions: string
  fileName?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

export interface Question {
  id: number
  text: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  answer?: string
}

export interface Section {
  id: string
  title: string
  instruction: string
  questions: Question[]
}

export interface Result {
  _id: string
  assignmentId: string
  paperTitle: string
  schoolName: string
  subject: string
  className: string
  timeAllowed: string
  maximumMarks: number
  sections: Section[]
}

export const assignmentsApi = {
  getAll: () =>
    api.get<{ success: boolean; data: Assignment[] }>('/assignments'),

  getOne: (id: string) =>
    api.get<{ success: boolean; data: { assignment: Assignment; result: Result | null } }>(`/assignments/${id}`),

  create: (formData: FormData) =>
    api.post<{ success: boolean; data: Assignment }>('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => api.delete(`/assignments/${id}`),

  regenerate: (id: string) => api.post(`/assignments/${id}/regenerate`),
}