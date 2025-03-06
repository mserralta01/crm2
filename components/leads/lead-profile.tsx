"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Calendar,
  Clock,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { Lead } from '@/data/leads';
import { useRouter } from 'next/navigation';

interface LeadProfileProps {
  lead: Lead;
  isEditMode?: boolean;
}

export function LeadProfile({ lead, isEditMode = false }: LeadProfileProps) {
  const router = useRouter();
  const [editedLead, setEditedLead] = useState({ ...lead });
  const [isEditing, setIsEditing] = useState(isEditMode);

  useEffect(() => {
    setIsEditing(isEditMode);
  }, [isEditMode]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const handleSave = () => {
    // Here you would typically save changes to your backend
    console.log('Saving lead:', editedLead);
    
    // After saving, exit edit mode and navigate to the non-edit view
    setIsEditing(false);
    router.push(`/dashboard/leads/${lead.id}`);
  };

  const handleCancel = () => {
    // Reset changes and exit edit mode
    setEditedLead({ ...lead });
    setIsEditing(false);
    router.push(`/dashboard/leads/${lead.id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedLead(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setEditedLead(prev => ({ ...prev, status: value }));
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Basic Info */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={editedLead.name} 
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                name="company" 
                value={editedLead.company} 
                onChange={handleChange}
              />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-2">{lead.name}</h2>
            <div className="flex items-center text-muted-foreground">
              <Building2 className="w-4 h-4 mr-2" />
              {lead.company}
            </div>
          </div>
        )}

        {/* Status and Value */}
        <div className="space-y-2">
          {isEditing ? (
            <>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={editedLead.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Negotiating">Negotiating</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-3">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  name="value"
                  value={editedLead.value}
                  onChange={handleChange}
                />
              </div>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="w-full justify-center text-sm">
                {lead.status}
              </Badge>
              <div className="flex items-center justify-center text-xl font-bold text-primary">
                <DollarSign className="w-5 h-5" />
                {lead.value}
              </div>
            </>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="font-semibold">Contact Information</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={editedLead.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={editedLead.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          ) : (
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
          )}
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
        {isEditing ? (
          <div className="flex space-x-2">
            <Button className="flex-1" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button className="w-full">Schedule Meeting</Button>
            <Button variant="outline" className="w-full">Send Email</Button>
          </div>
        )}
      </div>
    </Card>
  );
}