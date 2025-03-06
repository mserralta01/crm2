export interface Lead {
  id: number;
  name: string;
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

export const leads: Lead[] = [
  {
    id: 1,
    name: "John Smith",
    company: "Tech Solutions Inc",
    email: "john@techsolutions.com",
    phone: "+1 (555) 123-4567",
    status: "New",
    value: "$5,000",
    position: 1,
    createdAt: "2024-03-15T10:00:00Z",
    lastActivity: "2024-03-20T15:30:00Z",
    activities: {
      calls: [
        {
          id: 1,
          type: 'call',
          title: 'Initial Contact',
          description: 'Discussed product requirements and pricing',
          date: '2024-03-18T14:30:00Z',
          duration: '15 minutes',
          status: 'Completed'
        }
      ],
      notes: [
        {
          id: 2,
          type: 'note',
          title: 'Follow-up Required',
          description: 'Need to send pricing proposal by end of week',
          date: '2024-03-18T15:00:00Z'
        }
      ],
      emails: [
        {
          id: 3,
          type: 'email',
          title: 'Pricing Proposal',
          description: 'Sent detailed pricing breakdown and features list',
          date: '2024-03-19T09:15:00Z',
          attachments: ['proposal.pdf']
        }
      ],
      meetings: [
        {
          id: 4,
          type: 'meeting',
          title: 'Product Demo',
          description: 'Scheduled demo with technical team',
          date: '2024-03-22T13:00:00Z',
          duration: '1 hour'
        }
      ],
      documents: [
        {
          id: 5,
          type: 'document',
          title: 'Requirements Document',
          description: 'Technical requirements and specifications',
          date: '2024-03-19T11:30:00Z',
          attachments: ['requirements.pdf']
        }
      ]
    }
  },
  {
    id: 2,
    name: "Sarah Johnson",
    company: "Marketing Pro",
    email: "sarah@marketingpro.com",
    phone: "+1 (555) 234-5678",
    status: "Contacted",
    value: "$12,000",
    position: 2,
    createdAt: "2024-03-10T09:00:00Z",
    lastActivity: "2024-03-19T16:45:00Z",
    activities: {
      calls: [],
      notes: [],
      emails: [],
      meetings: [],
      documents: []
    }
  },
  // ... other leads with similar structure
];