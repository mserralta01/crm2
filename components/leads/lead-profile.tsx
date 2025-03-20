"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  Clock8
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
      
      // Process tags if they're a string (comma-separated)
      let processedTags = editedLead.tags;
      if (typeof editedLead.tags === 'string') {
        processedTags = (editedLead.tags as string).split(',').map(tag => tag.trim()).filter(Boolean);
      } else if (editedLead.tags === undefined) {
        // Ensure tags is never undefined - use empty array instead
        processedTags = [];
      }
      
      const updatedLead = {
        ...editedLead,
        phone: formattedPhone,
        tags: processedTags
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

  // Handle changes in nested objects like socialProfiles
  const handleNestedChange = (objectName: string, propertyName: string, value: string) => {
    setEditedLead(prev => {
      const currentObject = prev[objectName as keyof typeof prev] as Record<string, string> || {};
      return {
        ...prev,
        [objectName]: {
          ...currentObject,
          [propertyName]: value
        }
      };
    });
  };

  // Handle changes for textarea elements
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedLead(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setEditedLead(prev => ({ ...prev, [name]: value }));
  };

  // Add a custom field
  const addCustomField = () => {
    setEditedLead(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), { key: '', value: '' }]
    }));
  };

  // Update a custom field
  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    const updatedFields = [...(editedLead.customFields || [])];
    updatedFields[index][field] = value;
    setEditedLead(prev => ({
      ...prev,
      customFields: updatedFields
    }));
  };

  // Remove a custom field
  const removeCustomField = (index: number) => {
    const updatedFields = [...(editedLead.customFields || [])];
    updatedFields.splice(index, 1);
    setEditedLead(prev => ({
      ...prev,
      customFields: updatedFields
    }));
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
              
              {/* Add address fields */}
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={editedLead.address || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={editedLead.city || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={editedLead.zipCode || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={editedLead.state || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={editedLead.country || ''}
                    onChange={handleChange}
                  />
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
              
              {/* Display address if available */}
              {(lead.address || lead.city || lead.state || lead.zipCode || lead.country) && (
                <div className="px-3 py-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      {lead.address && <div>{lead.address}</div>}
                      {(lead.city || lead.state || lead.zipCode) && (
                        <div>
                          {[lead.city, lead.state, lead.zipCode].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {lead.country && <div>{lead.country}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lead Source */}
        <div className="space-y-3 mt-4">
          <h3 className="font-semibold">Lead Source</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="source">Source</Label>
                <Select
                  value={editedLead.source || ''}
                  onValueChange={(value) => handleSelectChange('source', value)}
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
              
              {editedLead.source === "referral" && (
                <div>
                  <Label htmlFor="referredBy">Referred By</Label>
                  <Input
                    id="referredBy"
                    name="referredBy"
                    value={editedLead.referredBy || ''}
                    onChange={handleChange}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="campaign">Campaign</Label>
                <Input
                  id="campaign"
                  name="campaign"
                  value={editedLead.campaign || ''}
                  onChange={handleChange}
                  placeholder="e.g. Summer Promo 2023"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 px-3 py-2 text-sm">
              {lead.source ? (
                <>
                  <div className="flex items-center">
                    <div className="font-medium mr-2">Source:</div>
                    <Badge variant="outline" className="capitalize">
                      {lead.source.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
                  {lead.referredBy && (
                    <div className="flex items-center">
                      <div className="font-medium mr-2">Referred by:</div>
                      <span>{lead.referredBy}</span>
                    </div>
                  )}
                  
                  {lead.campaign && (
                    <div className="flex items-center">
                      <div className="font-medium mr-2">Campaign:</div>
                      <Badge variant="secondary">{lead.campaign}</Badge>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground">No source information added</div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-3 mt-4">
          <h3 className="font-semibold">Tags</h3>
          {isEditing ? (
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={Array.isArray(editedLead.tags) ? editedLead.tags.join(', ') : editedLead.tags || ''}
                onChange={handleChange}
                placeholder="e.g. VIP, Needs followup, Long-term"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Separate multiple tags with commas
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 px-3 py-2">
              {lead.tags && lead.tags.length > 0 ? (
                lead.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="mb-1">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No tags</div>
              )}
            </div>
          )}
        </div>

        {/* Social Profiles */}
        <div className="space-y-3 mt-4">
          <h3 className="font-semibold">Social Profiles</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={editedLead.socialProfiles?.linkedin || ''}
                  onChange={(e) => handleNestedChange('socialProfiles', 'linkedin', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/username"
                  value={editedLead.socialProfiles?.twitter || ''}
                  onChange={(e) => handleNestedChange('socialProfiles', 'twitter', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/username"
                  value={editedLead.socialProfiles?.facebook || ''}
                  onChange={(e) => handleNestedChange('socialProfiles', 'facebook', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/username"
                  value={editedLead.socialProfiles?.instagram || ''}
                  onChange={(e) => handleNestedChange('socialProfiles', 'instagram', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {lead.socialProfiles?.linkedin && (
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href={lead.socialProfiles.linkedin} target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                </Button>
              )}
              
              {lead.socialProfiles?.twitter && (
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href={lead.socialProfiles.twitter} target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </a>
                </Button>
              )}
              
              {lead.socialProfiles?.facebook && (
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href={lead.socialProfiles.facebook} target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                </Button>
              )}
              
              {lead.socialProfiles?.instagram && (
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href={lead.socialProfiles.instagram} target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                    Instagram
                  </a>
                </Button>
              )}
              
              {!lead.socialProfiles?.linkedin && !lead.socialProfiles?.twitter && 
               !lead.socialProfiles?.facebook && !lead.socialProfiles?.instagram && (
                <div className="text-sm text-muted-foreground px-3 py-2">No social profiles added</div>
              )}
            </div>
          )}
        </div>

        {/* Business Information */}
        <div className="space-y-3 mt-4">
          <h3 className="font-semibold">Business Information</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={editedLead.website || ''}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={editedLead.industry || ''}
                  onValueChange={(value) => handleSelectChange('industry', value)}
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
              <div>
                <Label htmlFor="companySize">Company Size</Label>
                <Select
                  value={editedLead.companySize || ''}
                  onValueChange={(value) => handleSelectChange('companySize', value)}
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
              <div>
                <Label htmlFor="annualRevenue">Annual Revenue</Label>
                <Input
                  id="annualRevenue"
                  name="annualRevenue"
                  value={editedLead.annualRevenue || ''}
                  onChange={handleChange}
                  placeholder="e.g. $1M-$5M"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {lead.website && (
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href={lead.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    {lead.website.replace(/^https?:\/\//, '')}
                  </a>
                </Button>
              )}
              
              <div className="px-3 py-2 text-sm space-y-1">
                {lead.industry && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Industry:</span>
                    <Badge variant="outline" className="capitalize">
                      {lead.industry.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                )}
                
                {lead.companySize && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Company Size:</span>
                    <span>{lead.companySize}</span>
                  </div>
                )}
                
                {lead.annualRevenue && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Annual Revenue:</span>
                    <span>{lead.annualRevenue}</span>
                  </div>
                )}
                
                {!lead.website && !lead.industry && !lead.companySize && !lead.annualRevenue && (
                  <div className="text-muted-foreground">No business details added</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lead Preferences & Requirements */}
        <div className="space-y-3 mt-4">
          <h3 className="font-semibold">Preferences & Requirements</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="budget">Budget Range</Label>
                <Input
                  id="budget"
                  name="budget"
                  value={editedLead.budget || ''}
                  onChange={handleChange}
                  placeholder="e.g. $5,000-$10,000"
                />
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Select
                  value={editedLead.timeline || ''}
                  onValueChange={(value) => handleSelectChange('timeline', value)}
                >
                  <SelectTrigger id="timeline">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (0-1 month)</SelectItem>
                    <SelectItem value="short">Short-term (1-3 months)</SelectItem>
                    <SelectItem value="medium">Medium-term (3-6 months)</SelectItem>
                    <SelectItem value="long">Long-term (6+ months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <Select
                  value={editedLead.preferredContact || ''}
                  onValueChange={(value) => handleSelectChange('preferredContact', value)}
                >
                  <SelectTrigger id="preferredContact">
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="keyRequirements">Key Requirements</Label>
                <Textarea
                  id="keyRequirements"
                  name="keyRequirements"
                  value={editedLead.keyRequirements || ''}
                  onChange={handleTextareaChange}
                  placeholder="Enter any specific requirements or needs"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 px-3 py-2 text-sm">
              {lead.budget && (
                <div className="flex items-center">
                  <span className="font-medium mr-2">Budget:</span>
                  <span>{lead.budget}</span>
                </div>
              )}
              
              {lead.timeline && (
                <div className="flex items-center">
                  <span className="font-medium mr-2">Timeline:</span>
                  <Badge variant="outline">
                    {lead.timeline === 'immediate' && 'Immediate (0-1 month)'}
                    {lead.timeline === 'short' && 'Short-term (1-3 months)'}
                    {lead.timeline === 'medium' && 'Medium-term (3-6 months)'}
                    {lead.timeline === 'long' && 'Long-term (6+ months)'}
                  </Badge>
                </div>
              )}
              
              {lead.preferredContact && (
                <div className="flex items-center">
                  <span className="font-medium mr-2">Preferred Contact:</span>
                  <Badge variant="secondary" className="capitalize">
                    {lead.preferredContact}
                  </Badge>
                </div>
              )}
              
              {lead.keyRequirements && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Key Requirements:</div>
                  <div className="whitespace-pre-wrap text-muted-foreground">
                    {lead.keyRequirements}
                  </div>
                </div>
              )}
              
              {!lead.budget && !lead.timeline && !lead.preferredContact && !lead.keyRequirements && (
                <div className="text-muted-foreground">No preferences or requirements added</div>
              )}
            </div>
          )}
        </div>

        {/* Custom Fields */}
        <div className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Custom Fields</h3>
            {isEditing && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={addCustomField}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Field
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              {(editedLead.customFields || []).map((field, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <Input
                      placeholder="Field name"
                      value={field.key}
                      onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCustomField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {(editedLead.customFields || []).length === 0 && (
                <div className="text-sm text-muted-foreground px-3 py-2">
                  No custom fields added. Click &quot;Add Field&quot; to create one.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 px-3 py-2">
              {(lead.customFields && lead.customFields.length > 0) ? (
                lead.customFields.map((field, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="font-medium">{field.key}:</span>
                    <span>{field.value}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No custom fields</div>
              )}
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