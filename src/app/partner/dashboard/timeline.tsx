

import { CheckCircle, MessageSquare, User, AlertTriangle, FileUp, CornerDownRight } from "lucide-react";
import React from 'react';

const iconMap: { [key: string]: React.ReactElement } = {
  submitted: <CheckCircle className="h-5 w-5 text-white" />,
  comment: <MessageSquare className="h-5 w-5 text-white" />,
  required: <AlertTriangle className="h-5 w-5 text-white" />,
  updated: <User className="h-5 w-5 text-white" />,
  upload: <FileUp className="h-5 w-5 text-white" />,
};

const iconBgMap: { [key: string]: string } = {
  submitted: 'bg-green-500',
  comment: 'bg-blue-500',
  required: 'bg-yellow-500',
  updated: 'bg-gray-500',
  upload: 'bg-purple-500',
};


export type TimelineEvent = {
    icon: string;
    title: string;
    actor: string;
    date: string; // ISO 8601 date string
    content: string;
    category?: string;
};

type TimelineProps = {
    events: TimelineEvent[];
};

const SubEvent = ({ event }: { event: TimelineEvent }) => (
    <div className="flex gap-3 mt-3 pl-4 border-l-2 border-dashed ml-5">
         <CornerDownRight className="h-4 w-4 text-muted-foreground mt-1" />
         <div className="flex-1">
            <p className="font-medium text-sm">{event.title}</p>
             <p className="text-xs text-muted-foreground">
                By {event.actor} on {new Date(event.date).toLocaleString()}
            </p>
            <p className="mt-1 text-sm">{event.content}</p>
        </div>
    </div>
)

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity to display yet.</p>;
  }
  
  // Create a sorted copy of the events
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group events by category
  const groupedEvents: { parent: TimelineEvent, children: TimelineEvent[] }[] = [];
  const processedIndices = new Set<number>();

  sortedEvents.forEach((event, index) => {
      if (processedIndices.has(index)) return;

      if (event.category) {
          // This is a potential parent event
          const children: TimelineEvent[] = [];
          // Find all subsequent events in the same category
          for (let i = index + 1; i < sortedEvents.length; i++) {
              if (processedIndices.has(i)) continue;
              const subEvent = sortedEvents[i];
              if (subEvent && subEvent.category === event.category) {
                  // If we find another parent-type event for the same category, stop grouping.
                  if (subEvent.icon === 'required' || subEvent.icon === 'submitted') {
                      break;
                  }
                  children.push(subEvent);
                  processedIndices.add(i);
              }
          }
          groupedEvents.push({ parent: event, children });
      } else {
          // Event without a category is a standalone event
          groupedEvents.push({ parent: event, children: [] });
      }
      processedIndices.add(index);
  });
  
  return (
    <div className="space-y-8">
      {groupedEvents.reverse().map(({ parent, children }, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgMap[parent.icon] || 'bg-gray-400'}`}
            >
              {iconMap[parent.icon] || <User className="h-5 w-5 text-white" />}
            </span>
            {index < groupedEvents.length - 1 && (
              <div className="w-px h-full bg-border" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{parent.title}</p>
                    <p className="text-sm text-muted-foreground">
                        By {parent.actor} on {new Date(parent.date).toLocaleString()}
                    </p>
                  </div>
                  {parent.category && (
                    <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{parent.category}</span>
                  )}
              </div>
              <p className="mt-2 text-sm">{parent.content}</p>

              {children.length > 0 && (
                <div className="mt-4 space-y-2">
                    {children.map((childEvent, childIndex) => (
                        <SubEvent key={childIndex} event={childEvent} />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
