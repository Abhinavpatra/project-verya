'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  status: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateStatus: (status: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for saved user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });
      // console.log('Login data:', data); done for debugging purposes
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      router.push('/chat');
    } catch (error: any) {
      setError( 'Login failed'); /// fixing this error
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.post('http://localhost:5000/api/users', {
        username,
        email,
        password,
      });
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      router.push('/chat');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  const updateStatus = async (status: string) => {
    if (!user) return;
    
    try {
      const { data } = await axios.put(
        'http://localhost:5000/api/users/status',
        { status },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      
      // Update user with new status
      const updatedUser = {
        ...user,
        status: data.status,
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};