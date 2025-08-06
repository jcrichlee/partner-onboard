
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const { login, user, userProfile, loading } = useAuth();

  // Handle routing after successful authentication
  useEffect(() => {
    if (!loading && user && userProfile) {
      handleUserRouting();
    }
  }, [loading, user, userProfile]);

  const handleUserRouting = async () => {
    if (!user || !userProfile) return;

    try {
      if (userProfile.role === 'admin' || userProfile.role === 'superadmin') {
        router.push('/admin');
        return;
      }

      if (userProfile.role === 'partner') {
        try {
          const submission = await getSubmissionForUser(user.uid);
          // If submission is in progress, go to dashboard.
          if (submission && (submission.status === 'in-progress' || submission.status === 'requires-attention')) {
            router.push('/partner/dashboard');
          } else if (submission) { // For other statuses like Submitted, Approved, etc.
            router.push('/partner/dashboard');
          } else {
            router.push('/onboarding/company-info');
          }
        } catch (submissionError) {
          console.error('Error fetching submission, defaulting to onboarding:', submissionError);
          // If we can't fetch submission due to permissions, default to onboarding
          router.push('/onboarding/company-info');
        }
        return;
      }
      
      // Default to onboarding if no specific role or status found
      router.push('/onboarding/company-info');
    } catch (error) {
      console.error('Routing error:', error);
      // Fallback to onboarding if routing fails
      router.push('/onboarding/company-info');
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await login(email, password);
      // Routing will be handled by useEffect after userProfile is loaded
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Please check your email and password and try again.',
      });
      console.error('Authentication error:', error);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="responsive-container">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
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
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-headline">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to access your IMTO onboarding portal
            </p>
          </div>
          
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-gray-200 focus:border-primary focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need access?{' '}
              <Link href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
