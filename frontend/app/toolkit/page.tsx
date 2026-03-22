'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { useAssignmentStore } from '@/store/assignmentStore'
import { generateToolkitAI } from './actions'

const TOOLS = [
  { id: 'quiz', title: 'Quiz Generator', desc: 'Generate custom quizzes from any topic or document instantly', iBadge: 'bg-orange-100 text-orange-500', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />, action: 'Generate Quiz' },
  { id: 'lesson', title: 'Lesson Planner', desc: 'Create detailed lesson plans aligned with curriculum standards', iBadge: 'bg-purple-100 text-purple-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, action: 'Plan Lesson' },
  { id: 'grade', title: 'Grade Assistant', desc: 'Get AI suggestions for grading criteria and rubrics', iBadge: 'bg-green-100 text-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, action: 'Create Rubric' },
  { id: 'doubt', title: 'Doubt Solver', desc: 'Students can submit doubts, AI provides instant explanations', iBadge: 'bg-blue-100 text-blue-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />, action: 'Open Solver' },
  { id: 'summary', title: 'Summary Generator', desc: 'Convert long notes or chapters into concise summaries', iBadge: 'bg-yellow-100 text-yellow-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, action: 'Summarize' },
  { id: 'bank', title: 'Question Bank', desc: 'Build and organize a reusable bank of questions by topic', iBadge: 'bg-red-100 text-red-500', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />, action: 'Open Bank' }
]

export default function ToolkitPage() {
  const router = useRouter()
  const { assignments } = useAssignmentStore()
  const [activeTool, setActiveTool] = useState<any>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleToolBtn = (t: any) => {
    setActiveTool(t)
    setInputs({})
    setResult(null)
  }

  const generatePrompt = () => {
    if (activeTool.id === 'quiz') return `Create a quiz about ${inputs.topic || 'General Science'} with ${inputs.count || '5'} questions. Difficulty: ${inputs.diff || 'Medium'}.`
    if (activeTool.id === 'lesson') return `Create a detailed lesson plan for Grade ${inputs.grade || '10'}, Subject: ${inputs.subject || 'Math'}, Topic: ${inputs.topic || 'Algebra'}, Duration: ${inputs.duration || '60 mins'}.`
    if (activeTool.id === 'grade') return `Create a grading rubric for assignment type: ${inputs.type || 'Essay'}. Total Marks: ${inputs.marks || '100'}. Criteria: ${inputs.criteria || 'Standard'}.`
    if (activeTool.id === 'doubt') return `A student has a doubt: "${inputs.question || 'How does photosynthesis work?'}". Provide a clear, teacher-style explanation.`
    if (activeTool.id === 'summary') return `Summarize this text concisely: \n\n${inputs.text || 'Placeholder long text to summarize'}`
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTool.id === 'bank') return // Question bank is local
    
    setIsLoading(true)
    setResult(null)
    const prompt = generatePrompt()
    
    try {
      const response = await generateToolkitAI(prompt)
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      setResult(response.text)
    } catch (err: any) {
      setResult(`NVIDIA API Error Triggered: ${err.message}\n\nPlease verify NEXT_PUBLIC_NVIDIA_API_KEY is natively mounted in your frontend .env file correctly matching your backend access protocols.`)
    } finally {
      setIsLoading(false)
    }
  }

  const renderModalContent = () => {
    if (!activeTool) return null

    if (activeTool.id === 'bank') {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">View your previously assigned question papers locally filtered here.</p>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map(a => (
                <div 
                  key={a._id} 
                  onClick={() => router.push(`/assignments/${a._id}`)}
                  className="p-3 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-between hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col flex-1 min-w-0 pr-4">
                    <span className="font-semibold text-sm text-gray-900 truncate">{a.title}</span>
                    <span className="text-xs text-gray-500 truncate">{a.subject} • {a.status}</span>
                  </div>
                  <span className="text-[#E8431C] text-sm font-medium flex-shrink-0 group-hover:underline">View</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-sm text-gray-500">No saved questions in your bank yet!</span>
            </div>
          )}
        </div>
      )
    }

    if (activeTool.id === 'quiz') return (
      <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-gray-700 mb-1">Topic</label><input type="text" onChange={e=>setInputs({...inputs, topic: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:border-gray-400" placeholder="e.g. Thermodynamics" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Questions</label><select onChange={e=>setInputs({...inputs, count: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:border-gray-400 bg-white"><option>5</option><option>10</option><option>15</option><option>20</option></select></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Difficulty</label><select onChange={e=>setInputs({...inputs, diff: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:border-gray-400 bg-white"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
        </div>
      </div>
    )

    if (activeTool.id === 'lesson') return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label><input type="text" onChange={e=>setInputs({...inputs, subject: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none" placeholder="e.g. Biology" /></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Grade</label><input type="text" onChange={e=>setInputs({...inputs, grade: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none" placeholder="e.g. 10th" /></div>
        </div>
        <div><label className="block text-xs font-semibold text-gray-700 mb-1">Topic</label><input type="text" onChange={e=>setInputs({...inputs, topic: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none" placeholder="e.g. Cell Structure" /></div>
        <div><label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label><input type="text" onChange={e=>setInputs({...inputs, duration: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none" placeholder="e.g. 45 mins" /></div>
      </div>
    )

    if (activeTool.id === 'grade') return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Assignment Type</label><input type="text" onChange={e=>setInputs({...inputs, type: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none" placeholder="e.g. Research Paper" /></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Total Marks</label><input type="number" onChange={e=>setInputs({...inputs, marks: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none" placeholder="100" /></div>
        </div>
        <div><label className="block text-xs font-semibold text-gray-700 mb-1">Grading Criteria</label><input type="text" onChange={e=>setInputs({...inputs, criteria: e.target.value})} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none" placeholder="e.g. Grammar, Creativity..." /></div>
      </div>
    )

    if (activeTool.id === 'doubt') return (
      <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-gray-700 mb-1">Student's Doubt</label><textarea onChange={e=>setInputs({...inputs, question: e.target.value})} className="w-full text-sm p-3 border border-gray-200 rounded-lg outline-none resize-none h-24" placeholder="Paste the student's question here..." /></div>
      </div>
    )

    if (activeTool.id === 'summary') return (
      <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-gray-700 mb-1">Text content</label><textarea onChange={e=>setInputs({...inputs, text: e.target.value})} className="w-full text-sm p-3 border border-gray-200 rounded-lg outline-none resize-none h-32" placeholder="Paste long notes or chapter content..." /></div>
      </div>
    )

    return null
  }

  return (
    <AppShell title="Toolkit">
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[18px] font-semibold text-gray-900">AI Teacher's Toolkit</h1>
          </div>
          <p className="text-[14px] text-gray-500">Powerful AI tools to supercharge your teaching</p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TOOLS.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${t.iBadge}`}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">{t.icon}</svg>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900">{t.title}</h3>
                  <p className="text-[13px] text-gray-500 mt-1 leading-[1.5]">{t.desc}</p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex justify-end">
                <button 
                  onClick={() => handleToolBtn(t)} 
                  className="bg-[#111111] text-white rounded-full px-5 py-2 text-[13px] font-medium hover:bg-gray-800 transition-colors shadow-sm active:scale-95"
                >
                  {t.action}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Modal */}
        {activeTool && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[20px] w-full max-w-[500px] p-[24px] shadow-xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTool.iBadge}`}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">{activeTool.icon}</svg>
                  </div>
                  <h2 className="text-[18px] font-bold text-gray-900">{activeTool.title}</h2>
                </div>
                <button onClick={() => setActiveTool(null)} className="p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                   <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              {!result && !isLoading ? (
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1">
                  {renderModalContent()}
                  {activeTool.id !== 'bank' && (
                    <div className="flex gap-3 pt-6">
                      <button type="button" onClick={() => setActiveTool(null)} className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors">Cancel</button>
                      <button type="submit" className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-white bg-[#111111] hover:bg-gray-800 transition-colors">Generate</button>
                    </div>
                  )}
                </form>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-10 h-10 border-[3px] border-gray-100 border-t-[#E8431C] rounded-full animate-spin mb-4" />
                  <span className="text-sm font-medium text-gray-600">AI is processing...</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {result}
                  </div>
                  <div className="flex justify-end pt-6 mt-auto">
                    <button type="button" onClick={() => setActiveTool(null)} className="px-6 py-2.5 rounded-full text-sm font-medium text-white bg-[#111111] hover:bg-gray-800 transition-colors">Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
