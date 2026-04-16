import { io } from 'socket.io-client'

let socket = null

export const initSocket = (onProgress, onComplete, onError) => {
  if (socket) return socket

  const url = import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin
  const token = localStorage.getItem('pdflynx_token')
  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: token ? { token } : undefined,
    query: token ? { token } : undefined,
  })

  socket.on('connect', () => console.log('WebSocket connected'))
  socket.on('disconnect', () => console.log('WebSocket disconnected'))

  if (onProgress) socket.on('progress', onProgress)
  if (onComplete) socket.on('complete', onComplete)
  if (onError) socket.on('error', onError)

  return socket
}

export const joinRoom = (roomId) => {
  if (socket) socket.emit('join-room', roomId)
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket
