import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserStore {
  name: string
  email: string
  schoolName: string
  city: string
  avatar: string | null

  setName: (name: string) => void
  setEmail: (email: string) => void
  setSchoolName: (name: string) => void
  setCity: (city: string) => void
  setAvatar: (avatar: string | null) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: 'John Doe',
      email: 'admin@school.edu.in',
      schoolName: 'Delhi Public School',
      city: 'Bokaro Steel City',
      avatar: null,

      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      setSchoolName: (schoolName) => set({ schoolName }),
      setCity: (city) => set({ city }),
      setAvatar: (avatar) => set({ avatar }),
    }),
    { name: 'veda-user-store' }
  )
)