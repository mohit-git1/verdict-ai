'use client'
import { useUserStore } from '@/store/userStore'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAssignmentStore } from '@/store/assignmentStore'

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { assignments } = useAssignmentStore()
  const { name, avatar, schoolName, city } = useUserStore()
  const assignmentCount = assignments.length

  const navItems = [
    { label: 'Home', href: '/', icon: '/icons/home.svg' },
    { label: 'My Groups', href: '/groups', icon: '/icons/myGroups.svg' },
    { label: 'Assignments', href: '/assignments', icon: '/icons/assignment.svg' },
    { label: "AI Teacher's Toolkit", href: '/toolkit', icon: '/icons/aiTeacherToolkit.svg' },
    { label: 'My Library', href: '/library', icon: '/icons/myLibrary.svg' },
  ]

  return (
    <>
      <aside
        className={`flex flex-col w-[240px] min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-30 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-5 pt-8 pb-6">
          <div 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/VedaAI.png"
              alt="VedaAI"
              width={42}
              height={42}
              style={{ borderRadius: '22%' }}
            />
            <span className="font-extrabold text-[18px] tracking-tight text-gray-900">VedaAI</span>
          </div>
        </div>

        {/* Create Assignment Button */}
        <div className="px-4 mb-6">
          <button
            onClick={() => {
              router.push('/assignments/create')
              onMobileClose?.()
            }}
            className="w-full flex items-center justify-center gap-2 text-white text-[14px] font-medium transition-all hover:opacity-90 active:scale-95"
            style={{
              background: '#2A2A2A',
              border: '2.5px solid #E8431C',
              borderRadius: '999px',
              height: '44px',
              boxShadow: '0 0 0 1px rgba(232,67,28,0.4)',
            }}
          >
            <div className="relative flex items-center justify-center w-5 h-5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ position: 'absolute' }}>
                <path d="M12 2C12 2 13.5 8.5 15 10C16.5 11.5 22 12 22 12C22 12 16.5 12.5 15 14C13.5 15.5 12 22 12 22C12 22 10.5 15.5 9 14C7.5 12.5 2 12 2 12C2 12 7.5 11.5 9 10C10.5 8.5 12 2 12 2Z" />
              </svg>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="white" style={{ position: 'absolute', top: '-2px', right: '-3px' }}>
                <path d="M12 2C12 2 13.5 8.5 15 10C16.5 11.5 22 12 22 12C22 12 16.5 12.5 15 14C13.5 15.5 12 22 12 22C12 22 10.5 15.5 9 14C7.5 12.5 2 12 2 12C2 12 7.5 11.5 9 10C10.5 8.5 12 2 12 2Z" />
              </svg>
            </div>
            Create Assignment
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/assignments' &&
                pathname.startsWith('/assignments') &&
                !pathname.startsWith('/assignments/create'))
            const isToolkit =
              item.href === '/toolkit' &&
              pathname.startsWith('/assignments/') &&
              pathname !== '/assignments/create'
            const active = isActive || isToolkit

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  width={22}
                  height={22}
                  style={{
                    filter: active
                      ? 'brightness(0) saturate(100%)'
                      : 'brightness(0) saturate(100%) opacity(35%)',
                  }}
                />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Assignments' && assignmentCount > 0 && (
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white min-w-[20px] text-center"
                    style={{ background: '#E8431C' }}
                  >
                    {assignmentCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-5 mt-auto space-y-1">
          {/* Profile Card */}
          <div 
            onClick={() => { router.push('/settings'); onMobileClose?.(); }}
            className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-2xl mb-2 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ background: avatar ? 'transparent' : 'linear-gradient(135deg, #E8431C, #FF6B35)' }}
            >
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-gray-900 truncate">{name}</p>
              <p className="text-[11px] text-gray-500 truncate">{schoolName}</p>
            </div>
          </div>

          <Link
            href="/settings"
            onClick={onMobileClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              pathname === '/settings'
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
            }`}
          >
            <span className={pathname === '/settings' ? 'text-gray-700' : 'text-gray-400'}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Settings
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around px-2 py-3"
        style={{ background: '#111111', borderRadius: '20px' }}
      >
        {[
          { label: 'Home', href: '/', icon: '/icons/home.svg' },
          { label: 'My Groups', href: '/groups', icon: '/icons/myGroups.svg' },
          { label: 'Library', href: '/library', icon: '/icons/myLibrary.svg' },
          { label: 'AI Toolkit', href: '/toolkit', icon: '/icons/aiTeacherToolkit.svg' },
        ].map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-4 py-1"
            >
              <img
                src={item.icon}
                alt={item.label}
                width={24}
                height={24}
                style={{
                  filter: active
                    ? 'brightness(0) saturate(100%) invert(100%)'
                    : 'brightness(0) saturate(100%) invert(50%)',
                }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? '#FFFFFF' : '#6B7280' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}