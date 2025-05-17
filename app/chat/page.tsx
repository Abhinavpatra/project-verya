'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatBox from '@/components/chat/ChatBox';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <ChatSidebar />
      <div className="flex-1 md:ml-72">
        <ChatBox />
      </div>
    </div>
  );
}