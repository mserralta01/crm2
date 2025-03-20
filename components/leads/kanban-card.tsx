"use client";

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Calendar,
  Building2,
  DollarSign,
  Clock,
  GripVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Lead } from '@/data/leads';
import { formatCurrency } from '@/lib/utils';

interface KanbanCardProps {
  id: string;
  lead: Lead;
  columnColor: string;
  isDragging?: boolean;
}

// Optimized KanbanCard component with professional design
export function KanbanCard({ id, lead, columnColor, isDragging }: KanbanCardProps) {
  const router = useRouter();
  
  // Extract the color from the gradient string for the avatar
  const colorClass = columnColor.split(' ')[1].replace('from-', 'bg-');
  
  // Compute name from firstName and lastName
  const name = lead.firstName && lead.lastName 
    ? `${lead.firstName} ${lead.lastName}`
    : lead.firstName || lead.lastName || 'Unnamed Lead';
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on interactive elements
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('button') || e.target.closest('[role="menuitem"]'))
    ) {
      return;
    }
    
    // Navigate to lead detail page using the ID
    router.push(`/dashboard/leads/${lead.id}`);
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:${lead.email}`;
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${lead.phone}`;
  };

  return (
    <Card 
      className={`shadow-sm hover:shadow-md transition-shadow bg-white group cursor-pointer touch-manipulation select-none ${
        isDragging ? 'opacity-70 shadow-lg' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="absolute top-0 left-0 w-6 h-full bg-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <GripVertical className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <CardContent className="p-4 pt-4 pl-8">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <div className={`h-full w-full flex items-center justify-center ${colorClass} text-white font-medium`}>
                {name.charAt(0) || '?'}
              </div>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{name}</h3>
              <p className="text-xs text-muted-foreground">{lead.company}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-muted/30 text-xs">
            {formatCurrency(lead.value || 0)}
          </Badge>
        </div>
        
        <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-3">
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[180px]">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 pl-8 border-t flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>
            {lead.lastActivity 
              ? formatDistanceToNow(new Date(lead.lastActivity), { addSuffix: true })
              : 'No activity'}
          </span>
        </div>
        <button 
          className="hover:bg-muted/50 p-1 rounded-full"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3 w-3" />
        </button>
      </CardFooter>
    </Card>
  );
}