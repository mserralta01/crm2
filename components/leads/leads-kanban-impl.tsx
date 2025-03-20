"use client";

import { useState, useEffect } from 'react';
import { Lead } from '@/data/leads';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  SlidersHorizontal,
  TrendingUp,
  Users,
  DollarSign,
  BarChart,
  AlertTriangle
} from 'lucide-react';
import { getLeads, updateLead, updateLeadPositions, identifyProblematicLeads } from '@/lib/services/leads-service';
import { formatCurrency } from '@/lib/utils';
import { AddLeadDialog } from './add-lead-dialog';
import { KanbanCard } from './kanban-card';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';

// Professional color scheme
const initialColumns = [
  { id: 'New', title: 'New Leads', color: 'from-slate-600 to-slate-500' },
  { id: 'Contacted', title: 'Contacted', color: 'from-blue-700 to-blue-600' },
  { id: 'Qualified', title: 'Qualified', color: 'from-emerald-700 to-emerald-600' },
  { id: 'Negotiating', title: 'Negotiating', color: 'from-indigo-700 to-indigo-600' },
];

const availableColors = [
  { id: 'slate', gradient: 'from-slate-600 to-slate-500' },
  { id: 'blue', gradient: 'from-blue-700 to-blue-600' },
  { id: 'emerald', gradient: 'from-emerald-700 to-emerald-600' },
  { id: 'indigo', gradient: 'from-indigo-700 to-indigo-600' },
  { id: 'zinc', gradient: 'from-zinc-600 to-zinc-500' },
  { id: 'gray', gradient: 'from-gray-600 to-gray-500' },
];

