
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | OnboardLink - Sterling Bank IMTO Portal",
  description: "Access your IMTO onboarding account. Login to continue your compliance documentation and track your application status with Sterling Bank.",
  openGraph: {
    title: "Login | OnboardLink - Sterling Bank IMTO Portal",
    description: "Access your IMTO onboarding account. Login to continue your compliance documentation and track your application status.",
  },
  twitter: {
    title: "Login | OnboardLink - Sterling Bank IMTO Portal",
    description: "Access your IMTO onboarding account. Login to continue your compliance documentation and track your application status.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../hooks/use-auth-client';
import { Eye, EyeOff } from 'lucide-react';
import { getSubmissionForUser } from '@/lib/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await login(email, password);
    
    // Get current user after login
    const user = auth.currentUser;
    if (!user) throw new Error('Login failed');

      // Check user role and status from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin' || userData.role === 'superadmin') {
          router.push('/admin');
          return;
        }

        if (userData.role === 'partner') {
            const submission = await getSubmissionForUser(user.uid);
            // If submission is in progress, go to dashboard.
            if (submission && (submission.status === 'In Progress' || submission.status === 'Requires Attention')) {
                router.push('/partner/dashboard');
            } else if (submission) { // For other statuses like Submitted, Approved, etc.
                router.push('/partner/dashboard');
            }
            else {
                router.push('/onboarding/company-info');
            }
            return;
        }
      }
      
      // Default to onboarding if no specific role or status found
      router.push('/onboarding/company-info');

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
 description:
          'Please check your email and password and try again.',
      });
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md mx-4 rounded-xl shadow-md">
        <CardHeader className="text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 mb-4"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M50 0L95.11 25V75L50 100L4.89 75V25L50 0Z" fill="#A6192E" />
              <path d="M50 10L86.6 30V70L50 90L13.4 70V30L50 10Z" fill="white" />
              <path d="M50 20L77.94 35V65L50 80L22.06 65V35L50 20Z" fill="#A6192E" />
            </svg>
            <CardTitle className="text-2xl font-bold font-headline">
              OnboardLink
            </CardTitle>
          </Link>
          <CardDescription>Login to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl shadow-md">
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="#" className="underline text-primary">
              Contact us
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
