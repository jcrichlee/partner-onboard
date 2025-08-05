

import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useSubmission } from "@/hooks/use-submission-provider";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { format } from 'date-fns';
import { useState } from "react";
import { ChatMessage, TimelineEvent } from "@/lib/firestore";
import { Textarea } from "@/components/ui/textarea";

export function ChatThread({ category, messages, onMessageSent }: { category: string, messages: ChatMessage[], onMessageSent: () => void }) {
  const { submission, update } = useSubmission();
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (!submission || !newMessage.trim()) return;

    const chatMessage: ChatMessage = {
      from: 'partner',
      text: newMessage,
      time: new Date().toISOString(),
      category: category,
      resolved: false,
    };
    
    const timelineEvent: TimelineEvent = {
        icon: 'comment',
        title: 'Partner Replied',
        actor: 'Partner',
        date: new Date().toISOString(),
        content: newMessage,
        category: category,
    }

    const updatedChat = [...(submission.chat || []), chatMessage];
    const updatedTimeline = [...(submission.timeline || []), timelineEvent];

    await update({ chat: updatedChat, timeline: updatedTimeline });
    setNewMessage("");
    onMessageSent(); // Callback to notify parent component
  };

  const isResolved = messages.every(m => m.resolved);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const time = message.time ? format(new Date(message.time), 'p') : '';
            return (
              <div
                key={index}
                className={cn(
                  "flex items-end gap-2",
                  message.from === 'partner' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-xs",
                    message.from === 'partner'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  )}
                >
                  <p className="text-xs font-semibold mb-1">{message.from === 'admin' ? message.adminName : 'You'}</p>
                  <p className="text-sm">{message.text}</p>
                  <p className={cn(
                      "text-xs mt-1 text-right",
                       message.from === 'partner' ? 'text-primary-foreground/70' : 'text-muted-foreground' 
                    )}>
                      {time}
                  </p>
                </div>
              </div>
            )
          })}
           {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    No messages in this thread yet.
                </div>
            )}
        </div>
      </ScrollArea>
      <div className="border-t bg-background">
        {isResolved ? (
            <div className="text-center text-sm text-green-600 font-semibold p-4 rounded-b-xl bg-green-50">
                This conversation has been resolved.
            </div>
        ) : (
            <div className="relative">
                <Textarea 
                    placeholder="Type your message..." 
                    className="pr-12 min-h-[60px] border-0" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <Button 
                    size="icon" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
