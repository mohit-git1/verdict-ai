'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'

interface Group {
  id: string
  name: string
  subject: string
  section: string
  memberCount: number
  inviteCode: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', subject: '', section: '' })
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' })

  const showToast = (message: string) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 2000)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    const newGroup = {
      id: Date.now().toString(),
      name: formData.name,
      subject: formData.subject,
      section: formData.section,
      memberCount: 0,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    }
    setGroups([...groups, newGroup])
    setIsModalOpen(false)
    setFormData({ name: '', subject: '', section: '' })
  }

  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(`https://vedaai.app/join/${code}`)
    showToast('Link copied!')
  }

  return (
    <AppShell title="My Groups">
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <h1 className="text-[18px] font-semibold text-gray-900">My Groups</h1>
            </div>
            <p className="text-[14px] text-gray-500 ml-4">Manage your classes and student groups</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#111111] text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm active:scale-95"
          >
            Create Group
          </button>
        </div>

        {/* Content */}
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 mb-6 bg-white rounded-full flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No groups yet</h2>
            <p className="text-sm text-gray-500 mb-6">Create your first group to start managing students</p>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-[#111111] text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm active:scale-95"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map(g => (
              <div key={g.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative group">
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setGroups(groups.filter(gr => gr.id !== g.id))} 
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4 pr-8">
                  <h3 className="text-[17px] font-semibold text-gray-900">{g.name}</h3>
                  <p className="text-[13px] text-gray-500 mt-1">{g.subject} {g.section && `• ${g.section}`}</p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                  <div className="flex items-center text-[13px] font-medium text-gray-600 gap-1.5">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    {g.memberCount} members
                  </div>
                  <button 
                    onClick={() => copyInvite(g.inviteCode)} 
                    className="flex items-center gap-1.5 text-[#E8431C] text-[13px] font-bold hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    Invite Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[20px] w-full max-w-[400px] p-[24px] shadow-xl relative animate-in fade-in zoom-in duration-200">
              <h2 className="text-[20px] font-bold text-gray-900 mb-6">Create New Group</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-900 mb-1.5">Group Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Class 10 - Science" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" 
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-900 mb-1.5">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Science" 
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" 
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-900 mb-1.5">Section/Division</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Section A" 
                    value={formData.section} 
                    onChange={e => setFormData({...formData, section: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" 
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-white bg-[#111111] hover:bg-gray-800 transition-colors"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl text-[14px] font-medium shadow-xl animate-in slide-in-from-bottom-5 z-50 flex items-center gap-2">
            <svg width="18" height="18" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {toast.message}
          </div>
        )}
      </div>
    </AppShell>
  )
}
