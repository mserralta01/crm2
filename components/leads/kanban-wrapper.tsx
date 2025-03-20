"use client";

import dynamic from 'next/dynamic';

// Import the Kanban component but disable SSR
const LeadsKanbanWithNoSSR = dynamic(
  () => import('./leads-kanban-impl'),
  { ssr: false }
);

export function LeadsKanban() {
  return <LeadsKanbanWithNoSSR />;
} 