'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAssignmentStore } from '@/store/assignmentStore'
import { useUserStore } from '@/store/userStore'

interface TopbarProps {
  showBack?: boolean
  title?: string
  onMenuClick?: () => void
}

export default function Topbar({ showBack = false, title = 'Assignment', onMenuClick }: TopbarProps) {
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { assignments } = useAssignmentStore()
  const { name, avatar, schoolName } = useUserStore()

  const pendingAssignments = assignments.filter(
    (a) => a.status === 'pending' || a.status === 'processing'
  )

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const AvatarCircle = ({ size = 28 }: { size?: number }) => (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: avatar ? 'transparent' : 'linear-gradient(135deg, #E8431C, #FF6B35)',
      }}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.4, fontWeight: 700, color: 'white' }}>
          {initials}
        </span>
      )}
    </div>
  )

  const NotifDropdown = () => (
    <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Notifications</p>
        {pendingAssignments.length > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#E8431C' }}>
            {pendingAssignments.length}
          </span>
        )}
      </div>
      {pendingAssignments.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <svg className="mx-auto mb-3" width="36" height="36" fill="none" stroke="#D1D5DB" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <p className="text-sm font-medium text-gray-700">No pending assignments</p>
          <p className="text-xs text-gray-400 mt-1">All caught up!</p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {pendingAssignments.map((a) => (
            <button
              key={a._id}
              onClick={() => { router.push(`/assignments/${a._id}`); setNotifOpen(false) }}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
            >
              <div className="flex-shrink-0 mt-2">
                {a.status === 'processing'
                  ? <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  : <div className="w-2 h-2 rounded-full bg-yellow-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {a.status === 'processing' ? 'Generating question paper...' : 'Waiting to generate...'}
                </p>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-1"
                style={{
                  background: a.status === 'processing' ? '#DBEAFE' : '#FEF3C7',
                  color: a.status === 'processing' ? '#2563EB' : '#D97706',
                }}
              >
                {a.status === 'processing' ? 'Generating' : 'Pending'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

 const ProfileDropdown = () => (
  <div className="absolute right-0 top-12 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
    <div className="px-4 py-3 border-b border-gray-100">
      <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
      <p className="text-xs text-gray-500 truncate">{schoolName}</p>
    </div>
    <div className="py-1">
      <button
        onClick={() => { router.push('/settings'); setProfileOpen(false) }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </button>
      <div className="border-t border-gray-100 mt-1 pt-1">
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  </div>
)

  return (
    <>
      {/* Mobile Topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-20 px-3 pt-3">
        <div className="flex items-center justify-between px-4 h-14 bg-white rounded-2xl shadow-sm">
          <div 
            onClick={() => router.push('/')} 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src="/VedaAI.png" alt="VedaAI" width={32} height={32} style={{ borderRadius: '22%' }} />
            <span className="font-bold text-[16px] text-gray-900">VedaAI</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }} className="relative p-1">
                <svg width="20" height="20" fill="none" stroke="#374151" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {pendingAssignments.length > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500"></span>}
              </button>
              {notifOpen && <NotifDropdown />}
            </div>
            <div className="relative">
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }} className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">{initials}</span>
                  </div>
                )}
              </button>
              {profileOpen && <ProfileDropdown />}
            </div>
            <button onClick={onMenuClick} className="p-1">
              <svg width="22" height="22" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Topbar */}
      <header className="hidden md:flex h-14 bg-white border-b border-gray-100 items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2 text-sm">
            <svg width="15" height="15" fill="none" stroke="#6B7280" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <span className="font-medium text-gray-800">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
              className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {pendingAssignments.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#E8431C' }}></span>
              )}
            </button>
            {notifOpen && <NotifDropdown />}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <AvatarCircle size={28} />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{name}</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {profileOpen && <ProfileDropdown />}
          </div>
        </div>
      </header>

      {/* Backdrop to close dropdowns */}
      {(notifOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setNotifOpen(false); setProfileOpen(false) }}
        />
      )}
    </>
  )
}