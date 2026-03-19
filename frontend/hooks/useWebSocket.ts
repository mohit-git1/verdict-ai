'use client'
import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAssignmentStore } from '@/store/assignmentStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
let socket: Socket | null = null

export function useWebSocket(assignmentId?: string) {
  const { updateAssignmentStatus, setGenerating } = useAssignmentStore()

  useEffect(() => {
    if (!socket) {
      socket = io(API_URL, { transports: ['websocket', 'polling'] })
    }

    if (!assignmentId) return

    socket.emit('join:assignment', assignmentId)

    socket.on('status:update', (data: { status: string }) => {
      updateAssignmentStatus(assignmentId, data.status as any)
      if (data.status === 'processing') setGenerating(true)
    })

    socket.on('generation:complete', (data: { status: string }) => {
      updateAssignmentStatus(assignmentId, 'completed')
      setGenerating(false)
      window.dispatchEvent(
        new CustomEvent('generation:complete', { detail: { assignmentId } })
      )
    })

    socket.on('generation:failed', () => {
      updateAssignmentStatus(assignmentId, 'failed')
      setGenerating(false)
    })

    return () => {
      socket?.off('status:update')
      socket?.off('generation:complete')
      socket?.off('generation:failed')
    }
  }, [assignmentId])
}