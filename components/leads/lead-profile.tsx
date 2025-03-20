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
  X,
  Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { Lead } from '@/data/leads';
import { useRouter } from 'next/navigation';
import { formatPhoneNumber, isValidPhoneNumber } from '@/app/utils/formatters';
import { updateLead, deleteLead } from '@/lib/services/leads-service';
import { toast } from '@/hooks/use-toast';

interface LeadProfileProps {
  lead: Lead;
  isEditMode?: boolean;
}

export function LeadProfile({ lead, isEditMode = false }: LeadProfileProps) {
  const router = useRouter();
  const [editedLead, setEditedLead] = useState({ ...lead });
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsEditing(isEditMode);
  }, [isEditMode]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const handleSave = async () => {
    try {
      // Format the phone number before saving
      const formattedPhone = formatPhoneNumber(editedLead.phone);
      const updatedLead = {
        ...editedLead,
        phone: formattedPhone
      };
      
      // Save changes to the backend
      await updateLead(lead.id, updatedLead);
      
      // Show success message
      toast({
        title: "Success",
        description: "Lead information has been updated.",
      });
      
      // After saving, exit edit mode and navigate to the non-edit view
      setIsEditing(false);
      router.push(`/dashboard/leads/${lead.id}`);
    } catch (error) {
      console.error('Error updating lead:', error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to update lead information. Please try again.",
        variant: "destructive",
      });
    }
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

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isValidPhoneNumber(value)) {
      setEditedLead(prev => ({ 
        ...prev, 
        phone: formatPhoneNumber(value)
      }));
    }
  };

  const handleStatusChange = (value: string) => {
    setEditedLead(prev => ({ ...prev, status: value }));
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLead(lead.id);
      
      toast({
        title: "Success",
        description: "Lead has been deleted successfully.",
      });
      
      // Redirect to leads list after deletion
      router.push('/dashboard/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete the lead. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Basic Info */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                value={editedLead.firstName} 
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                value={editedLead.lastName} 
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
            <h2 className="text-2xl font-bold mb-2">{lead.firstName} {lead.lastName}</h2>
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
                  onBlur={handlePhoneBlur}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Format: +1 (###) ###-####
                </div>
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

        {/* Action Buttons */}
        <div className="space-y-3">
          {isEditing ? (
            <div className="flex gap-2">
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => router.push(`/dashboard/leads/${lead.id}?edit=true`)}
              >
                Edit Profile
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Lead
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the lead
                      and all associated information.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}