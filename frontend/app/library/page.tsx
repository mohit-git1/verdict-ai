'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { useAssessmentStore } from '@/store/assignmentStore'

const TABS = ['All', 'Assessments', 'Templates', 'Saved']

const TEMPLATES = [
  { id: 't1', title: 'Full Stack Engineer Assessment', questions: 30, marks: 80 },
  { id: 't2', title: 'Frontend Developer Assessment', questions: 25, marks: 60 },
  { id: 't3', title: 'Backend Engineer Assessment', questions: 28, marks: 75 },
  { id: 't4', title: 'Data Scientist Assessment', questions: 20, marks: 70 },
]

export default function LibraryPage() {
  const router = useRouter()
  const { assignments, removeAssessment } = useAssessmentStore()
  const [activeTab, setActiveTab] = useState('All')

  const completedPapers = assignments.filter(a => a.status === 'completed' || a.status === 'pending') // assuming pending/processing also valid or just all

  const renderContent = () => {
    if (activeTab === 'Saved') {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No saved items yet</h2>
          <p className="text-sm text-gray-500 mb-6">Bookmark templates or papers to easily find them later</p>
          <button onClick={() => router.push('/assignments')} className="bg-[#111111] text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm active:scale-95">Browse Assessments</button>
        </div>
      )
    }

    const showPapers = activeTab === 'All' || activeTab === 'Assessments'
    const showTemplates = activeTab === 'All' || activeTab === 'Templates'

    return (
      <div className="space-y-12">
        {showPapers && (
          <div>
            {(activeTab === 'All') && <h2 className="text-[16px] font-bold text-gray-900 mb-4">Assessments</h2>}
            {completedPapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {completedPapers.map(p => (
                  <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zM15 12h.008v.008H15V12zm-3 0h.008v.008H12V12z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-[16px] font-semibold text-gray-900 truncate">{p.title}</h3>
                        <p className="text-[13px] text-gray-500 mt-1">{p.subject} • {new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => removeAssessment(p._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                      <button onClick={() => router.push(`/assignments/${p._id}`)} className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors">View Paper</button>
                      <button onClick={() => window.print()} className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-white bg-[#111111] hover:bg-gray-800 transition-colors">Download PDF</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 mb-6 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <h2 className="text-[18px] font-bold text-gray-900 mb-2">No papers yet</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">Create your first assignment to successfully map templates automatically.</p>
                <button onClick={() => router.push('/assignments/create')} className="bg-[#111111] text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm active:scale-95">Create Assessment</button>
              </div>
            )}
          </div>
        )}

        {showTemplates && (
          <div>
            <h2 className="text-[16px] font-bold text-gray-900 mb-4 pt-4">Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {TEMPLATES.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-gray-900 truncate">{t.title}</h3>
                      <p className="text-[13px] font-medium text-gray-500 mt-1">{t.questions} questions • {t.marks} marks</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-50">
                    <button onClick={() => router.push('/assignments/create')} className="w-full px-4 py-2.5 rounded-full text-[13px] font-semibold text-white bg-[#111111] hover:bg-gray-800 transition-colors">Use Template</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <AppShell title="Assessment Library">
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[18px] font-semibold text-gray-900">Assessment Library</h1>
            </div>
            <p className="text-[14px] text-gray-500">Your saved assessments, templates and resources</p>
          </div>
          <div className="relative w-full md:w-auto">
            <input type="text" placeholder="Search templates..." className="w-full md:w-64 pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm bg-white focus:outline-none focus:border-gray-400 transition-colors" />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar hide-scrollbar">
          {TABS.map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${activeTab === t ? 'bg-[#111111] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="animate-in fade-in duration-300">
          {renderContent()}
        </div>

      </div>
    </AppShell>
  )
}
