import { io } from 'socket.io-client';

export function createSocket(authData) {
  const socket = io('/', {
    auth: authData,
    transports: ['websocket', 'polling'],
  });
  return socket;
}
