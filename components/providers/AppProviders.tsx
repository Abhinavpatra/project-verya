'use client';

import { AuthProvider } from '@/app/context/AuthContext';
import { ChatProvider } from '@/app/context/ChatContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ChatProvider>
          {children}
          <Toaster />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}