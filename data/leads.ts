export interface Lead {
  id: string;
  numericId: number;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  value: string;
  position: number;
  createdAt: string;
  lastActivity: string;
  
  // Pipeline tracking
  statusUpdatedAt?: string; // When the lead last changed stages
  daysInStage?: Record<string, number>; // Days spent in each stage
  
  // Address information
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Lead source information
  source?: string;
  referredBy?: string;
  campaign?: string;
  
  // Tags for better organization
  tags?: string[];
  
  // Custom fields for flexible data collection
  customFields?: Array<{key: string, value: string}>;
  
  // Social media profiles
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  
  // Business details
  website?: string;
  industry?: string;
  companySize?: string;
  annualRevenue?: string;
  
  // Lead preferences and requirements
  budget?: string;
  timeline?: string;
  preferredContact?: string;
  keyRequirements?: string;
  
  activities: {
    calls: Activity[];
    notes: Activity[];
    emails: Activity[];
    meetings: Activity[];
    documents: Activity[];
  };
}

export interface Activity {
  id: number;
  type: 'call' | 'note' | 'email' | 'meeting' | 'document';
  title: string;
  description: string;
  date: string;
  status?: string;
  duration?: string;
  attachments?: string[];
  isPinned?: boolean; // For pinning notes to top of list
}

// Empty array - no mock data
export const leads: Lead[] = [];