export default function LeadsKanbanImpl() {
  const [columns, setColumns] = useState(initialColumns);
  const [items, setItems] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<Lead>>>({});
  const [problematicLeads, setProblematicLeads] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Function to fetch leads data
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const fetchedLeads = await getLeads();
      const problemLeads = await identifyProblematicLeads();
      setProblematicLeads(problemLeads);
      
      // Sort leads by position within columns
      const sortedLeads = sortLeadsByPositionInColumns(fetchedLeads);
      setItems(sortedLeads);
      console.log('Leads loaded successfully:', sortedLeads.length);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // Sort leads by position within their columns
  const sortLeadsByPositionInColumns = (leads: Lead[]) => {
    // Group leads by status
    const groupedLeads = leads.reduce((acc, lead) => {
      const status = lead.status || 'New';
      if (!acc[status]) acc[status] = [];
      acc[status].push(lead);
      return acc;
    }, {} as Record<string, Lead[]>);

    // Sort each group by position
    Object.keys(groupedLeads).forEach(status => {
      groupedLeads[status].sort((a, b) => (a.position || 0) - (b.position || 0));
    });

    // Flatten back to array
    return Object.values(groupedLeads).flat();
  };

  // Apply any pending updates to the leads
  const applyPendingUpdates = (leads: Lead[], updates: Record<string, Partial<Lead>>) => {
    return leads.map(lead => {
      const update = updates[lead.id.toString()];
      return update ? { ...lead, ...update } : lead;
    });
  };

  // Handle drag end for react-beautiful-dnd
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside or same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Find the lead that was dragged
    const lead = items.find(item => item.id === draggableId);
    if (!lead) return;

    // Create a new list with updated positions
    let newItems = [...items];
    
    // Apply status update if moved to a different column
    if (destination.droppableId !== source.droppableId) {
      // Create a pending update
      setPendingUpdates({
        ...pendingUpdates,
        [lead.id]: {
          ...pendingUpdates[lead.id],
          status: destination.droppableId,
        }
      });
      
      // Optimistically update the UI
      newItems = newItems.map(item => 
        item.id === draggableId 
          ? { ...item, status: destination.droppableId } 
          : item
      );
    }

    // Get leads in destination column
    const leadsInDestination = newItems.filter(
      item => item.status === destination.droppableId
    );
    
    // Remove the dragged lead if it's already in the destination column
    const destinationWithoutDragged = destination.droppableId === source.droppableId
      ? leadsInDestination.filter(item => item.id !== draggableId)
      : leadsInDestination;
    
    // Insert the dragged lead at the new position
    destinationWithoutDragged.splice(destination.index, 0, {
      ...lead,
      status: destination.droppableId
    });
    
    // Update positions for all leads in the destination column
    const updatedDestinationLeads = destinationWithoutDragged.map((item, index) => ({
      ...item,
      position: index
    }));
    
    // Update the items list with the new positions
    newItems = newItems.map(item => {
      if (item.status === destination.droppableId) {
        const updatedItem = updatedDestinationLeads.find(u => u.id === item.id);
        return updatedItem || item;
      }
      return item;
    });
    
    // Update UI optimistically
    setItems(newItems);
    
    // Persist changes to the database
    try {
      // Update the lead status if it changed
      if (destination.droppableId !== source.droppableId) {
        console.log(`Updating lead ${lead.id} status to ${destination.droppableId}`);
        await updateLead(lead.id, { 
          status: destination.droppableId 
        });
      }
      
      // Log the position updates
      console.log('Saving position updates:', 
        updatedDestinationLeads.map(lead => 
          `${lead.id}: ${lead.position} in ${lead.status}`
        ).join(', ')
      );
      
      // Update positions for all affected leads
      await updateLeadPositions(
        updatedDestinationLeads.map(lead => ({
          id: lead.id,
          position: lead.position
        }))
      );
      
      console.log('Position updates saved successfully');
      
      // Clear pending update for this lead
      const newPendingUpdates = { ...pendingUpdates };
      delete newPendingUpdates[lead.id];
      setPendingUpdates(newPendingUpdates);
    } catch (error) {
      console.error("Error updating lead:", error);
      
      // Add more robust error handling
      // Reload data from server to ensure UI is consistent with database
      console.log("Refreshing data after error...");
      setTimeout(() => {
        fetchLeads();
      }, 1000);
    }
  };

  const handleAddLead = () => {
    setIsAddLeadOpen(true);
  };

  const handleLeadAdded = (newLead: Lead) => {
    setItems(prev => [...prev, newLead]);
  };

  // Calculate summary statistics
  const totalLeadValue = items.reduce((sum, lead) => {
    // Convert string value like "$5,000" to number
    const numericValue = typeof lead.value === 'string' 
      ? parseFloat(lead.value.replace(/[^0-9.-]+/g, "")) 
      : (lead.value || 0);
    return sum + numericValue;
  }, 0);
  
  const leadsByStatus = columns.map(column => ({
    id: column.id,
    count: items.filter(item => item.status === column.id).length,
    value: items
      .filter(item => item.status === column.id)
      .reduce((sum, lead) => {
        const numericValue = typeof lead.value === 'string'
          ? parseFloat(lead.value.replace(/[^0-9.-]+/g, ""))
          : (lead.value || 0);
        return sum + numericValue;
      }, 0)
  }));

  if (isLoading) {
    return <div className="p-6">Loading leads...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-muted-foreground">Total Leads</h3>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-muted-foreground">Total Value</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalLeadValue)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-muted-foreground">Conversion Rate</h3>
              <p className="text-2xl font-bold">
                {items.length ? ((leadsByStatus[2]?.count || 0) / items.length * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-muted-foreground">Avg. Deal Size</h3>
              <p className="text-2xl font-bold">
                {items.length ? formatCurrency(totalLeadValue / items.length) : '$0'}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <BarChart className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button onClick={handleAddLead} className="bg-slate-800 hover:bg-slate-700">
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
          
          {problematicLeads.length > 0 && (
            <Button variant="ghost" className="text-amber-600" title="Some leads have data issues">
              <AlertTriangle className="mr-2 h-4 w-4" /> {problematicLeads.length} Issue{problematicLeads.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-6">
          {columns.map((column) => (
            <div key={column.id} className="min-w-[300px]">
              <div 
                className={`bg-gradient-to-r ${column.color} py-2 px-4 rounded-t-md shadow-sm`}
              >
                <h3 className="font-semibold text-white">{column.title}</h3>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-muted/30 p-4 rounded-b-md min-h-[500px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-muted/50' : ''
                    }`}
                  >
                    {items
                      .filter(item => item.status === column.id)
                      .map((item, index) => (
                        <Draggable 
                          key={item.id} 
                          draggableId={item.id} 
                          index={index}
                          isDragDisabled={false}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3 touch-manipulation select-none active:cursor-grabbing"
                              style={provided.draggableProps.style}
                            >
                              <KanbanCard 
                                id={item.id} 
                                lead={item} 
                                columnColor={column.color} 
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      {/* Add Lead Dialog */}
      <AddLeadDialog 
        open={isAddLeadOpen} 
        onClose={() => setIsAddLeadOpen(false)}
        onLeadAdded={handleLeadAdded}
      />

      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Saving changes...
          </div>
        </div>
      )}
    </div>
  );
} 