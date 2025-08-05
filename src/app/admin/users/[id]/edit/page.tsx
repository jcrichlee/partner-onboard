
'use client';

import { useEffect, useState, use } from 'react';
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

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Power, PowerOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { getUserById, updateUser, UserProfile, StagePermission, StagePermissionsMap } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';


const stageOptions = [
    { value: 'Company Information', label: 'Company Information' },
    { value: 'Compliance', label: 'Ownership & Compliance' },
    { value: 'Security', label: 'Security & Governance' },
    { value: 'Attestations', label: 'Attestations' },
];

const permissionOptions: { value: StagePermission, label: string }[] = [
    { value: 'view', label: 'View Documents' },
    { value: 'comment', label: 'Comment & Review' },
];

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [stagePermissions, setStagePermissions] = useState<StagePermissionsMap>({});
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { userProfile, loading: authLoading } = useAuth();
  const resolvedParams = use(Promise.resolve(params));

  useEffect(() => {
    if (authLoading) return;
    
    if (!userProfile) {
        router.push('/login');
        return;
    }

    if (userProfile.role !== 'superadmin') {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only Super Admins can edit user accounts.' });
        router.push('/admin');
        return;
    }

    const fetchUser = async () => {
      const user = await getUserById(resolvedParams.id);
      if (user) {
        setUserToEdit(user);
        setEmail(user.email);
        setRole(user.role);
        setStagePermissions(user.stagePermissions || {});
        setCanManageUsers(user.canManageUsers || false);
        setDisabled(user.disabled || false);
      }
      setLoading(false);
    };
    fetchUser();
  }, [resolvedParams.id, authLoading, userProfile, router, toast]);

  const handleStageSelectionChange = (selectedStages: string[] | ((prev: string[]) => string[])) => {
    const stages = typeof selectedStages === 'function' ? selectedStages(Object.keys(stagePermissions)) : selectedStages;
    const newPermissions: StagePermissionsMap = {};
    stages.forEach(stage => {
        newPermissions[stage] = stagePermissions[stage] || [];
    });
    setStagePermissions(newPermissions);
  };
  
  const handlePermissionChange = (stage: string, permissions: StagePermission[]) => {
    setStagePermissions(prev => ({ ...prev, [stage]: permissions }));
  }

  const handleUpdateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userToEdit) return;

    try {
      const updateData: Partial<UserProfile> = {
        role: role as 'admin' | 'superadmin' | 'partner',
        stagePermissions,
        canManageUsers,
        disabled,
      };
      
      await updateUser(userToEdit.id, updateData);
      
      toast({
        title: 'User Updated',
        description: 'User details have been successfully updated.',
      });

      router.push('/admin/users');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update user. Please try again.',
      });
      console.error('User update error:', error);
    }
  };

  if (loading || authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!userToEdit) {
    return <div className="flex items-center justify-center min-h-screen">User not found.</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg mx-4 rounded-xl shadow-md">
         <CardHeader>
          <div className="flex items-center justify-between">
             <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
             </Button>
             <CardTitle className="text-xl font-bold font-headline">
                Edit User
            </CardTitle>
            <div className="w-8"></div>
           </div>
          <CardDescription className="text-center pt-4">
            Update user details and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleUpdateUser}>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled // Email should not be editable
              />
            </div>
            
             {userToEdit.role !== 'partner' && (
                <>
                 {userProfile?.role === 'superadmin' && (
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
                 )}
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label htmlFor="manage-users" className="text-base">Manage Users</Label>
                    <p className="text-sm text-muted-foreground">
                      Can this admin add, delete, or disable other admin/partner users?
                    </p>
                  </div>
                  <Switch
                    id="manage-users"
                    checked={canManageUsers}
                    onCheckedChange={setCanManageUsers}
                  />
                </div>
                <Separator />
            
                <div className="space-y-4">
                    <Label className="text-base font-medium">Stage Permissions</Label>
                    <div className="space-y-2">
                        <Label htmlFor="stages">Accessible Onboarding Stages</Label>
                        <MultiSelect
                            options={stageOptions}
                            selected={Object.keys(stagePermissions)}
                            onChange={handleStageSelectionChange}
                            placeholder="Select stages this admin can access..."
                        />
                    </div>
                    {Object.keys(stagePermissions).length > 0 && <Separator/>}

                    {Object.keys(stagePermissions).map(stage => (
                        <div key={stage} className="space-y-2 p-3 border rounded-md">
                            <Label htmlFor={`permissions-${stage}`} className="font-semibold">
                                {stageOptions.find(o => o.value === stage)?.label} Permissions
                            </Label>
                            <MultiSelect
                                options={permissionOptions}
                                selected={stagePermissions[stage] || []}
                                onChange={(newPerms) => handlePermissionChange(stage, newPerms as StagePermission[])}
                                placeholder="Select permissions..."
                            />
                        </div>
                    ))}
                </div>
                </>
             )}
            

            <Separator />
            
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label htmlFor="disable-user" className="text-base">User Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {disabled ? 'This user is currently disabled.' : 'This user is currently active.'}
                    </p>
                  </div>
                  <Button type="button" variant={disabled ? 'secondary' : 'destructive'} onClick={() => setDisabled(!disabled)}>
                    {disabled ? <Power className="mr-2 h-4 w-4"/> : <PowerOff className="mr-2 h-4 w-4"/>}
                    {disabled ? 'Enable User' : 'Disable User'}
                  </Button>
            </div>

            <Button type="submit" className="w-full rounded-xl shadow-md">
              Update User Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
