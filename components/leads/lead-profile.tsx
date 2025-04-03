"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Trash2,
  Plus,
  Tag,
  Settings,
  FileText,
  Users,
  Briefcase,
  Hash,
  Target,
  Clock8,
  ChevronDown,
  Pencil
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
import { PhoneInput, CountryStateInput } from '@/components/leads/phone-input';

// Define status color mapping
const STATUS_COLORS = {
  "New": "bg-blue-600",
  "Contacted": "bg-yellow-600",
  "Qualified": "bg-green-600",
  "Negotiating": "bg-purple-600",
  // Fallback for any other status
  "default": "bg-slate-600"
};

// Function to get status color class
function getStatusColorClass(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
}

interface LeadProfileProps {
  lead: Lead;
  isEditMode?: boolean;
}

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label?: string;
  placeholder?: string;
  type?: string;
}

function EditableField({ value, onSave, label, placeholder, type = 'text' }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update editValue when value prop changes to ensure consistency
  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue !== value) { // Only save if value has changed
      setIsSaving(true);
      try {
        await onSave(editValue);
      } catch (error) {
        console.error('Error saving field:', error);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value || '');
      setIsEditing(false);
    }
  };

  return (
    <div className="group w-full">
      {isEditing ? (
        <div className="w-full rounded-md">
          {label && <Label className="text-xs font-normal text-muted-foreground mb-1">{label}</Label>}
          <Input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`border-input w-full h-8 ${isSaving ? 'opacity-70' : ''}`}
            disabled={isSaving}
          />
          {isSaving && (
            <div className="text-xs text-muted-foreground mt-0.5">Saving...</div>
          )}
        </div>
      ) : (
        <div 
          className="w-full cursor-pointer transition-colors"
          onClick={() => setIsEditing(true)}
        >
          <div className="flex flex-col space-y-0.5">
            {label && (
              <span className="text-xs font-normal text-muted-foreground leading-tight">{label}</span>
            )}
            <span className={`${value ? "text-sm font-medium" : "text-muted-foreground italic text-sm"} truncate leading-snug`}>
              {value || placeholder || "Not specified"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function LeadProfile({ lead, isEditMode = false }: LeadProfileProps) {
  const router = useRouter();
  const [leadData, setLeadData] = useState({ ...lead });
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const handleFieldUpdate = async (field: string, value: string) => {
    try {
      // Handle nested fields (e.g. socialProfiles.linkedin)
      if (field.includes('.')) {
        const [objectName, propertyName] = field.split('.');
        const updatedLead = {
          ...leadData,
          [objectName]: {
            ...(leadData[objectName as keyof typeof leadData] as Record<string, string> || {}),
            [propertyName]: value
          }
        };
        setLeadData(updatedLead);
        await updateLead(lead.id, updatedLead);
      } else {
        // Handle special formatting for phone numbers
        if (field === 'phone' && isValidPhoneNumber(value)) {
          value = formatPhoneNumber(value);
        }
        
        // Special handling for tags field
        if (field === 'tags') {
          try {
            const parsedTags = JSON.parse(value);
            const updatedLead = {
              ...leadData,
              [field]: parsedTags
            };
            setLeadData(updatedLead);
            await updateLead(lead.id, updatedLead);
          } catch (e) {
            console.error('Invalid JSON for tags:', e);
            throw e; // Re-throw to be caught by the outer try/catch
          }
        } else {
          const updatedLead = {
            ...leadData,
            [field]: value
          };
          setLeadData(updatedLead);
          await updateLead(lead.id, updatedLead);
        }
      }

      toast({
        title: "Success",
        description: "Field updated successfully",
        duration: 2000,
      });
      
      return Promise.resolve(); // Explicitly return a resolved promise
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error); // Return a rejected promise to propagate the error
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLead(lead.id);
      toast({
        title: "Success",
        description: "Lead has been deleted successfully.",
      });
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

  // Handle deal value update
  const handleValueUpdate = () => {
    const newValue = prompt("Enter new value:", leadData.value?.toString() || "0");
    if (newValue !== null) {
      handleFieldUpdate('value', newValue);
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      {/* Company header with status color */}
      <div className={`${getStatusColorClass(leadData.status)} px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div className="w-full">
            {/* Company Name - Editable */}
            <div 
              className="cursor-pointer group relative"
              onClick={() => {
                const newValue = prompt("Enter new company name:", leadData.company);
                if (newValue !== null) {
                  handleFieldUpdate('company', newValue);
                }
              }}
            >
              <h2 className="text-xl font-bold text-white truncate">{leadData.company || "Company Name"}</h2>
              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10">
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge variant="outline" className="border-white/50 text-white px-3 py-1 ml-2">
            {leadData.status}
          </Badge>
        </div>
        
        {/* Deal Value */}
        <div className="flex items-center mt-1 text-white/90 cursor-pointer group relative" onClick={handleValueUpdate}>
          <DollarSign className="w-4 h-4 mr-1" />
          <span className="font-semibold">
            {leadData.value ? Number(leadData.value).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}
          </span>
          <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 text-white/70 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100">
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Lead Name */}
        <div className="pb-4 mb-4 border-b">
          <div className="flex items-end space-x-1">
            <div className="flex-1">
              <EditableField 
                value={leadData.firstName} 
                onSave={(value) => handleFieldUpdate('firstName', value)} 
                label="First Name"
                placeholder="Enter first name"
              />
            </div>
            <div className="flex-1">
              <EditableField 
                value={leadData.lastName} 
                onSave={(value) => handleFieldUpdate('lastName', value)} 
                label="Last Name"
                placeholder="Enter last name"
              />
            </div>
          </div>
        </div>
        
        {/* Contact Info */}
        <Collapsible className="border-b" defaultOpen>
          <CollapsibleTrigger className="w-full flex justify-between items-center py-3 hover:bg-muted/50 rounded-md px-2 -mx-2">
            <h3 className="font-semibold">Contact Information</h3>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="py-3">
            <div className="space-y-2 px-1">
              {/* Email */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <EditableField 
                    value={leadData.email} 
                    onSave={(value) => handleFieldUpdate('email', value)} 
                    label="Email"
                    placeholder="Enter email address"
                    type="email"
                  />
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <PhoneInput
                    value={leadData.phone || ''}
                    onChange={(value) => handleFieldUpdate('phone', value)}
                    label="Phone"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              {/* Address */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <EditableField 
                    value={leadData.address || ''} 
                    onSave={(value) => handleFieldUpdate('address', value)} 
                    label="Address"
                    placeholder="Enter street address"
                  />
                </div>
              </div>
              
              {/* City & Zip */}
              <div className="grid grid-cols-2 gap-2 pl-8">
                <EditableField 
                  value={leadData.city || ''} 
                  onSave={(value) => handleFieldUpdate('city', value)} 
                  label="City"
                  placeholder="Enter city"
                />
                <EditableField 
                  value={leadData.zipCode || ''} 
                  onSave={(value) => handleFieldUpdate('zipCode', value)} 
                  label="Zip Code"
                  placeholder="Enter zip code"
                />
              </div>
              
              {/* Country & State */}
              <div className="pl-8">
                <CountryStateInput
                  countryValue={leadData.country || ''}
                  stateValue={leadData.state || ''}
                  onCountryChange={(value) => handleFieldUpdate('country', value)}
                  onStateChange={(value) => handleFieldUpdate('state', value)}
                  countryLabel="Country"
                  stateLabel="State"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Lead Source */}
        <Collapsible className="border-b">
          <CollapsibleTrigger className="w-full flex justify-between items-center py-3 hover:bg-muted/50 rounded-md px-2 -mx-2">
            <h3 className="font-semibold">Lead Source</h3>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-2 space-y-3">
            <div className="space-y-3">
              <div className="bg-muted/50 p-2 rounded-md">
                <Label className="mb-1 text-xs">Source</Label>
                <Select
                  value={leadData.source || ''}
                  onValueChange={(value) => handleFieldUpdate('source', value)}
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="email_campaign">Email Campaign</SelectItem>
                    <SelectItem value="advertising">Advertising</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {leadData.source === "referral" && (
                <EditableField 
                  value={leadData.referredBy || ''} 
                  onSave={(value) => handleFieldUpdate('referredBy', value)} 
                  label="Referred By"
                  placeholder="Enter referrer name"
                />
              )}
              <EditableField 
                value={leadData.campaign || ''} 
                onSave={(value) => handleFieldUpdate('campaign', value)} 
                label="Campaign"
                placeholder="Enter campaign name"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tags */}
        <Collapsible className="border-b">
          <CollapsibleTrigger className="w-full flex justify-between items-center py-3 hover:bg-muted/50 rounded-md px-2 -mx-2">
            <h3 className="font-semibold">Tags</h3>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-2 space-y-3">
            <div className="bg-muted/50 p-2 rounded-md">
              <Label className="mb-1 text-xs">Tags (comma separated)</Label>
              <Input
                placeholder="e.g. VIP, Needs followup"
                value={Array.isArray(leadData.tags) ? leadData.tags.join(', ') : (typeof leadData.tags === 'string' ? leadData.tags : '')}
                onChange={(e) => {
                  const tagsValue = e.target.value;
                  setLeadData(prev => ({
                    ...prev, 
                    tags: tagsValue.split(',').map(tag => tag.trim()).filter(Boolean)
                  }));
                }}
                onBlur={(e) => {
                  const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                  handleFieldUpdate('tags', JSON.stringify(tagsArray));
                }}
                className="border-muted-foreground/20"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Separate multiple tags with commas
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.isArray(leadData.tags) && leadData.tags.length > 0 && 
                leadData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="mb-1">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1"
                      onClick={() => {
                        if (Array.isArray(leadData.tags)) {
                          const updatedTags = [...leadData.tags];
                          updatedTags.splice(index, 1);
                          handleFieldUpdate('tags', JSON.stringify(updatedTags));
                        }
                      }}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))
              }
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Social Profiles */}
        <Collapsible className="border-b">
          <CollapsibleTrigger className="w-full flex justify-between items-center py-3 hover:bg-muted/50 rounded-md px-2 -mx-2">
            <h3 className="font-semibold">Social Profiles</h3>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-2 space-y-3">
            <EditableField 
              value={leadData.socialProfiles?.linkedin || ''} 
              onSave={(value) => handleFieldUpdate('socialProfiles.linkedin', value)} 
              label="LinkedIn"
              placeholder="https://linkedin.com/in/username"
            />
            <EditableField 
              value={leadData.socialProfiles?.twitter || ''} 
              onSave={(value) => handleFieldUpdate('socialProfiles.twitter', value)} 
              label="Twitter"
              placeholder="https://twitter.com/username"
            />
            <EditableField 
              value={leadData.socialProfiles?.facebook || ''} 
              onSave={(value) => handleFieldUpdate('socialProfiles.facebook', value)} 
              label="Facebook"
              placeholder="https://facebook.com/username"
            />
            <EditableField 
              value={leadData.socialProfiles?.instagram || ''} 
              onSave={(value) => handleFieldUpdate('socialProfiles.instagram', value)} 
              label="Instagram"
              placeholder="https://instagram.com/username"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Business Information */}
        <Collapsible className="border-b">
          <CollapsibleTrigger className="w-full flex justify-between items-center py-3 hover:bg-muted/50 rounded-md px-2 -mx-2">
            <h3 className="font-semibold">Business Information</h3>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-2 space-y-3">
            <EditableField 
              value={leadData.website || ''} 
              onSave={(value) => handleFieldUpdate('website', value)} 
              label="Website"
              placeholder="https://example.com"
            />
            <div className="bg-muted/50 p-2 rounded-md">
              <Label className="mb-1 text-xs">Industry</Label>
              <Select
                value={leadData.industry || ''}
                onValueChange={(value) => handleFieldUpdate('industry', value)}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/50 p-2 rounded-md">
              <Label className="mb-1 text-xs">Company Size</Label>
              <Select
                value={leadData.companySize || ''}
                onValueChange={(value) => handleFieldUpdate('companySize', value)}
              >
                <SelectTrigger id="companySize">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <EditableField 
              value={leadData.annualRevenue || ''} 
              onSave={(value) => handleFieldUpdate('annualRevenue', value)} 
              label="Annual Revenue"
              placeholder="e.g. $1M-$5M"
            />
          </CollapsibleContent>
        </Collapsible>
        
        {/* Remaining sections with collapsible behavior */}
        <Collapsible className="border-b">
          <CollapsibleTrigger className="w-full flex justify-between items-center py-3 hover:bg-muted/50 rounded-md px-2 -mx-2">
            <h3 className="font-semibold">Preferences & Requirements</h3>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-2 space-y-3">
            {/* Preferences content with EditableField components */}
            <EditableField 
              value={leadData.budget || ''} 
              onSave={(value) => handleFieldUpdate('budget', value)} 
              label="Budget Range"
              placeholder="e.g. $5,000-$10,000"
            />
            {/* Other editable fields similar to above */}
          </CollapsibleContent>
        </Collapsible>

        {/* Timeline section */}
        <Collapsible className="border-b">
          <CollapsibleTrigger className="w-full flex justify-between items-center py-3 hover:bg-muted/50 rounded-md px-2 -mx-2">
            <h3 className="font-semibold">Timeline</h3>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-2 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Created: {formatDate(leadData.createdAt)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Last Activity: {format(new Date(leadData.lastActivity), 'MMM d, h:mm a')}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons - At bottom of card */}
        <div className="pt-6 border-t mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={isDeleting}>
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
      </div>
    </Card>
  );
}
