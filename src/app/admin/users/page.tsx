
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,

} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ArrowLeft, PlusCircle, Trash2, Edit, Power, PowerOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllUsers, UserProfile, updateUser, deleteUser } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { userProfile, loading: authLoading } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (authLoading) return;
    
    // If user is not authenticated, redirect to login
    if (!userProfile && !authLoading) {
      setLoading(false);
      router.push('/login');
      return;
    }

    // Only authenticated users can access this page (admin role check handled by route protection)
    
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load users. This may be due to insufficient permissions.' });
    } finally {
      setLoading(false);
    }
  }, [userProfile, authLoading, router, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleDisable = async (user: UserProfile) => {
    try {
      await updateUser(user.id, { disabled: !user.disabled });
      setUsers(users.map(u => u.id === user.id ? { ...u, disabled: !u.disabled } : u));
      toast({ title: 'Success', description: `User has been ${user.disabled ? 'enabled' : 'disabled'}.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user status.' });
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      // NOTE: This only deletes from Firestore. Deleting from Auth requires a Cloud Function.
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast({ title: 'Success', description: 'User has been deleted.' });
    } catch {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete user.' });
    }
  };

  if (loading || authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="responsive-container py-10">
      <div className="responsive-header">
         <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
                <ArrowLeft className="h-4 w-4" />
             </Button>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">User Management</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                View, edit, and manage all users in the system.
                </p>
            </div>
        </div>
        <div className="responsive-button-group w-full sm:w-auto">
            <Button asChild className="rounded-xl shadow-md w-full sm:w-auto">
                <Link href="/admin/create-partner">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Partner
                </Link>
            </Button>
            {userProfile?.role === 'superadmin' && (
                <Button asChild variant="black" className="rounded-xl shadow-md w-full sm:w-auto">
                    <Link href="/admin/create-admin">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Admin
                    </Link>
                </Button>
            )}
        </div>
      </div>
      <Card className="rounded-xl shadow-md">
        <CardContent className="p-0">
          <div className="responsive-table-wrapper">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.disabled ? 'destructive' : 'default'}>
                      {user.disabled ? 'Disabled' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {userProfile?.role === 'superadmin' ? (
                           <DropdownMenuItem asChild>
                             <Link href={`/admin/users/${user.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                             <Edit className="mr-2 h-4 w-4" />
                             Edit User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleDisable(user)}>
                            {user.disabled ? (
                                <>
                                    <Power className="mr-2 h-4 w-4" />
                                    Enable User
                                </>
                            ) : (
                                <>
                                    <PowerOff className="mr-2 h-4 w-4" />
                                    Disable User
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user&apos;s account and associated data from the database.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
