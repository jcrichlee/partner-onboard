
'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, User, PlusCircle, LogOut, Users, UserCog, Files, CheckCircle, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { OnboardingSubmission, UserProfile, DashboardMetrics, UserNotification } from "@/lib/firestore";
import { getSubmissions, getDashboardMetrics, updateUser } from "@/lib/firestore";
import { formatBytes } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth-client";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";


const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Approved':
            return 'default';
        case 'Pending Review':
        case 'Submitted':
            return 'secondary';
        case 'Requires Attention':
            return 'destructive';
        default:
            return 'outline';
    }
}

function NotificationBell() {
    const { userProfile, loading } = useAuth();
    const router = useRouter();

    if (loading || !userProfile) {
        return (
            <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
            </Button>
        );
    }

    const unreadNotifications = userProfile.notifications?.filter(n => !n.read) || [];

    const handleNotificationClick = async (notification: UserNotification) => {
        if (!userProfile?.notifications) return;

        const updatedNotifications = userProfile.notifications.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
        );

        await updateUser(userProfile.id, { notifications: updatedNotifications });
        router.push(notification.link);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications.length > 0 && (
                        <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-destructive animate-pulse"></span>
                    )}
                    <span className="sr-only">Open notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userProfile.notifications && userProfile.notifications.length > 0 ? (
                    userProfile.notifications.map(notification => (
                        <DropdownMenuItem
                            key={notification.id}
                            className={cn("cursor-pointer whitespace-normal", !notification.read && "font-bold")}
                            onClick={() => handleNotificationClick(notification)}
                        >
                           {notification.message}
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>No notifications yet.</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(7)].map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-5 w-20" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { userProfile: currentUser, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPartners: 0,
    completedOnboards: 0,
    totalAdmins: 0,
    totalFileSize: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [fetchedSubmissions, fetchedMetrics] = await Promise.all([
        getSubmissions(),
        getDashboardMetrics(),
    ]);
    setSubmissions(fetchedSubmissions);
    setMetrics(fetchedMetrics);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          if (userData.role === 'admin' || userData.role === 'superadmin') {
            await fetchData();
          } else {
            router.push('/login');
          }
        } else {
           router.push('/login');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    
    // Refetch data when the window gets focus
    window.addEventListener('focus', fetchData);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', fetchData);
    };
  }, [router, fetchData]);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out: ", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
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
            OnboardLink
          </Link>
          <nav className="ml-auto flex items-center gap-4">
             {currentUser?.canManageUsers && (
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
            )}
            <span className="text-sm font-medium text-muted-foreground">Admin Portal</span>
            <NotificationBell />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                   <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
        {loading || authLoading ? (
            <DashboardSkeleton />
        ) : (
        <div className="container mx-auto py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                An overview of the partner onboarding portal.
              </p>
            </div>
             <div className="flex gap-2">
              {(currentUser?.role === 'superadmin' || currentUser?.canManageUsers) && (
                <>
                  {currentUser.role === 'superadmin' && (
                    <Button asChild variant="black" className="rounded-xl shadow-md">
                      <Link href="/admin/create-admin">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Admin
                      </Link>
                    </Button>
                  )}
                  <Button asChild className="rounded-xl shadow-md">
                    <Link href="/admin/create-partner">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Partner
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="rounded-xl shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalPartners}</div>
                </CardContent>
            </Card>
            <Card className="rounded-xl shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Onboards</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.completedOnboards}</div>
                </CardContent>
            </Card>
            <Card className="rounded-xl shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalAdmins}</div>
                </CardContent>
            </Card>
            <Card className="rounded-xl shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total File Size</CardTitle>
                    <Files className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatBytes(metrics.totalFileSize)}</div>
                </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl shadow-md">
             <CardHeader>
                <CardTitle className="font-headline">IMTO Submissions</CardTitle>
                <CardDescription>Manage and review all partner onboarding applications.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IMTO Name</TableHead>
                    <TableHead>Company Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Files Uploaded</TableHead>
                    <TableHead>Total Size</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/submission/${submission.id}`} className="hover:underline">
                          {submission.partnerName}
                        </Link>
                      </TableCell>
                       <TableCell>{submission.partnerEmail}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(submission.status)}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{submission.files?.length || 0}</TableCell>
                      <TableCell>
                        {formatBytes(submission.files?.reduce((acc, file) => acc + (file.size || 0), 0) || 0)}
                      </TableCell>
                      <TableCell>{new Date(submission.lastUpdated).toLocaleDateString()}</TableCell>
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
                             <DropdownMenuItem asChild>
                                <Link href={`/admin/submission/${submission.id}`}>View Submission</Link>
                              </DropdownMenuItem>
                            <DropdownMenuItem>
                              Generate Credentials
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Disable Partner
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        )}
      </main>
    </div>
  );
}
