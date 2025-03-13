import { Metadata } from 'next';
import { LeadPageClient } from '@/components/leads/lead-page-client';
// Removed mock data import
// import { leads } from '@/data/leads';

export const metadata: Metadata = {
  title: 'Lead Details - SalesPro CRM',
  description: 'View and manage lead details',
};

// No longer generating static params from mock data
// export function generateStaticParams() {
//   return leads.map((lead) => ({
//     id: lead.id.toString(),
//   }));
// }

export default function LeadPage() {
  return <LeadPageClient />;
}