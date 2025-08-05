
'use client';

import { useEffect, useState } from 'react';
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
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

type StagePermission = 'view' | 'comment';
type StagePermissionsMap = Record<string, StagePermission[]>;

const stageOptions = [
    { value: 'Company Information', label: 'Company Information' },
    { value: 'Attestations', label: 'Attestations' },
    { value: 'Compliance', label: 'Ownership & Compliance' },
    { value: 'Security', label: 'Security & Governance' },
];

const permissionOptions: { value: StagePermission, label: string }[] = [
    { value: 'view', label: 'View' },
    { value: 'comment', label: 'Comment & Review' },
];

export default function CreateAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [stagePermissions, setStagePermissions] = useState<StagePermissionsMap>({});
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectAllStages, setSelectAllStages] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUserRole(userData.role);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not verify user role.' });
          router.push('/admin');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  const toggleStage = (stageValue: string) => {
    // If 'All' is selected, do nothing for individual toggles.
    if (selectAllStages) return;

    setStagePermissions(prev => {
        const newPerms = {...prev};
        if (newPerms[stageValue]) {
            delete newPerms[stageValue];
        } else {
            newPerms[stageValue] = [];
        }
        return newPerms;
    });
  }
  
  const handleToggleAllStages = () => {
    const isSelectingAll = !selectAllStages;
    setSelectAllStages(isSelectingAll);

    if (isSelectingAll) {
        const allSelected: StagePermissionsMap = {};
        stageOptions.forEach(stage => {
            // Preserve existing permissions if they exist, otherwise initialize
            allSelected[stage.value] = stagePermissions[stage.value] || [];
        });
        setStagePermissions(allSelected);
    } else {
        setStagePermissions({});
    }
  }

  const togglePermission = (stage: string, permission: StagePermission | 'all') => {
    setStagePermissions(prev => {
        const newPerms = { ...prev };
        const currentPermissions = prev[stage] || [];
        
        if (permission === 'all') {
            const allPermissions = permissionOptions.map(p => p.value);
            // If not all permissions are currently granted, grant them all. Otherwise, clear them.
            if (currentPermissions.length !== allPermissions.length) {
                newPerms[stage] = allPermissions;
            } else {
                newPerms[stage] = [];
            }
        } else {
            const updatedPermissions = currentPermissions.includes(permission)
                ? currentPermissions.filter(p => p !== permission)
                : [...currentPermissions, permission];
            newPerms[stage] = updatedPermissions;
        }

        return newPerms;
    });
  }


  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create a temporary, secondary Firebase app instance.
    const secondaryApp = initializeApp(auth.app.options, `secondary-app-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const user = userCredential.user;

      let finalPermissions = { ...stagePermissions };
      if (selectAllStages) {
          stageOptions.forEach(stage => {
              if (!finalPermissions[stage.value]) {
                finalPermissions[stage.value] = [];
              }
          })
      }


      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        stagePermissions: finalPermissions,
        canManageUsers: canManageUsers,
      });
      
      try {
        const loginUrl = window.location.origin + '/login';
        const credentialsText = `Hi Admin,\n\nHere's your login credential for the onboard portal\n\nemail address - ${email}\npassword - ${password}\nlogin url - ${loginUrl}`;
        await navigator.clipboard.writeText(credentialsText);
        toast({
          title: 'Admin Created & Copied',
          description: 'Admin credentials have been copied to your clipboard.',
        });
      } catch (copyError) {
        console.error('Failed to copy credentials:', copyError);
        toast({
          title: 'Admin Created',
          description: 'Admin account was created, but credentials could not be copied.',
        });
      }

      router.push('/admin');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Admin Creation Failed',
        description:
          'Could not create admin account. Please try again.',
      });
      console.error('Admin creation error:', error);
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="responsive-container min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg mx-auto rounded-xl shadow-md h-full max-h-[96vh] flex flex-col">
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
                <CardTitle className="text-lg sm:text-xl font-bold font-headline">
                  OnboardLink
                </CardTitle>
              </Link>
              <div className="w-8"></div>
           </div>
          <CardDescription className="text-center pt-4 text-sm sm:text-base">
            Create a new Admin account and set their permissions.
          </CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          <CardContent>
            <form className="space-y-6" onSubmit={handleCreateAdmin}>
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {currentUserRole === 'superadmin' && (
                  <>
                  <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                      </SelectContent>
                      </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <Label htmlFor="manage-users" className="text-base font-medium">Manage Users</Label>
                      <p className="text-sm text-muted-foreground">
                        Can this admin add, delete, or disable other users?
                      </p>
                    </div>
                    <Switch
                      id="manage-users"
                      checked={canManageUsers}
                      onCheckedChange={setCanManageUsers}
                    />
                  </div>
                  </>
              )}
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Accessible Onboarding Stages</Label>
                  <div className="responsive-button-group pt-2">
                     <Button
                        type="button"
                        variant={selectAllStages ? 'default' : 'outline'}
                        onClick={handleToggleAllStages}
                      >
                        All
                      </Button>
                    {stageOptions.map(stage => (
                      <Button
                        key={stage.value}
                        type="button"
                        variant={!selectAllStages && stagePermissions[stage.value] ? 'default' : 'outline'}
                        onClick={() => toggleStage(stage.value)}
                        disabled={selectAllStages}
                      >
                        {stage.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {Object.keys(stagePermissions).length > 0 && <Separator/>}

                <div className="space-y-4">
                    {Object.keys(stagePermissions).sort().map(stageKey => {
                      const allSelected = stagePermissions[stageKey]?.length === permissionOptions.length;
                      return (
                      <div key={stageKey} className="space-y-3 p-4 border rounded-lg shadow-sm">
                          <Label className="font-semibold text-base">
                              {stageOptions.find(o => o.value === stageKey)?.label} Permissions
                          </Label>
                          <div className="responsive-button-group">
                            <Button
                                type="button"
                                variant={allSelected ? 'default' : 'outline'}
                                onClick={() => togglePermission(stageKey, 'all')}
                            >
                                All
                            </Button>
                            {permissionOptions.map(permission => (
                                <Button
                                    key={permission.value}
                                    type="button"
                                    variant={stagePermissions[stageKey]?.includes(permission.value) ? 'default' : 'outline'}
                                    onClick={() => togglePermission(stageKey, permission.value)}
                                    disabled={allSelected}
                                >
                                    {permission.label}
                                </Button>
                            ))}
                           </div>
                      </div>
                    )})}
                </div>
              </div>


              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Admin Password</Label>
                  <Button type="button" variant="link" size="sm" onClick={generatePassword} className="gap-1 text-sm h-auto p-0">
                    <RefreshCw className="h-3 w-3"/>
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
                Create Admin Account
              </Button>
            </form>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
