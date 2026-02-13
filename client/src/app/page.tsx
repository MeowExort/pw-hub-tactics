'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>('');

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socketInstance = io(socketUrl);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Disconnected from server:', reason);
    });

    socketInstance.on('pong', () => {
      setLastMessage('Received: pong');
      console.log('Received pong from server');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendPing = () => {
    if (socket) {
      console.log('Sending ping...');
      socket.emit('ping');
      setLastMessage('Sent: ping');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-2xl font-bold">Tactics Web App - Socket.io Test</h1>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        <button
          onClick={sendPing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={!isConnected}
        >
          Send Ping
        </button>

        {lastMessage && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            {lastMessage}
          </div>
        )}
      </main>
    </div>
  );
}
