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
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
      processing: { label: 'Generating...', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Ready', color: 'bg-green-100 text-green-700' },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
    }
    const s = map[status]
    return (
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s.color}`}>
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
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          {/* Illustration */}
          <div className="mb-6">
            <svg width="160" height="140" viewBox="0 0 160 140" fill="none">
              <circle cx="80" cy="75" r="52" fill="#F0F0F5" />
              {/* Document */}
              <rect x="52" y="34" width="48" height="60" rx="5" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
              <line x1="62" y1="48" x2="90" y2="48" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
              <line x1="62" y1="56" x2="88" y2="56" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
              <line x1="62" y1="64" x2="85" y2="64" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
              {/* Magnifying glass */}
              <circle cx="88" cy="84" r="22" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
              <circle cx="85" cy="81" r="13" fill="#F8F8FC" stroke="#C4C4D4" strokeWidth="2"/>
              {/* X mark */}
              <path d="M80 76l10 10M90 76l-10 10" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Handle */}
              <line x1="96" y1="93" x2="107" y2="104" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
              {/* Sparkles */}
              <path d="M46 88l2-4 2 4-4-2 4 2" stroke="#93C5FD" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M112 50l1.5-3 1.5 3-3-1.5 3 1.5" stroke="#93C5FD" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="113" cy="90" r="2" fill="#93C5FD"/>
              {/* Pencil squiggle */}
              <path d="M42 52c4-8 8 4 12-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              {/* Small cards top right */}
              <rect x="100" y="30" width="20" height="8" rx="2" fill="#E5E7EB"/>
              <rect x="104" y="24" width="12" height="6" rx="2" fill="#D1D5DB"/>
            </svg>
          </div>

          <h2 className="text-[17px] font-semibold text-gray-900 mb-2">No assignments yet</h2>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-8">
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and let AI
            assist with grading.
          </p>
          <button
            onClick={() => router.push('/assignments/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium"
            style={{ background: '#111111' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Your First Assignment
          </button>
        </div>
      ) : (
        /* ── FILLED STATE ── */
        <div>
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <h1 className="text-lg font-semibold text-gray-900">Assignments</h1>
            </div>
            <p className="text-sm text-gray-500 ml-4">Manage and create assignments for your classes.</p>
          </div>

          {/* Filter + Search */}
          <div className="flex items-center gap-3 mb-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              Filter By
            </button>
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search Assignment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((assignment) => (
              <div key={assignment._id} className="bg-white rounded-xl border border-gray-100 p-5 relative hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-gray-900 text-[15px] truncate">{assignment.title}</h3>
                    <div className="mt-1">
                      <StatusBadge status={assignment.status} />
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === assignment._id ? null : assignment._id)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-gray-400">
                        <path d="M12 6a2 2 0 110-4 2 2 0 010 4zM12 14a2 2 0 110-4 2 2 0 010 4zM12 22a2 2 0 110-4 2 2 0 010 4z"/>
                      </svg>
                    </button>
                    {openMenu === assignment._id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 w-44">
                        <button
                          onClick={() => { router.push(`/assignments/${assignment._id}`); setOpenMenu(null) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          View Assignment
                        </button>
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-50">
                  <span><span className="font-medium text-gray-700">Assigned on</span> : {formatDate(assignment.createdAt)}</span>
                  <span><span className="font-medium text-gray-700">Due</span> : {formatDate(assignment.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* FAB */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => router.push('/assignments/create')}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg"
              style={{ background: '#111111' }}
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
        <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />
      )}
    </AppShell>
  )
}