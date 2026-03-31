'use client'
import { useRef, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useUserStore } from '@/store/userStore'

export default function SettingsPage() {
  const {
    name, email, schoolName, city, avatar,
    setName, setEmail, setSchoolName, setCity, setAvatar
  } = useUserStore()

  const [localName, setLocalName] = useState(name)
  const [localEmail, setLocalEmail] = useState(email)
  const [localSchool, setLocalSchool] = useState(schoolName)
  const [localCity, setLocalCity] = useState(city)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    setName(localName)
    setEmail(localEmail)
    setSchoolName(localSchool)
    setCity(localCity)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatar(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const initials = localName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <AppShell title="Settings">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Profile</h2>

          {/* Avatar Upload */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: avatar
                    ? 'transparent'
                    : 'linear-gradient(135deg, #2563EB, #3B82F6)',
                }}
              >
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center shadow-md hover:bg-gray-700 transition-colors"
              >
                <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{localName || 'Your Name'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{localEmail}</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              >
                Change photo
              </button>
              {avatar && (
                <button
                  onClick={() => setAvatar(null)}
                  className="mt-2 ml-2 text-xs font-medium px-3 py-1.5 border border-red-100 rounded-lg hover:bg-red-50 transition-colors text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: localName, setter: setLocalName, placeholder: 'e.g. John Doe' },
              { label: 'Email', value: localEmail, setter: setLocalEmail, placeholder: 'e.g. hiring@company.com' },
              { label: 'Company Name', value: localSchool, setter: setLocalSchool, placeholder: 'e.g. Anthropic, Google, Startup Inc.' },
              { label: 'Location', value: localCity, setter: setLocalCity, placeholder: 'e.g. San Francisco, Bangalore' },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{field.label}</label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full text-sm font-medium text-white transition-all active:scale-95"
              style={{ background: '#111111' }}
            >
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
            {saved && <p className="text-xs text-green-600 font-medium">Profile updated successfully</p>}
          </div>
        </div>

        {/* AI Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">AI Preferences</h2>
          <div className="space-y-1">
            {[
              { label: 'Default Difficulty Distribution', desc: 'Easy 30% · Medium 50% · Hard 20%', on: true },
              { label: 'Answer Key Generation', desc: 'Always include answer key with paper', on: true },
              { label: 'Auto-generate on submit', desc: 'Start generation immediately after form submit', on: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
                  style={{ background: item.on ? '#111111' : '#E5E7EB' }}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.on ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-1">
            {[
              { label: 'Assessment Generated', desc: 'Notify when AI finishes generating', on: true },
              { label: 'Generation Failed', desc: 'Alert when generation fails', on: true },
              { label: 'Weekly Summary', desc: 'Weekly report of assignments created', on: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
                  style={{ background: item.on ? '#111111' : '#E5E7EB' }}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.on ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg width="14" height="14" fill="none" stroke="#3B82F6" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Change Password</span>
              </div>
              <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <svg width="14" height="14" fill="none" stroke="#EF4444" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-red-500">Sign Out</span>
              </div>
              <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-8">VerdictAI v1.0.0 · Built for hiring teams</p>
      </div>
    </AppShell>
  )
}