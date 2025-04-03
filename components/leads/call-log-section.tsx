"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Plus, 
  Clock, 
  Calendar,
  MoreVertical,
  PhoneCall,
  PhoneOutgoing,
  PhoneIncoming,
  PhoneMissed,
  Trash,
  Copy,
  VolumeX,
  Pencil
} from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { addActivityToLead, updateLeadActivity, deleteLeadActivity } from '@/lib/services/leads-service';
import { Activity } from '@/data/leads';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Call direction options
const CALL_DIRECTIONS = [
  { id: 'incoming', label: 'Incoming', icon: PhoneIncoming },
  { id: 'outgoing', label: 'Outgoing', icon: PhoneOutgoing },
  { id: 'missed', label: 'Missed', icon: PhoneMissed },
  { id: 'voicemail', label: 'Voicemail', icon: VolumeX }
];

// Call outcome/status options
const CALL_OUTCOMES = [
  { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { id: 'scheduled_callback', label: 'Scheduled Callback', color: 'bg-blue-100 text-blue-800' },
  { id: 'no_answer', label: 'No Answer', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'left_voicemail', label: 'Left Voicemail', color: 'bg-purple-100 text-purple-800' },
  { id: 'call_back_later', label: 'Call Back Later', color: 'bg-orange-100 text-orange-800' },
  { id: 'wrong_number', label: 'Wrong Number', color: 'bg-red-100 text-red-800' }
];

// Duration options for quick selection
const DURATION_OPTIONS = [
  '5 min', '10 min', '15 min', '20 min', '30 min', '45 min', '1 hour', '1.5 hours'
];

interface CallLogSectionProps {
  leadId: string;
  calls: Activity[];
  phoneNumber?: string; // Optional lead phone number for quick dialing
  onCallAdded?: () => void;
}

export function CallLogSection({ leadId, calls: initialCalls, phoneNumber, onCallAdded }: CallLogSectionProps) {
  const [calls, setCalls] = useState<Activity[]>(initialCalls || []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '15 min',
    direction: 'outgoing',
    status: 'completed',
    scheduleFollowUp: false,
    followUpDate: '',
    contactName: '',
    contactPhone: phoneNumber || ''
  });
  const [editingCall, setEditingCall] = useState<Activity | null>(null);
  
  // Initialize with phone number from lead if available
  useEffect(() => {
    if (phoneNumber && !formData.contactPhone) {
      setFormData(prev => ({ ...prev, contactPhone: phoneNumber }));
    }
  }, [phoneNumber]);
  
  // Update calls when initialCalls changes
  useEffect(() => {
    setCalls(initialCalls || []);
  }, [initialCalls]);
  
  // Sort calls by date (most recent first)
  const sortedCalls = [...calls].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '15 min',
      direction: 'outgoing',
      status: 'completed',
      scheduleFollowUp: false,
      followUpDate: '',
      contactName: '',
      contactPhone: phoneNumber || ''
    });
    setEditingCall(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddCall = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Required field missing",
        description: "Please enter a call title",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (editingCall) {
        // Update existing call
        await updateLeadActivity(leadId, 'calls', editingCall.id, {
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          direction: formData.direction,
          status: formData.status,
          followUpDate: formData.scheduleFollowUp ? formData.followUpDate : undefined,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone
        });
        
        // Update local state
        setCalls(prev => prev.map(call => 
          call.id === editingCall.id 
            ? { 
                ...call, 
                title: formData.title,
                description: formData.description,
                duration: formData.duration,
                direction: formData.direction,
                status: formData.status,
                followUpDate: formData.scheduleFollowUp ? formData.followUpDate : undefined,
                contactName: formData.contactName,
                contactPhone: formData.contactPhone
              } 
            : call
        ));
        
        toast({
          title: "Call updated",
          description: "Call record has been updated successfully",
        });
      } else {
        // Create new call
        const newCall = {
          type: 'call' as const, // Ensure type is 'call'
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          direction: formData.direction,
          status: formData.status,
          followUpDate: formData.scheduleFollowUp ? formData.followUpDate : undefined,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone
        };
        
        await addActivityToLead(leadId, 'calls', newCall);
        
        // Add to local state with a temporary ID (for optimistic UI)
        const tempCall: Activity = {
          ...newCall,
          id: Date.now(),
          date: new Date().toISOString()
        };
        
        setCalls(prev => [tempCall, ...prev]);
        
        if (onCallAdded) {
          onCallAdded();
        }
        
        toast({
          title: "Call logged",
          description: "Call has been added to history",
        });
      }
      
      // Close dialog and reset form
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding/updating call:', error);
      toast({
        title: "Error",
        description: "Failed to save call record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteCall = async (callId: number) => {
    try {
      await deleteLeadActivity(leadId, 'calls', callId);
      
      // Update local state
      setCalls(calls.filter(call => call.id !== callId));
      
      toast({
        title: "Call deleted",
        description: "Call record has been removed",
      });
    } catch (error) {
      console.error('Error deleting call:', error);
      toast({
        title: "Error",
        description: "Failed to delete call record",
        variant: "destructive",
      });
    }
  };
  
  const handleEditCall = (call: Activity) => {
    setEditingCall(call);
    setFormData({
      title: call.title,
      description: call.description || '',
      duration: call.duration || '15 min',
      direction: call.direction || 'outgoing',
      status: call.status || 'completed',
      scheduleFollowUp: !!call.followUpDate,
      followUpDate: call.followUpDate || '',
      contactName: call.contactName || '',
      contactPhone: call.contactPhone || phoneNumber || ''
    });
    setIsAddDialogOpen(true);
  };
  
  // Format date to be more readable
  const formatCallDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      formatted: format(date, 'MMM d, yyyy h:mm a'),
      relative: formatDistance(date, new Date(), { addSuffix: true })
    };
  };
  
  // Get the appropriate icon for call direction
  const getDirectionIcon = (direction: string) => {
    const callType = CALL_DIRECTIONS.find(d => d.id === direction);
    const Icon = callType?.icon || PhoneCall;
    return <Icon className="w-4 h-4" />;
  };
  
  // Get status badge style based on outcome
  const getStatusBadgeStyle = (status: string) => {
    const outcome = CALL_OUTCOMES.find(o => o.id === status);
    return outcome?.color || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Call History</h3>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Log New Call
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCall ? 'Edit Call Record' : 'Log New Call'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Direction selection */}
              <div className="grid grid-cols-4 gap-2">
                {CALL_DIRECTIONS.map(direction => (
                  <Button
                    key={direction.id}
                    type="button"
                    variant={formData.direction === direction.id ? "default" : "outline"}
                    className="flex flex-col h-auto py-2 px-2"
                    onClick={() => handleSelectChange('direction', direction.id)}
                  >
                    <direction.icon className="h-4 w-4 mb-1" />
                    <span className="text-xs">{direction.label}</span>
                  </Button>
                ))}
              </div>
              
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    placeholder="Who did you call?"
                    value={formData.contactName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    placeholder="Phone number"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              {/* Title/Subject */}
              <div className="space-y-2">
                <Label htmlFor="title">Call Subject *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Subject or purpose of the call"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {/* Call Outcome */}
              <div className="space-y-2">
                <Label htmlFor="status">Call Outcome</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_OUTCOMES.map(outcome => (
                      <SelectItem key={outcome.id} value={outcome.id}>
                        {outcome.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Call Duration</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="duration"
                    name="duration"
                    placeholder="e.g. 15 min"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {DURATION_OPTIONS.slice(0, 3).map(duration => (
                      <Button
                        key={duration}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleSelectChange('duration', duration)}
                        type="button"
                      >
                        {duration}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Call Notes */}
              <div className="space-y-2">
                <Label htmlFor="description">Call Notes</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Notes about the call..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>
              
              {/* Follow-up scheduling */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="scheduleFollowUp"
                    checked={formData.scheduleFollowUp}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduleFollowUp: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="scheduleFollowUp" className="text-sm font-normal cursor-pointer">
                    Schedule a follow-up call
                  </Label>
                </div>
                
                {formData.scheduleFollowUp && (
                  <div className="pt-2">
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input
                      id="followUpDate"
                      name="followUpDate"
                      type="datetime-local"
                      value={formData.followUpDate}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddCall} 
                disabled={isLoading || !formData.title.trim()}
              >
                {isLoading ? 'Saving...' : editingCall ? 'Update Call' : 'Save Call'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {/* Quick action buttons for common call types */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => {
              setFormData({
                ...formData,
                direction: 'outgoing',
                status: 'completed',
                title: 'Sales Follow-up Call'
              });
              setIsAddDialogOpen(true);
            }}
          >
            <PhoneOutgoing className="w-3 h-3 mr-1" />
            Sales Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => {
              setFormData({
                ...formData,
                direction: 'outgoing',
                status: 'left_voicemail',
                title: 'Left Voicemail'
              });
              setIsAddDialogOpen(true);
            }}
          >
            <VolumeX className="w-3 h-3 mr-1" />
            Voicemail
          </Button>
          {phoneNumber && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-primary"
                    onClick={() => window.open(`tel:${phoneNumber.replace(/\D/g, '')}`)}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call Now
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Call {phoneNumber}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      
        {sortedCalls.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
            <Phone className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm mb-2">No call history found</p>
            <p className="text-xs text-muted-foreground/70">Log your first call by clicking the "Log New Call" button above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCalls.map(call => {
              const date = formatCallDate(call.date);
              const statusClass = getStatusBadgeStyle(call.status);
              const direction = call.direction || 'outgoing';
              
              return (
                <Card key={call.id} className="p-4 bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1 text-primary">
                        {getDirectionIcon(direction)}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">{call.title}</h4>
                          {call.followUpDate && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-[10px]">
                              <Calendar className="w-2 h-2 mr-1" />
                              Follow-up
                            </Badge>
                          )}
                        </div>
                        
                        {call.contactName && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Contact: {call.contactName} {call.contactPhone && `(${call.contactPhone})`}
                          </div>
                        )}
                        
                        {call.description && (
                          <p className="text-sm text-muted-foreground mt-1">{call.description}</p>
                        )}
                        
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
                          {call.duration && (
                            <span className="flex items-center text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {call.duration}
                            </span>
                          )}
                          <span className="flex items-center text-muted-foreground" title={date.formatted}>
                            {date.relative}
                          </span>
                          {call.followUpDate && (
                            <span className="flex items-center text-blue-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              Follow-up: {format(new Date(call.followUpDate), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Badge className={cn("px-2 py-0.5 text-xs", statusClass)}>
                        {CALL_OUTCOMES.find(o => o.id === call.status)?.label || call.status}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditCall(call)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Call
                          </DropdownMenuItem>
                          {call.contactPhone && (
                            <DropdownMenuItem onClick={() => window.open(`tel:${call.contactPhone.replace(/\D/g, '')}`)}>
                              <PhoneCall className="w-4 h-4 mr-2" />
                              Call Again
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => {
                              // Create a new call with some fields prefilled
                              setFormData({
                                ...formData,
                                title: `Follow-up to: ${call.title}`,
                                contactName: call.contactName || '',
                                contactPhone: call.contactPhone || '',
                                description: `Previous call notes: ${call.description || ''}`
                              });
                              setIsAddDialogOpen(true);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Create Follow-up
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDeleteCall(call.id)}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete Call
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Show total calls count */}
        {sortedCalls.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            {sortedCalls.length} call{sortedCalls.length !== 1 ? 's' : ''} in history
          </div>
        )}
      </div>
    </>
  );
} 