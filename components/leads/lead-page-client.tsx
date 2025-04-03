"use client";

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadProfile } from '@/components/leads/lead-profile';
import { LeadActivities } from '@/components/leads/lead-activities';
import { PipelineProgress } from '@/components/leads/pipeline-progress';
import { Phone, MessageSquare, Mail, Calendar, FileText } from 'lucide-react';
import { getLeadById } from '@/lib/services/leads-service';
import { Lead } from '@/data/leads';
import { differenceInCalendarDays } from 'date-fns';

export function LeadPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.id as string;
  const isEditMode = searchParams.get('edit') === 'true';
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLead() {
      try {
        setLoading(true);
        const leadData = await getLeadById(leadId);
        
        // Calculate days in each stage if not already present
        const leadWithDays = calculateDaysInStage(leadData);
        
        setLead(leadWithDays);
        if (!leadWithDays) {
          setError('Lead not found');
        }
      } catch (err) {
        console.error('Error fetching lead:', err);
        setError('Failed to load lead data');
      } finally {
        setLoading(false);
      }
    }

    fetchLead();
  }, [leadId]);
  
  // Calculate days spent in each pipeline stage
  const calculateDaysInStage = (leadData: Lead | null): Lead | null => {
    if (!leadData) return null;
    
    // If no statusUpdatedAt, use createdAt as a fallback
    const statusDate = leadData.statusUpdatedAt || leadData.createdAt;
    const currentStage = leadData.status;
    
    // Calculate days in current stage
    const daysInCurrentStage = differenceInCalendarDays(
      new Date(),
      new Date(statusDate)
    );
    
    // Update the daysInStage record
    const daysInStage = leadData.daysInStage || {};
    
    return {
      ...leadData,
      daysInStage: {
        ...daysInStage,
        [currentStage]: Math.max(daysInCurrentStage, 0) // Ensure non-negative
      }
    };
  };
  
  // Handle status updates from pipeline component
  const handleStatusUpdate = (newStatus: string) => {
    if (!lead) return;
    
    // Update the lead object with new status
    const updatedLead = {
      ...lead,
      status: newStatus,
      statusUpdatedAt: new Date().toISOString(),
      // Reset days in new stage to 0
      daysInStage: {
        ...(lead.daysInStage || {}),
        [newStatus]: 0
      }
    };
    
    setLead(updatedLead);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading lead data...</div>;
  }

  if (error || !lead) {
    return <div className="p-8 text-center text-red-500">{error || 'Lead not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Pipeline Progress Bar - Full Width */}
      <div className="mb-8">
        <PipelineProgress lead={lead} onStatusUpdate={handleStatusUpdate} />
      </div>
      
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