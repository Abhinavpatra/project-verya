'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export const useWebSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Close previous connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Create new connection only if user is logged in
    if (user && user.token) {
      const socket = new WebSocket('ws://localhost:5000');
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connection established');
        // Authenticate with the WebSocket server
        socket.send(JSON.stringify({
          type: 'auth',
          token: user.token
        }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'auth_success') {
          setIsConnected(true);
        }
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      // Clean up on unmount
      return () => {
        socket.close();
      };
    }
  }, [user]);

  // Send message through WebSocket
  const sendSocketMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    sendSocketMessage
  };
};