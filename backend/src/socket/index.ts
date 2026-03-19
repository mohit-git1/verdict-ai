import { Server } from 'socket.io'

export const initSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    socket.on('join:assignment', (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`)
      console.log(`Socket ${socket.id} joined room assignment:${assignmentId}`)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
  })
}
