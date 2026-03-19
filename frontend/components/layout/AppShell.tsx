import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface AppShellProps {
  children: React.ReactNode
  showBack?: boolean
  title?: string
}

export default function AppShell({ children, showBack, title }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-[240px] min-h-screen flex flex-col">
        <Topbar showBack={showBack} title={title} />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}