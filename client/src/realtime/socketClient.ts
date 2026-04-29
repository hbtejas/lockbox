import { io, type Socket } from 'socket.io-client'

let socketClient: Socket | null = null

export function getSocketClient() {
  if (!socketClient) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000'
    socketClient = io(socketUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
  }

  return socketClient
}
