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
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { createSuperAdmin } from '@/lib/actions/auth';

export default function SetupAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await createSuperAdmin(email, password);
      
      if (result.success) {
        toast({
          title: 'Admin Created',
          description: 'Super admin account created successfully.',
        });
        router.push('/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'Admin Creation Failed',
          description: result.message || 'Could not create super admin account. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Admin Creation Failed',
        description: 'Could not create super admin account. Please try again.',
      });
      console.error('Admin creation error:', error);
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
          <CardDescription>
            Create the initial Super Admin account for the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleCreateAdmin}>
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@onboardlink.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
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
              Create Super Admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
