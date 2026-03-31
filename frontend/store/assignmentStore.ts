import { create } from 'zustand'
import { Assessment, Result } from '@/lib/api'

interface AssessmentStore {
  assignments: Assessment[]
  currentAssessment: Assessment | null
  currentResult: Result | null
  isLoading: boolean
  isGenerating: boolean
  error: string | null
  progressMessage: string

  setAssessments: (a: Assessment[]) => void
  addAssessment: (a: Assessment) => void
  updateAssessmentStatus: (id: string, status: Assessment['status']) => void
  removeAssessment: (id: string) => void
  setCurrentAssessment: (a: Assessment | null) => void
  setCurrentResult: (r: Result | null) => void
  setLoading: (v: boolean) => void
  setGenerating: (v: boolean) => void
  setError: (e: string | null) => void
  setProgressMessage: (msg: string) => void
}

import { persist } from 'zustand/middleware'

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set) => ({
      assignments: [],
      currentAssessment: null,
      currentResult: null,
      isLoading: false,
      isGenerating: false,
      error: null,
      progressMessage: 'Starting generation...',

      setAssessments: (assignments) => set({ assignments }),
      addAssessment: (assignment) =>
        set((state) => ({ assignments: [assignment, ...state.assignments] })),
      updateAssessmentStatus: (id, status) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a._id === id ? { ...a, status } : a
          ),
          currentAssessment:
            state.currentAssessment?._id === id
              ? { ...state.currentAssessment, status }
              : state.currentAssessment,
        })),
      removeAssessment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a._id !== id),
        })),
      setCurrentAssessment: (currentAssessment) => set({ currentAssessment }),
      setCurrentResult: (currentResult) => set({ currentResult }),
      setLoading: (isLoading) => set({ isLoading }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
      setProgressMessage: (progressMessage) => set({ progressMessage }),
    }),
    {
      name: 'veda-assignment-store',
      partialize: (state) => ({ assignments: state.assignments }),
    }
  )
)