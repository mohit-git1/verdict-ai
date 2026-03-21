'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { useAssignmentStore } from '@/store/assignmentStore'
import { assignmentsApi, Assignment, Result } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useUserStore } from '@/store/userStore'

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const d = difficulty.toLowerCase()
  let colorClass = 'bg-[#F3F4F6] text-[#6B7280]' // default

  if (d.includes('easy')) {
    colorClass = 'bg-[#DCFCE7] text-[#15803D]'
  } else if (d.includes('medium') || d.includes('moderate')) {
    colorClass = 'bg-[#FEF3C7] text-[#D97706]'
  } else if (d.includes('hard') || d.includes('challenge') || d.includes('challenging')) {
    colorClass = 'bg-[#FEE2E2] text-[#DC2626]'
  }

  return (
    <span className={`text-[10px] font-semibold px-[8px] py-[2px] rounded-full uppercase tracking-wide ${colorClass}`}>
      {difficulty}
    </span>
  )
}

export default function AssignmentOutputPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { currentAssignment, currentResult, setCurrentAssignment, setCurrentResult, isGenerating, setGenerating } = useAssignmentStore()
  const { name } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const paperRef = useRef<HTMLDivElement>(null)

  useWebSocket(id)

  const fetchData = async () => {
    try {
      const res = await assignmentsApi.getOne(id)
      setCurrentAssignment(res.data.data.assignment)
      setCurrentResult(res.data.data.result)
      if (['pending', 'processing'].includes(res.data.data.assignment.status)) {
        setGenerating(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  // Poll when generating
  useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [isGenerating])

  // Listen for WS complete
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.assignmentId === id) fetchData()
    }
    window.addEventListener('generation:complete', handler as any)
    return () => window.removeEventListener('generation:complete', handler as any)
  }, [id])

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      await assignmentsApi.regenerate(id)
      setCurrentResult(null)
      setGenerating(true)
    } catch (err) {
      console.error(err)
    } finally {
      setRegenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <AppShell showBack title="Create New">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#111111] rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showBack title="Create New" mobileTitle="Assignments">
      <div className="max-w-[720px] mx-auto pb-[80px]">

        {/* AI Message Bubble */}
        <div className="bg-[#262626] rounded-[24px] border border-[#333333] p-[24px] mb-[32px] flex flex-col items-start gap-[20px]">
          <div className="flex-1 w-full">
            {isGenerating ? (
              <div className="flex items-center gap-[12px]">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-[6px] h-[6px] bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-[15px] font-medium text-white pb-[20px]">Generating your question paper...</p>
              </div>
            ) : currentResult ? (
              <>
                <p className="text-[16px] text-white leading-[1.6] mb-[20px] font-medium tracking-tight">
                  Certainly, {name ? name.split(' ')[0] : 'Lakshya'}! Here are customized Question Paper for your CBSE {currentResult.className || 'Grade 8'} {currentResult.subject || 'Science'} classes on the NCERT chapters:
                </p>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-[8px] h-[44px] px-[24px] rounded-full text-[14px] font-bold text-[#111111] transition-all bg-white hover:bg-gray-100 active:scale-95 shadow-sm"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5h.01M9 20.25H9.01M6.75 18.375H6.76M11.25 18.375H11.26" />
                  </svg>
                  Download as PDF
                </button>
              </>
            ) : (
              <p className="text-[15px] pb-[20px] font-medium text-white">
                {currentAssignment?.status === 'failed'
                  ? 'Generation failed. Please try regenerating.'
                  : 'Starting generation...'}
              </p>
            )}
          </div>
        </div>

        {/* Question Paper */}
        {currentResult && (
          <div ref={paperRef} id="printable-assignment" className="bg-white rounded-[16px] border border-[#F0F0F0] p-[16px] md:p-[32px] md:px-[40px] print:shadow-none print:border-none print:rounded-none">
            {/* School Header */}
            <div className="text-center mb-[16px] pb-[16px] border-b border-[#E5E7EB]">
              <h1 className="text-[15px] md:text-[17px] font-bold text-[#111111]">{currentResult.schoolName}</h1>
              <p className="text-[14px] text-[#374151] mt-1">Subject: {currentResult.subject}</p>
              <p className="text-[14px] text-[#374151]">Class: {currentResult.className}</p>
            </div>

            {/* Meta row */}
            <div className="flex justify-between items-center text-[13px] text-[#374151] mb-[16px]">
              <span>Time Allowed: {currentResult.timeAllowed}</span>
              <span>Maximum Marks: {currentResult.maximumMarks}</span>
            </div>

            <p className="text-[12px] text-[#6B7280] italic mb-[24px]">All questions are compulsory unless stated otherwise.</p>

            {/* Student Info */}
            <div className="mb-[24px] space-y-[12px]">
              <div className="flex items-end gap-[8px] text-[13px] text-[#374151]">
                <span className="flex-shrink-0 leading-none">Name:</span>
                <div className="flex-1 border-b border-[#9CA3AF]" />
              </div>
              <div className="flex items-end gap-[8px] text-[13px] text-[#374151]">
                <span className="flex-shrink-0 leading-none">Roll Number:</span>
                <div className="flex-1 border-b border-[#9CA3AF]" />
              </div>
              <div className="flex items-end gap-[8px] text-[13px] text-[#374151]">
                <span className="flex-shrink-0 leading-none">Class: {currentResult.className} Section:</span>
                <div className="flex-1 border-b border-[#9CA3AF]" />
              </div>
            </div>

            {/* Sections */}
            {currentResult.sections.map((section) => (
              <div key={section.id} className="mb-[32px]">
                <h2 className="text-center font-bold text-[#111111] text-[15px] mt-[24px] mb-[4px]">{section.title}</h2>
                <div className="text-center mb-[16px]">
                  <span className="text-[12px] text-[#6B7280] italic">
                    <span className="font-bold">{section.instruction.split('—')[0] || ''}</span>
                    {section.instruction.includes('—') ? ' — ' + section.instruction.split('—').slice(1).join('—') : section.instruction}
                  </span>
                </div>

                <div className="flex flex-col gap-[12px]">
                  {section.questions.map((q, qi) => (
                    <div key={q.id} className="flex gap-[8px]">
                      <span className="text-[13px] font-medium text-[#374151] flex-shrink-0 w-[24px]">{qi + 1}.</span>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[8px]">
                          <p className="text-[13px] text-[#374151] leading-[1.6] flex-1 whitespace-pre-wrap">{q.text}</p>
                          <div className="flex items-center gap-[8px] flex-shrink-0">
                            <DifficultyBadge difficulty={q.difficulty} />
                            <span className="text-[11px] text-[#6B7280] whitespace-nowrap">[{q.marks} Marks]</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-[32px] pt-[16px] border-t border-[#E5E7EB]">
              <p className="text-center text-[13px] font-semibold text-[#111111]">
                End of Question Paper
              </p>
            </div>

            {/* Answer Key */}
            {currentResult.sections.some((s) => s.questions.some((q) => q.answer)) && (
              <div className="mt-[32px] pt-[24px] border-t border-[#E5E7EB]">
                <h2 className="text-[14px] font-bold text-[#111111] mb-[16px]">Answer Key</h2>
                {currentResult.sections.map((section) => (
                  <div key={section.id} className="mb-[24px]">
                    <h3 className="text-[13px] font-semibold text-[#111111] mb-[8px]">{section.title}</h3>
                    <div className="flex flex-col gap-[12px]">
                      {section.questions.filter((q) => q.answer).map((q, qi) => (
                        <div key={q.id} className="flex gap-[8px]">
                          <span className="text-[13px] font-medium text-[#374151] flex-shrink-0 w-[24px]">{qi + 1}.</span>
                          <p className="text-[13px] text-[#374151] leading-[1.7] flex-1 whitespace-pre-wrap">{q.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generating skeleton */}
        {isGenerating && !currentResult && (
          <div className="bg-white rounded-[16px] border border-[#F0F0F0] p-[32px] animate-pulse">
            <div className="h-5 bg-[#F3F4F6] rounded w-64 mx-auto mb-2" />
            <div className="h-4 bg-[#F3F4F6] rounded w-40 mx-auto mb-6" />
            <div className="space-y-[12px]">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3 bg-[#F3F4F6] rounded" style={{ width: `${85 - i * 5}%` }} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Regenerate Action Bar */}
      {currentResult && (
        <div className="fixed bottom-[80px] md:bottom-8 right-6 md:right-12 z-20">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center justify-center gap-[6px] px-[20px] h-[36px] bg-white border border-[#E5E7EB] rounded-full text-[13px] font-medium text-[#374151] shadow-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-60"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-assignment, #printable-assignment * { visibility: visible; }
          #printable-assignment { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </AppShell>
  )
}