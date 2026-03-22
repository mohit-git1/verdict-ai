'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { useAssignmentStore } from '@/store/assignmentStore'
import { assignmentsApi, Assignment } from '@/lib/api'
import { format } from 'date-fns'

export default function AssignmentsPage() {
  const router = useRouter()
  const { assignments, setAssignments, removeAssignment } = useAssignmentStore()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    assignmentsApi.getAll()
      .then((res) => setAssignments(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await assignmentsApi.delete(id)
      removeAssignment(id)
    } catch (err) {
      console.error(err)
    }
    setOpenMenu(null)
  }

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd-MM-yyyy') } catch { return d }
  }

  const StatusBadge = ({ status }: { status: Assignment['status'] }) => {
    const map = {
      pending: { 
        label: 'Pending', 
        bg: '#FEF3C7', 
        color: '#D97706',
        dot: '#F59E0B'
      },
      processing: { 
        label: 'Generating...', 
        bg: '#DBEAFE', 
        color: '#2563EB',
        dot: '#3B82F6'
      },
      completed: { 
        label: 'Ready', 
        bg: '#DCFCE7', 
        color: '#16A34A',
        dot: '#22C55E'
      },
      failed: { 
        label: 'Failed', 
        bg: '#FEE2E2', 
        color: '#DC2626',
        dot: '#EF4444'
      },
    }
    const s = map[status]
    return (
      <span 
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
        style={{ background: s.bg, color: s.color }}
      >
        <span 
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: s.dot }}
        />
        {s.label}
      </span>
    )
  }

  if (loading) {
    return (
      <AppShell title="Assignment">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Assignment">
      {assignments.length === 0 ? (
        /* ── EMPTY STATE ── */
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] text-center px-4">
          {/* Illustration */}
          <div className="flex justify-center w-full mb-6">
            <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background Circle */}
              <circle cx="110" cy="100" r="85" fill="#EAEBEF" />
              
              {/* Squiggle */}
              <path d="M50 115 C75 105, 80 85, 65 75 C50 65, 35 80, 50 100 C70 120, 95 85, 115 65" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              
              {/* Blue Sparkle */}
              <path d="M65 145 Q75 145 75 135 Q75 145 85 145 Q75 145 75 155 Q75 145 65 145 Z" stroke="#4A72B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              
              {/* Blue Dot */}
              <circle cx="165" cy="120" r="4.5" fill="#4B77BE" />
              
              {/* Main Document */}
              <rect x="85" y="45" width="75" height="95" rx="10" fill="white" />
              <rect x="95" y="60" width="35" height="10" rx="4" fill="#111827" />
              <rect x="95" y="78" width="45" height="8" rx="4" fill="#E5E7EB" />
              <rect x="95" y="93" width="45" height="8" rx="4" fill="#E5E7EB" />
              {/* Third body line has a gap for magnifying glass, but it overlaps */}
              <rect x="95" y="108" width="45" height="8" rx="4" fill="#E5E7EB" />
              <rect x="95" y="123" width="30" height="8" rx="4" fill="#E5E7EB" />

              {/* Floating Tag Top Right */}
              <rect x="145" y="40" width="42" height="20" rx="6" fill="white" />
              <circle cx="155" cy="50" r="4.5" fill="#C4B5FD" />
              <rect x="165" y="46" width="15" height="8" rx="4" fill="#D1D5DB" />

              {/* Magnifying Glass */}
              {/* Handle */}
              <path d="M140 120 L168 148" stroke="#DEDEE6" strokeWidth="16" strokeLinecap="round" />
              <path d="M162 142 L168 148" stroke="#F1F1F5" strokeWidth="16" strokeLinecap="round" /> {/* Highlight on tip */}

              {/* Glass Frame */}
              <circle cx="125" cy="108" r="34" fill="rgba(255,255,255,0.7)" stroke="#CDCDD6" strokeWidth="8" />

              {/* Red X */}
              <path d="M110 93 L140 123 M140 93 L110 123" stroke="#FF4D4D" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="text-[24px] font-bold text-[#111111] mb-[12px]">No assignments yet</h2>
          <p className="text-[16px] text-[#6B7280] max-w-[420px] leading-[1.6] text-center mx-auto mb-10 font-medium">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>
          <button
            onClick={() => router.push('/assignments/create')}
            className="flex items-center justify-center gap-2 px-[28px] py-[14px] rounded-[24px] text-white text-[16px] font-semibold transition-all hover:bg-[#27272A] active:scale-95"
            style={{ 
              background: '#18181B', 
              border: '3px solid #3F3F46',
            }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Your First Assignment
          </button>
        </div>
      ) : (
        /* ── FILLED STATE ── */
        <div className="pb-24">
          {/* Header */}
          <div className="mb-[24px]">
            <div className="flex items-center gap-[8px] mb-1">
              <div className="w-[8px] h-[8px] rounded-full bg-[#22C55E]"></div>
              <h1 className="text-[18px] font-semibold text-[#111111]">Assignments</h1>
            </div>
            <p className="text-[13px] text-[#6B7280] ml-[16px]">Manage and create assignments for your classes.</p>
          </div>

          {/* Filter + Search */}
          <div className="flex items-center gap-[12px] mb-[24px]">
            <button className="flex items-center gap-2 px-[12px] h-[38px] bg-white border border-[#E5E7EB] rounded-lg text-[14px] text-[#374151] hover:bg-[#F9FAFB] transition-colors whitespace-nowrap">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              Filter By
            </button>
            <div className="flex-1 relative">
              <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search Assignment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-[36px] pr-[12px] h-[38px] bg-white border border-[#E5E7EB] rounded-lg text-[14px] text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] transition-colors"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {filtered.map((assignment) => (
              <div 
                key={assignment._id} 
                onClick={() => router.push(`/assignments/${assignment._id}`)}
                className="bg-white rounded-2xl border border-gray-200 p-5 relative cursor-pointer hover:border-gray-300 transition-colors"
                style={{ 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                  minHeight: '120px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-gray-900 text-[15px] leading-tight mb-1.5 truncate">{assignment.title}</h3>
                    <StatusBadge status={assignment.status} />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === assignment._id ? null : assignment._id)}
                      className="p-1 hover:bg-[#F9FAFB] rounded-lg transition-colors text-[#9CA3AF] hover:text-[#374151]"
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {openMenu === assignment._id && (
                      <div className="absolute right-0 top-8 bg-white border border-[#F0F0F0] rounded-[12px] shadow-md z-50 py-1.5 w-44">
                        <button
                          onClick={() => { router.push(`/assignments/${assignment._id}`); setOpenMenu(null) }}
                          className="w-full text-left px-4 py-2 text-[14px] text-[#374151] hover:bg-[#F9FAFB]"
                        >
                          View Assignment
                        </button>
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="w-full text-left px-4 py-2 text-[14px] text-[#EF4444] hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-gray-100">
                  <span className="text-gray-500">
                    <span className="font-semibold text-gray-700">Assigned on</span> : {formatDate(assignment.createdAt)}
                  </span>
                  <span className="text-gray-500">
                    <span className="font-semibold text-gray-700">Due</span> : {formatDate(assignment.dueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Overlay Button */}
          <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => router.push('/assignments/create')}
              className="flex items-center gap-2 px-7 py-3.5 text-white text-sm font-medium transition-all active:scale-95"
              style={{ 
                background: '#111111', 
                borderRadius: '999px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Assignment
            </button>
          </div>

        </div>
      )}



      {/* Close menu on outside click */}
      {openMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
      )}

      {/* Global Mobile FAB */}
      <div className="fixed bottom-24 right-4 z-20 md:hidden">
        <button
          onClick={() => router.push('/assignments/create')}
          className="w-13 h-13 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
          style={{
            width: '52px',
            height: '52px',
            background: 'white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}
        >
          <svg width="22" height="22" fill="none" stroke="#E8431C" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
    </AppShell>
  )
}