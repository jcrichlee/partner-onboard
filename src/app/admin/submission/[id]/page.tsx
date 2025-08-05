
'use client'
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/app/partner/dashboard/timeline"; 
import { useEffect, useState, use, useMemo } from "react";
import { getSubmissionById, OnboardingSubmission, updateSubmission, ChatMessage, TimelineEvent, getAllUsers, UserProfile, updateUser, SectionStatus } from "@/lib/firestore";
import { ArrowLeft, File as FileIcon, Eye, CheckCircle, XCircle, Link as LinkIcon, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth-client";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const sectionFieldGroups = {
    "Company Information": [],
    "Compliance": [
        { label: "PEP Disclosure", key: "pepDisclosure" },
        { label: "PEP Details", key: "pepDetails", condition: (s: OnboardingSubmission) => s.pepDisclosure === 'yes' }
    ],
    "Security": [
        { label: "Has Dedicated Compliance Officer?", key: "hasComplianceOfficer" },
        { label: "Undergoes Regular Security Audits?", key: "hasSecurityAudits" }
    ],
    "Attestations": []
}

const allSections = ["Company Information", "Compliance", "Security", "Attestations"];

function SubmissionDetailSkeleton() {
  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center h-16">
          <Skeleton className="h-8 w-48" />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="container h-full">
          <div className="grid lg:grid-cols-3 gap-8 h-full">
            <ScrollArea className="lg:col-span-2">
              <div className="py-8 space-y-8">
                {/* Partner Info Card Skeleton */}
                <Card className="rounded-xl shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
                {/* Category Card Skeletons */}
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="rounded-xl shadow-md">
                    <CardHeader>
                      <Skeleton className="h-6 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                       <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6 mt-4">
                        <Skeleton className="h-20 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <div className="lg:col-span-1 py-8">
                <div className="sticky top-24 h-[calc(100vh-8rem)]">
                    <Card className="rounded-xl shadow-md h-full flex flex-col">
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <ScrollArea className="flex-1">
                          <CardContent>
                              <div className="space-y-8">
                                  {[...Array(3)].map((_, i) => (
                                      <div key={i} className="flex gap-4">
                                          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                          <div className="flex-1 space-y-2">
                                              <Skeleton className="h-4 w-full" />
                                              <Skeleton className="h-4 w-2/3" />
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </CardContent>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [submission, setSubmission] = useState<OnboardingSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});
  const { userProfile } = useAuth();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const router = useRouter();
  const resolvedParams = use(params) as { id: string };

  useEffect(() => {
    const id = resolvedParams.id;
    if (!id) return;
    async function fetchSubmissionAndUsers() {
      const [sub, users] = await Promise.all([
        getSubmissionById(id),
        getAllUsers(),
      ]);
      setSubmission(sub);
      setAllUsers(users);
      setLoading(false);
    }
    fetchSubmissionAndUsers();
  }, [resolvedParams.id]);
  
  const getGroupedFiles = useMemo(() => {
    const categories = ["Company Information", "Compliance", "Security", "Attestations"];
    const grouped = categories.reduce((acc, category) => {
        acc[category] = [];
        return acc;
    }, {} as Record<string, any[]>);
    
    if (!submission?.files) return grouped;
    
    const fileGroup = submission.files.reduce((acc, file) => {
      const category = file.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(file);
      return acc;
    }, grouped);

    // Ensure all defined categories exist, even if they have no files
    categories.forEach(cat => {
        if (!fileGroup[cat]) {
            fileGroup[cat] = [];
        }
    });
    
    return fileGroup;

  }, [submission?.files]);

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

  
  const handlePreviewClick = (url: string) => {
    setPreviewFileUrl(url);
    setIsPreviewOpen(true);
  }
  
  const handleCommentChange = (category: string, text: string) => {
    setComments(prev => ({...prev, [category]: text}));
  }

  const handleAction = async (category: string, action: 'approve' | 'requestChanges') => {
    if (!submission || !userProfile) return;

    let newChatMessages = submission.chat || [];
    let finalStatus = submission.status;
    const newStatus = action === 'approve' ? 'approved' : 'changesRequested';
    const newSectionStatus = { ...submission.sectionStatus, [category]: newStatus };

    // If approving, resolve all chats in this category
    if (action === 'approve') {
        newChatMessages = newChatMessages.map(msg => 
            msg.category === category ? { ...msg, resolved: true } : msg
        );
         // Check if all sections are now approved
        const allApproved = allSections.every(sec => newSectionStatus[sec] === 'approved');
        if (allApproved) {
            finalStatus = 'Approved';
        }
    } else {
        finalStatus = 'Requires Attention';
    }
    
    const commentText = comments[category];

    const newTimelineEvent: TimelineEvent = {
      icon: action === 'approve' ? 'submitted' : 'required',
      title: action === 'approve' ? `Section Approved` : `Changes Requested`,
      category: category,
      actor: userProfile.email,
      date: new Date().toISOString(),
      content: action === 'approve' 
        ? `The '${category}' section has been approved.`
        : commentText || 'Admin requested changes for this section.',
    };

    if (action === 'requestChanges' && commentText) {
        const mentionRegex = /@(\S+@\S+\.\S+)/g;
        const mentionedEmails = commentText.match(mentionRegex)?.map(m => m.substring(1)) || [];
        const mentionedUserIds = allUsers
            .filter(u => mentionedEmails.includes(u.email))
            .map(u => u.id);

        const newChatMessage: ChatMessage = {
            from: 'admin',
            text: commentText,
            time: new Date().toISOString(),
            category: category,
            adminName: userProfile.email,
            resolved: false,
            mentions: mentionedUserIds,
        };
        newChatMessages.push(newChatMessage);

        // Create notifications for mentioned users
        for (const userId of mentionedUserIds) {
            const mentionedUser = allUsers.find(u => u.id === userId);
            if (mentionedUser) {
                 const notification = {
                    id: crypto.randomUUID(),
                    message: `You were mentioned by ${userProfile.email} in ${submission.partnerName}'s submission.`,
                    link: `/admin/submission/${submission.id}`,
                    read: false,
                    createdAt: new Date().toISOString()
                };
                const updatedNotifications = [...(mentionedUser.notifications || []), notification];
                await updateUser(userId, { notifications: updatedNotifications });
            }
        }
    }

    const updatedSubmission: Partial<OnboardingSubmission> = {
        sectionStatus: newSectionStatus as Record<string, SectionStatus>,
        timeline: [...(submission.timeline || []), newTimelineEvent],
        chat: newChatMessages,
        status: finalStatus,
    };

    await updateSubmission(submission.id, updatedSubmission);
    setSubmission(prev => prev ? { ...prev, ...updatedSubmission } : null);
    setComments(prev => ({ ...prev, [category]: '' }));
  };

  if (loading) {
    return <SubmissionDetailSkeleton />;
  }

  if (!submission) {
    return <div className="flex items-center justify-center min-h-screen">Submission not found.</div>;
  }

  return (
    <div className="flex flex-col h-screen">
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Document Preview</DialogTitle>
                </DialogHeader>
                {previewFileUrl && (
                    <iframe src={previewFileUrl} className="w-full h-full border-0" title="Document Preview" />
                )}
            </DialogContent>
        </Dialog>

        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container flex items-center h-16">
                 <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Submissions
                </Button>
            </div>
        </header>

        <main className="flex-1 overflow-hidden">
            <div className="container h-full">
                <div className="grid lg:grid-cols-3 gap-8 h-full">
                    <ScrollArea className="lg:col-span-2">
                        <div className="py-8 space-y-8">
                            <Card className="rounded-xl shadow-md">
                              <CardHeader>
                                  <div className="flex items-center justify-between">
                                  <div>
                                      <CardTitle className="font-headline text-2xl">
                                          {submission.partnerName}
                                      </CardTitle>
                                      <CardDescription>
                                        {submission.partnerEmail}
                                      </CardDescription>
                                  </div>
                                  <Badge variant={getStatusVariant(submission.status)} className="text-base">
                                      {submission.status}
                                  </Badge>
                                  </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  {submission.companyUrl && (
                                      <div className="flex items-center gap-2 text-sm">
                                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                          <a href={submission.companyUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                              {submission.companyUrl}
                                          </a>
                                      </div>
                                  )}
                                  {submission.businessDescription && (
                                      <div className="space-y-2">
                                          <p className={cn("text-sm text-muted-foreground", !isDescriptionExpanded && "line-clamp-3")}>
                                              {submission.businessDescription}
                                          </p>
                                          <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                                              {isDescriptionExpanded ? 'View Less' : 'View More'}
                                          </Button>
                                      </div>
                                  )}
                              </CardContent>
                            </Card>

                            {Object.entries(getGroupedFiles).map(([category, files]) => {
                                const status = submission.sectionStatus?.[category];
                                const isApproved = status === 'approved';
                                const fields = sectionFieldGroups[category as keyof typeof sectionFieldGroups] || [];
                                const categoryChat = groupedChat[category] || [];
                                const isResolved = categoryChat.every(m => m.resolved);

                                if (files.length === 0 && fields.length === 0) {
                                    return null;
                                }

                                return (
                                    <Card key={category} className={cn("rounded-xl shadow-md", isApproved && "border-green-500")}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                              <CardTitle className="font-headline text-xl">{category}</CardTitle>
                                              {status === 'approved' && <Badge variant="green">Approved</Badge>}
                                              {status === 'changesRequested' && <Badge variant="destructive">Changes Requested</Badge>}
                                            </div>
                                        </CardHeader>
                                         <CardContent className="space-y-4">
                                            {fields.length > 0 && (
                                                <div className="space-y-3 rounded-md border p-4">
                                                    <h4 className="font-medium text-sm text-muted-foreground">Submitted Information</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                        {fields.map(field => {
                                                            const shouldRender = !('condition' in field) || field.condition(submission);
                                                            if (!shouldRender) return null;
                                                            
                                                            const value = submission[field.key as keyof OnboardingSubmission];
                                                            const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

                                                            return (
                                                                <div key={field.key}>
                                                                    <p className="font-semibold">{field.label}</p>
                                                                    <p className="text-muted-foreground">{String(displayValue || 'Not provided')}</p>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {files.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm text-muted-foreground">Uploaded Documents</h4>
                                                    {files.map(file => (
                                                        <div
                                                            key={file.storagePath}
                                                            className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm"
                                                        >
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                                                                <span className="font-medium truncate">{file.name}</span>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handlePreviewClick(file.url)}>
                                                                <Eye className="h-4 w-4"/>
                                                                <span className="sr-only">Preview {file.name}</span>
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {files.length === 0 && fields.length === 0 && (
                                                <p className="text-sm text-muted-foreground">No information or documents submitted for this section.</p>
                                            )}
                                        </CardContent>
                                        
                                        {(categoryChat.length > 0) && (
                                            <>
                                            <Separator />
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-medium text-sm text-muted-foreground">Conversation Thread</h4>
                                                        {isResolved && <Badge variant="green">Resolved</Badge>}
                                                    </div>
                                                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                                        {categoryChat.map((message, index) => (
                                                             <div key={index} className={cn("flex items-start gap-3", message.from === 'admin' ? "justify-start" : "justify-end")}>
                                                                 {message.from === 'admin' && (
                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-xs">
                                                                        {message.adminName?.substring(0, 2).toUpperCase() || 'AD'}
                                                                    </div>
                                                                 )}
                                                                 <div className={cn("rounded-lg px-3 py-2 max-w-sm", message.from === 'partner' ? "bg-muted" : "bg-primary/10")}>
                                                                    <p className="text-sm font-semibold">{message.from === 'admin' ? message.adminName : 'Partner'}</p>
                                                                    <p className="text-sm">{message.text}</p>
                                                                    <p className="text-xs text-muted-foreground text-right mt-1">{format(new Date(message.time), 'p')}</p>
                                                                 </div>
                                                             </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                           </>
                                        )}

                                        {!isApproved && (
                                            <CardFooter className="flex flex-col items-start gap-4 border-t pt-6 mt-4">
                                                <div className="w-full space-y-2">
                                                    <label htmlFor={`comment-${category}`} className="text-sm font-medium">Add to Conversation (use @ to mention)</label>
                                                    <Textarea 
                                                        id={`comment-${category}`} 
                                                        placeholder={`Send a message regarding the ${category} section...`} 
                                                        value={comments[category] || ''}
                                                        onChange={(e) => handleCommentChange(category, e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex justify-end w-full gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleAction(category, 'requestChanges')}
                                                    >
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Send Message
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm"
                                                        onClick={() => handleAction(category, 'requestChanges')}
                                                        disabled={!comments[category]}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Request Changes
                                                    </Button>
                                                    <Button 
                                                        variant="green" 
                                                        size="sm"
                                                        onClick={() => handleAction(category, 'approve')}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Approve Section
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>
                    </ScrollArea>
                     <div className="lg:col-span-1 py-8">
                        <div className="sticky top-24 h-[calc(100vh-8rem)]">
                             <Card className="rounded-xl shadow-md h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle className="font-headline">Activity &amp; Audit Log</CardTitle>
                                    <CardDescription>Overall application history.</CardDescription>
                                </CardHeader>
                                <ScrollArea className="flex-1">
                                    <CardContent>
                                        <Timeline events={submission.timeline} />
                                    </CardContent>
                                </ScrollArea>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  )
}
