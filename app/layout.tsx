import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AppProviders from '@/components/providers/AppProviders';
import { ChatProvider } from "@/app/context/ChatContext";


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WebChat',
  description: 'Real-time webchat application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>

       
        <AppProviders>
         <ChatProvider>
          {children}
          </ChatProvider>
        </AppProviders>
        
       
      </body>
    </html>
  );
}