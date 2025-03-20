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
  activities: {
    calls: Activity[];
    notes: Activity[];
    emails: Activity[];
    meetings: Activity[];
    documents: Activity[];
  };
}

interface Activity {
  id: number;
  type: 'call' | 'note' | 'email' | 'meeting' | 'document';
  title: string;
  description: string;
  date: string;
  status?: string;
  duration?: string;
  attachments?: string[];
}

// Empty array - no mock data
export const leads: Lead[] = [];