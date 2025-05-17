'use client';
 
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function AuthForm() {
  const { login, register, loading, error } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [registerErrors, setRegisterErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    setRegisterErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateRegisterForm = () => {
    let isValid = true;
    const errors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!registerData.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!registerData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!registerData.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (registerData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setRegisterErrors(errors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginData.email, loginData.password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateRegisterForm()) {
      await register(
        registerData.username,
        registerData.email,
        registerData.password
      );
    }
  };

  return (
    <div className="w-full max-w-md p-4 mx-auto">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Enter your details to create a new account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    placeholder="johndoe"
                    required
                  />
                  {registerErrors.username && (
                    <p className="text-sm font-medium text-destructive">
                      {registerErrors.username}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="email@example.com"
                    required
                  />
                  {registerErrors.email && (
                    <p className="text-sm font-medium text-destructive">
                      {registerErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="••••••••"
                    required
                  />
                  {registerErrors.password && (
                    <p className="text-sm font-medium text-destructive">
                      {registerErrors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="••••••••"
                    required
                  />
                  {registerErrors.confirmPassword && (
                    <p className="text-sm font-medium text-destructive">
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                </div>
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Register'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}