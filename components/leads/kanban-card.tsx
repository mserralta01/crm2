"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Calendar,
  Building2,
  DollarSign,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  value: string;
}

interface KanbanCardProps {
  id: string;
  lead: Lead;
  columnColor: string;
}

export function KanbanCard({ id, lead, columnColor }: KanbanCardProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on interactive elements
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('button') || e.target.closest('[role="menuitem"]'))
    ) {
      return;
    }
    
    // Add console log for debugging
    console.log('Card clicked, navigating to:', `/dashboard/leads/${lead.id}`);
    
    // Navigate to lead detail page
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
      ref={setNodeRef}
      style={style}
      className="p-4 bg-card hover:shadow-md transition-shadow border border-slate-200 cursor-pointer select-none"
      onClick={handleCardClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-base mb-1">{lead.name}</h4>
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="w-4 h-4 mr-1" />
            {lead.company}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/leads/${lead.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/leads/${lead.id}?edit=true`)}>
              Edit Lead
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center space-x-2 mb-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-slate-100"
          title={lead.email}
          onClick={handleEmailClick}
        >
          <Mail className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-slate-100"
          title={lead.phone}
          onClick={handlePhoneClick}
        >
          <Phone className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center text-emerald-600 font-medium">
          <DollarSign className="w-4 h-4 mr-1" />
          {lead.value}
        </div>
        <div className="flex items-center text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          <span>2 days ago</span>
        </div>
      </div>
    </Card>
  );
}