"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Pin, 
  PinOff, 
  Trash2,
  MoreHorizontal,
  Clock 
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface LeadNoteProps {
  id: number;
  title: string;
  description: string;
  date: string;
  isPinned?: boolean;
  onPin: (id: number, isPinned: boolean) => void;
  onDelete: (id: number) => void;
}

export function LeadNote({ 
  id, 
  title, 
  description, 
  date, 
  isPinned = false,
  onPin,
  onDelete
}: LeadNoteProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format date to readable format
  const formatNoteDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  return (
    <Card 
      className={cn(
        "p-4 transition-colors", 
        isPinned ? "bg-amber-50/80 border-amber-200" : "bg-muted/50",
        isHovered && "shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-2">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{description}</p>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <Clock className="w-3 h-3 mr-1" />
            {formatNoteDate(date)}
            {isPinned && (
              <span className="ml-2 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm text-[10px] font-medium uppercase">
                Pinned
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-muted-foreground", 
              isPinned ? "text-amber-600" : "",
              !isHovered && !isPinned && "opacity-0"
            )}
            onClick={() => onPin(id, !isPinned)}
            title={isPinned ? "Unpin note" : "Pin note"}
          >
            {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 text-muted-foreground",
                  !isHovered && "opacity-0"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onPin(id, !isPinned)}
                className="cursor-pointer"
              >
                {isPinned ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    <span>Unpin</span>
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    <span>Pin</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(id)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
} 