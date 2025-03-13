"use client";

import { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Send, Phone, Clock, FileText, Calendar } from 'lucide-react';
import { getLeadById } from '@/lib/services/leads-service';
import { Lead } from '@/data/leads';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface LeadActivitiesProps {
  leadId: string;
}

export function LeadActivities({ leadId }: LeadActivitiesProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLead() {
      try {
        setLoading(true);
        const leadData = await getLeadById(leadId);
        setLead(leadData);
      } catch (err) {
        console.error('Error fetching lead activities:', err);
        setError('Failed to load lead activities');
      } finally {
        setLoading(false);
      }
    }

    fetchLead();
  }, [leadId]);

  if (loading) {
    return <div className="p-4 text-center">Loading activities...</div>;
  }

  if (error || !lead) {
    return <div className="p-4 text-center text-red-500">{error || 'Activities not found'}</div>;
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="mt-6">
      <TabsContent value="phone" className="space-y-4">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Call History</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log New Call
            </Button>
          </div>
          
          <div className="space-y-4">
            {lead.activities.calls.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">No call history found</div>
            ) : (
              lead.activities.calls.map(call => (
                <Card key={call.id} className="p-4 bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{call.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{call.description}</p>
                        <div className="flex items-center space-x-3 mt-2 text-sm">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {call.duration}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDate(call.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{call.status}</Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="notes" className="space-y-4">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Notes</h3>
          </div>
          <div className="space-y-4">
            <Textarea placeholder="Add a note..." className="min-h-[100px]" />
            <Button className="w-full">Save Note</Button>
            
            <div className="space-y-4 mt-6">
              {lead.activities.notes.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">No notes found</div>
              ) : (
                lead.activities.notes.map(note => (
                  <Card key={note.id} className="p-4 bg-muted/50">
                    <h4 className="font-medium">{note.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{note.description}</p>
                    <div className="text-sm text-muted-foreground mt-2">
                      {formatDate(note.date)}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="email" className="space-y-4">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Email Communication</h3>
          </div>
          <div className="space-y-4">
            <Input type="text" placeholder="Subject" />
            <Textarea placeholder="Write your email..." className="min-h-[200px]" />
            <Button className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>

            <div className="space-y-4 mt-6">
              {lead.activities.emails.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">No email history found</div>
              ) : (
                lead.activities.emails.map(email => (
                  <Card key={email.id} className="p-4 bg-muted/50">
                    <h4 className="font-medium">{email.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{email.description}</p>
                    <div className="flex items-center space-x-3 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {formatDate(email.date)}
                      </span>
                      {email.attachments && (
                        <span className="flex items-center text-primary">
                          <FileText className="w-3 h-3 mr-1" />
                          {email.attachments.length} attachment(s)
                        </span>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="meetings" className="space-y-4">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Meetings</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>

          <div className="space-y-4">
            {lead.activities.meetings.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">No meetings found</div>
            ) : (
              lead.activities.meetings.map(meeting => (
                <Card key={meeting.id} className="p-4 bg-muted/50">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">{meeting.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                      <div className="flex items-center space-x-3 mt-2 text-sm">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {meeting.duration}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(meeting.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="documents" className="space-y-4">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Documents</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <div className="space-y-4">
            {lead.activities.documents.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">No documents found</div>
            ) : (
              lead.activities.documents.map(doc => (
                <Card key={doc.id} className="p-4 bg-muted/50">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                      <div className="text-sm text-muted-foreground mt-2">
                        {formatDate(doc.date)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </TabsContent>
    </div>
  );
}