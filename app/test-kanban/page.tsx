import { LeadsKanban } from '@/components/leads/leads-kanban';

export default function TestKanbanPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4 p-6">Leads Kanban Board (@hello-pangea/dnd)</h1>
      <LeadsKanban />
    </div>
  );
} 