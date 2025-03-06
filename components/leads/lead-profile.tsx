"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Lead } from '@/data/leads';

interface LeadProfileProps {
  lead: Lead;
}

export function LeadProfile({ lead }: LeadProfileProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-2xl font-bold mb-2">{lead.name}</h2>
          <div className="flex items-center text-muted-foreground">
            <Building2 className="w-4 h-4 mr-2" />
            {lead.company}
          </div>
        </div>

        {/* Status and Value */}
        <div className="space-y-2">
          <Badge variant="secondary" className="w-full justify-center text-sm">
            {lead.status}
          </Badge>
          <div className="flex items-center justify-center text-xl font-bold text-primary">
            <DollarSign className="w-5 h-5" />
            {lead.value}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="font-semibold">Contact Information</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href={`mailto:${lead.email}`}>
                <Mail className="w-4 h-4 mr-2" />
                {lead.email}
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href={`tel:${lead.phone}`}>
                <Phone className="w-4 h-4 mr-2" />
                {lead.phone}
              </a>
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="font-semibold">Timeline</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Created: {formatDate(lead.createdAt)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Last Activity: {format(new Date(lead.lastActivity), 'MMM d, h:mm a')}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full">Schedule Meeting</Button>
          <Button variant="outline" className="w-full">Send Email</Button>
        </div>
      </div>
    </Card>
  );
}