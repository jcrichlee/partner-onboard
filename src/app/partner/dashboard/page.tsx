

'use client'
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { ChatThread } from "./chat";
import { Timeline } from "./timeline";
import { useEffect, useState, useMemo } from "react";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";
import { ChatMessage } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { ArrowRight, Edit, CheckCircle2, FileText, ShieldCheck, Award, AlertTriangle, MessageSquare } from "lucide-react";
import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import { SubmissionProvider } from "@/hooks/use-submission-provider";
import { useSubmission } from "@/hooks/use-submission-provider";

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

const sections = [
  { name: "Company Information", category: "Company Information", requiredFields: 4, href: "/onboarding/company-info", icon: FileText },
  { name: "Ownership & Compliance", category: "Compliance", requiredFields: 3, href: "/onboarding/compliance", icon: ShieldCheck },
  { name: "Security & Governance", category: "Security", requiredFields: 3, href: "/onboarding/security", icon: ShieldCheck },
  { name: "Attestations", category: "Attestations", requiredFields: 2, href: "/onboarding/attestations", icon: Award },
];

function PartnerDashboardView() {
  const { submission, isLoading } = useSubmission();
  const [user, setUser] = useState<User | null>(null);
  const [activeChatCategory, setActiveChatCategory] = useState(sections[0]?.category || 'Company Information');


  const [newAdminMessages, setNewAdminMessages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const groupedChat = useMemo(() => {
    if (!submission?.chat) return {};
    return submission.chat.reduce((acc, message) => {
        const { category } = message;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(message);
        return acc;
    }, {} as Record<string, ChatMessage[]>);
  }, [submission?.chat]);

  useEffect(() => {
    const newMessagesStatus: Record<string, boolean> = {};
    for (const section of sections) {
        const chat = groupedChat[section.category];
        if (chat && chat.length > 0) {
            const lastMessage = chat[chat.length - 1];
            // There's a new message if the last message is from admin and the thread is not resolved.
            if (lastMessage && lastMessage.from === 'admin' && !chat.every(m => m.resolved)) {
                 newMessagesStatus[section.category] = true;
            }
        }
    }
    setNewAdminMessages(newMessagesStatus);
  }, [groupedChat]);

  const handleCategoryClick = (category: string) => {
    setActiveChatCategory(category);
    setNewAdminMessages(prev => ({...prev, [category]: false })); // Mark as read on click
  }
  
  const getUploadedCount = (category: string) => {
    if (!submission?.files) return 0;
    const distinctFieldNames = new Set(
      submission.files
        .filter(file => file.category === category)
        .map(file => file.fieldName)
    );
    return distinctFieldNames.size;
  };

  const getResumeLink = () => {
    if (!submission) return "/onboarding/company-info";

    for (const section of sections) {
        const uploadedCount = getUploadedCount(section.category);
        if (uploadedCount < section.requiredFields) {
            return section.href;
        }
    }

    return "/confirmation";
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><div className="text-center">Loading dashboard...</div></div>;
  }
  
  if (!user) {
    // This can be a redirect to login in the future
    return <div className="flex items-center justify-center min-h-[40vh]"><div className="text-center">Please log in to view your dashboard.</div></div>;
  }

  if (!submission) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
        <p className="text-muted-foreground mb-4">You have not started an application yet.</p>
        <Button asChild>
          <Link href="/onboarding/company-info">
            Start Your Application
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-2xl">
                  {submission.partnerName}
                </CardTitle>
                 <CardDescription>
                   Application Status
                </CardDescription>
              </div>
              <Badge variant={getStatusVariant(submission.status)} className="text-base">
                {submission.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {sections.map(section => {
                const uploadedCount = getUploadedCount(section.category);
                const isComplete = uploadedCount >= section.requiredFields;
                const progress = (uploadedCount / section.requiredFields) * 100;
                const sectionStatus = submission.sectionStatus?.[section.category];

                return (
                    <Card key={section.name} className="rounded-lg shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">{section.name}</CardTitle>
                                {sectionStatus === 'changesRequested' ? (
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                ) : (
                                    <section.icon className={`h-4 w-4 ${isComplete ? 'text-green-500' : 'text-muted-foreground'}`} />
                                )}
                            </div>
                            {sectionStatus === 'changesRequested' && <Badge variant="destructive" className="mt-1">Changes Requested</Badge>}
                            {sectionStatus === 'approved' && <Badge variant="default" className="mt-1">Approved</Badge>}
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{uploadedCount} of {section.requiredFields} uploaded</div>
                             <Progress value={progress} className="w-full h-2 mt-2" />
                        </CardContent>
                        <CardFooter>
                           <Button variant="outline" size="sm" asChild>
                                <Link href={section.href}>
                                    <Edit className="mr-2 h-3 w-3" />
                                    {sectionStatus === 'changesRequested' ? 'Address Changes' : (isComplete ? 'View' : 'Edit')}
                                </Link>
                           </Button>
                        </CardFooter>
                    </Card>
                )
            })}
          </CardContent>
          <CardFooter className="pt-6">
                {(submission.status === 'in-progress' || submission.status === 'requires-attention') && (
                    <Button asChild size="lg" className="w-full sm:w-auto rounded-xl shadow-md">
                        <Link href={getResumeLink()}>
                            Resume Application
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                )}
                 {(submission.status === 'submitted' || submission.status === 'approved') && (
                    <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto rounded-xl shadow-md">
                        <Link href="/confirmation">
                            Review Full Application
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                )}
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-8">
         <div className="sticky top-24 space-y-8">
            <Card className="rounded-xl shadow-md">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Conversations
                    </CardTitle>
                    <CardDescription>
                    Communicate with the onboarding team about specific sections.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-[60vh] p-0">
                     <div className="flex flex-wrap p-4 gap-4">
                        {sections.map(section => {
                            const isActive = activeChatCategory === section.category;
                            const hasNew = newAdminMessages[section.category];
                            return (
                                <Button 
                                    key={section.category} 
                                    variant={isActive ? "default" : "outline"}
                                    size="sm"
                                    className="relative"
                                    onClick={() => handleCategoryClick(section.category)}
                                >
                                    {section.name.split(' ')[0]}
                                    {hasNew && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive"></span>}
                                </Button>
                            )
                        })}
                    </div>
                    <div className="flex-1 border-t">
                        <ChatThread 
                            category={activeChatCategory} 
                            messages={groupedChat[activeChatCategory] || []}
                            onMessageSent={() => setNewAdminMessages(prev => ({...prev, [activeChatCategory]: false}))}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-xl shadow-md">
            <CardHeader>
                <CardTitle className="font-headline">
                Activity &amp; Audit Log
                </CardTitle>
                <CardDescription>
                Track all changes and comments related to your application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Timeline events={submission.timeline} />
            </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}

export default function PartnerDashboard() {
  return (
    <SubmissionProvider>
      <PartnerDashboardView />
    </SubmissionProvider>
  )
}
