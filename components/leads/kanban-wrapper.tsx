"use client";

import dynamic from 'next/dynamic';

// Import the Kanban component but disable SSR
const LeadsKanbanWithNoSSR = dynamic(
  () => import('./leads-kanban-impl'),
  { ssr: false }
);

interface LeadsKanbanProps {
  searchTerm?: string;
}

export function LeadsKanban({ searchTerm = "" }: LeadsKanbanProps) {
  return <LeadsKanbanWithNoSSR searchTerm={searchTerm} />;
} 