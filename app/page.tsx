'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/chat');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-accent/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 inline-block"
        >
          <div className="p-4 bg-primary rounded-full text-primary-foreground">
            <MessageSquareText size={64} />
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          Welcome to WebChat
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-xl text-muted-foreground mb-8"
        >
          Connect with friends and colleagues in real-time with our secure chat platform
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            onClick={() => router.push('/login')}
            size="lg"
            className="text-lg px-8"
          >
            Get Started
          </Button>
          
          <Button 
            onClick={() => router.push('/login?tab=register')}
            variant="outline"
            size="lg"
            className="text-lg px-8"
          >
            Register
          </Button>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-20 text-center text-muted-foreground"
      >
        <p>Secure. Real-time. Simple.</p>
      </motion.div>
    </div>
  );
}