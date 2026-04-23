// ============================================================
// CV-Mister — useSocket Hook (Real-time Connection)
// Manages Socket.IO connection and event subscriptions
// ============================================================
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

import { API_BASE_URL } from '../api/config';

// Use central config, fallback to origin in production if needed
const SOCKET_URL = API_BASE_URL;

/**
 * Custom hook for Socket.IO real-time connection
 * @param {Object} options
 * @param {string} options.room - 'admin' or userId for user room
 * @param {Object} options.events - { eventName: handler } map
 */
export function useSocket({ room = null, events = {} } = {}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventsRef = useRef(events);

  // Keep events ref up to date without re-creating socket
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    // Create connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] ✅ Connected:', socket.id);
      setIsConnected(true);

      // Join the appropriate room
      if (room === 'admin') {
        socket.emit('join-admin');
        console.log('[Socket.IO] 👨‍💼 Joined admin room');
      } else if (room) {
        socket.emit('join-user', room);
        console.log(`[Socket.IO] 👤 Joined user room: ${room}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] ❌ Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] ⚠️ Connection error:', err.message);
    });

    // Register event listeners
    const eventNames = Object.keys(eventsRef.current);
    eventNames.forEach((eventName) => {
      socket.on(eventName, (data) => {
        if (eventsRef.current[eventName]) {
          eventsRef.current[eventName](data);
        }
      });
    });

    return () => {
      eventNames.forEach((eventName) => {
        socket.off(eventName);
      });
      socket.disconnect();
      console.log('[Socket.IO] 🔌 Socket cleaned up');
    };
  }, [room]); // Only reconnect if room changes

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { isConnected, emit, socket: socketRef };
}

export default useSocket;
