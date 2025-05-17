'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

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
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">WebChat</h1>
          <p className="text-muted-foreground mt-2">
            {tab === 'register' ? 'Create an account' : 'Welcome back'}
          </p>
        </div>
        <AuthForm />
      </motion.div>
    </div>
  );
}