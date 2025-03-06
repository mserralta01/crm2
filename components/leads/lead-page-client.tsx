"use client";

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadProfile } from '@/components/leads/lead-profile';
import { LeadActivities } from '@/components/leads/lead-activities';
import { Phone, MessageSquare, Mail, Calendar, FileText } from 'lucide-react';
import { leads } from '@/data/leads';

export function LeadPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.id as string;
  const isEditMode = searchParams.get('edit') === 'true';
  const [lead, setLead] = useState(leads.find(l => l.id.toString() === leadId));

  if (!lead) {
    return <div>Lead not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-12 gap-8"
      >
        {/* Left Column - Lead Profile */}
        <div className="col-span-3">
          <LeadProfile lead={lead} isEditMode={isEditMode} />
        </div>

        {/* Right Column - Activities */}
        <div className="col-span-9">
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="phone">
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </TabsTrigger>
              <TabsTrigger value="notes">
                <MessageSquare className="w-4 h-4 mr-2" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="meetings">
                <Calendar className="w-4 h-4 mr-2" />
                Meetings
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            <LeadActivities leadId={leadId} />
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}