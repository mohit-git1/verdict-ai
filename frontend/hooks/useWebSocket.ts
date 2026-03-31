'use client'
import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAssessmentStore } from '@/store/assignmentStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
let socket: Socket | null = null

export function useWebSocket(assignmentId?: string) {
  const { updateAssessmentStatus, setGenerating, setProgressMessage } = useAssessmentStore()

  useEffect(() => {
    if (!socket) {
      socket = io(API_URL, { transports: ['websocket', 'polling'] })
    }

    if (!assignmentId) return

    socket.emit('join:assignment', assignmentId)

    socket.on('status:update', (data: { status: string }) => {
      updateAssessmentStatus(assignmentId, data.status as any)
      if (data.status === 'processing') setGenerating(true)
    })

    socket.on('generation:complete', (data: { status: string }) => {
      updateAssessmentStatus(assignmentId, 'completed')
      setGenerating(false)
      window.dispatchEvent(
        new CustomEvent('generation:complete', { detail: { assignmentId } })
      )
    })

    socket.on('generation:failed', () => {
      updateAssessmentStatus(assignmentId, 'failed')
      setGenerating(false)
    })

    socket.on('generation:progress', (data: { id: string, message: string }) => {
      if (data.id === assignmentId) {
        setProgressMessage(data.message)
      }
    })

    return () => {
      socket?.off('status:update')
      socket?.off('generation:complete')
      socket?.off('generation:failed')
      socket?.off('generation:progress')
    }
  }, [assignmentId])
}