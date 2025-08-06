
'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase/client";
import { LogOut, Bell, User } from "lucide-react";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-client";
import { UserNotification, updateUser } from "@/lib/firestore";
import { cn } from "@/lib/utils";

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
                     [...userProfile.notifications].reverse().map(notification => (
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


export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out: ", error);
      // Optionally, show a toast message on error
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
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}
