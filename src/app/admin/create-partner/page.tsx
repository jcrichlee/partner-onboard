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
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function CreatePartnerPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreatePartner = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Create a temporary, secondary Firebase app instance.
    const secondaryApp = initializeApp(auth.app.options, `secondary-app-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: 'partner',
      });

      try {
        const loginUrl = window.location.origin + '/login';
        const credentialsText = `Hi Partner,\n\nHere's your login credential for the onboard portal\n\nemail address - ${email}\npassword - ${password}\nlogin url - ${loginUrl}`;
        await navigator.clipboard.writeText(credentialsText);
        toast({
          title: 'Partner Created & Copied',
          description: 'Partner credentials have been copied to your clipboard.',
        });
      } catch (copyError) {
        console.error('Failed to copy credentials:', copyError);
        toast({
          title: 'Partner Created',
          description: 'Partner account was created, but credentials could not be copied.',
        });
      }

      router.push('/admin');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Partner Creation Failed',
        description:
          'Could not create partner account. Please try again.',
      });
      console.error('Partner creation error:', error);
    }
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let newPassword = "";
    for (let i = 0; i < 16; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    setShowPassword(true); // Show the password when it's generated
  };


  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md mx-4 rounded-xl shadow-md">
         <CardHeader>
          <div className="flex items-center justify-between">
             <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
             </Button>
             <Link
                href="/"
                className="flex items-center justify-center gap-2"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M50 0L95.11 25V75L50 100L4.89 75V25L50 0Z" fill="#A6192E" />
                  <path d="M50 10L86.6 30V70L50 90L13.4 70V30L50 10Z" fill="white" />
                  <path d="M50 20L77.94 35V65L50 80L22.06 65V35L50 20Z" fill="#A6192E" />
                </svg>
                <CardTitle className="text-xl font-bold font-headline">
                  OnboardLink
                </CardTitle>
              </Link>
              <div className="w-8"></div>
           </div>
          <CardDescription className="text-center pt-4">
            Create a new Partner account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleCreatePartner}>
            <div className="space-y-2">
              <Label htmlFor="email">Partner Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="partner@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Partner Password</Label>
                <Button type="button" variant="link" size="sm" onClick={generatePassword} className="gap-1 text-sm h-auto p-0">
                  Generate Password
                </Button>
              </div>
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
              Create Partner Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
