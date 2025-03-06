"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  SlidersHorizontal,
  TrendingUp,
  Users,
  DollarSign,
  BarChart
} from 'lucide-react';
import { Lead } from '@/data/leads';
import { getLeads, updateLead, updateLeadPositions } from '@/lib/services/leads-service';
import { formatCurrency } from '@/lib/utils';
import { 
  collection, 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AddLeadDialog } from '@/components/leads/add-lead-dialog';

// Professional color scheme using muted, corporate tones
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

export function LeadsKanban({ searchTerm }: { searchTerm: string }) {
  const [items, setItems] = useState<Lead[]>([]);
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch leads data
  async function fetchLeads() {
    try {
      setLoading(true);
      const data = await getLeads();
      
      // Filter out leads with invalid IDs (negative numbers)
      const validLeads = data.filter(lead => lead.id > 0);
      
      if (validLeads.length < data.length) {
        console.warn(`Filtered out ${data.length - validLeads.length} leads with invalid IDs`);
      }
      
      // Check if positions need to be initialized
      const needsPositionInit = validLeads.some(lead => !lead.position);
      
      if (needsPositionInit) {
        console.log('Initializing positions for leads...');
        
        // Group leads by status
        const leadsByStatus = validLeads.reduce((acc, lead) => {
          if (!acc[lead.status]) {
            acc[lead.status] = [];
          }
          acc[lead.status].push(lead);
          return acc;
        }, {} as Record<string, Lead[]>);
        
        // Generate position updates for each status group
        const positionUpdates: { id: string; position: number }[] = [];
        
        for (const status in leadsByStatus) {
          const statusLeads = leadsByStatus[status];
          // Sort by lastActivity date as a reasonable default order
          statusLeads.sort((a, b) => 
            new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
          );
          
          // Assign positions
          statusLeads.forEach((lead, index) => {
            if (!lead.position) {
              // Ensure lead.id is valid before converting to string
              if (lead.id && !isNaN(lead.id) && lead.id > 0) {
                positionUpdates.push({
                  id: lead.id.toString(),
                  position: index + 1
                });
              } else {
                console.warn(`Skipping position update for lead with invalid ID: ${lead.id}`);
              }
            }
          });
        }
        
        // Update positions in database
        if (positionUpdates.length > 0) {
          await updateLeadPositions(positionUpdates);
          
          // Update local state
          const updatedData = validLeads.map(lead => {
            const update = positionUpdates.find(u => u.id === lead.id.toString());
            return update ? { ...lead, position: update.position } : lead;
          });
          
          setItems(updatedData);
        } else {
          setItems(validLeads);
        }
      } else {
        setItems(validLeads);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      const errorMessage = err instanceof Error ? 
        `Failed to load leads: ${err.message}` : 
        'Failed to load leads. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Function to handle when a new lead is added
  const handleLeadAdded = () => {
    // Refetch leads
    fetchLeads();
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate summary statistics
  const totalLeads = items.length;
  const qualifiedLeads = items.filter(item => item.status === 'Qualified').length;
  const totalValue = items.reduce((sum, item) => {
    const numericValue = item.value.replace(/[^0-9]/g, '');
    return sum + (numericValue ? parseInt(numericValue) : 0);
  }, 0);
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'column') {
      setActiveColumnId(active.id as string);
    } else {
      setActiveId(active.id as string);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.data.current?.type === 'column') {
      const oldIndex = columns.findIndex(col => col.id === active.id);
      const newIndex = columns.findIndex(col => col.id === over.id);

      if (oldIndex !== newIndex) {
        setColumns(arrayMove(columns, oldIndex, newIndex));
      }
    } else {
      const activeItem = items.find(item => item.id.toString() === active.id);
      const overColumn = over.data.current?.type === 'column' ? over.id : over.data.current?.columnId;

      if (activeItem && overColumn) {
        try {
          // Moving between columns
          if (activeItem.status !== overColumn) {
            // Validate the lead ID before updating
            if (!activeItem.id || isNaN(activeItem.id) || activeItem.id <= 0) {
              console.error(`Cannot update lead with invalid ID: ${activeItem.id}`);
              return;
            }
            
            // Get items in the target column to calculate new position
            const itemsInTargetColumn = items
              .filter(item => item.status === overColumn && item.id > 0)
              .sort((a, b) => a.position - b.position);
            
            // Calculate new position (add at the end of the target column)
            const newPosition = itemsInTargetColumn.length > 0
              ? Math.max(...itemsInTargetColumn.map(item => item.position)) + 1
              : 1;
            
            // Update in Firestore
            await updateLead(activeItem.id.toString(), { 
              status: overColumn as string,
              position: newPosition
            });
            
            // Update local state
            setItems(items.map(item => 
              item.id.toString() === active.id
                ? { ...item, status: overColumn as string, position: newPosition }
                : item
            ));
          } 
          // Reordering within the same column
          else if (over.data.current?.type === 'item') {
            const itemsInSameColumn = items.filter(item => 
              item.status === activeItem.status && 
              item.id > 0 // Only include items with valid positive IDs
            );
            
            const activeIndex = itemsInSameColumn
              .sort((a, b) => a.position - b.position)
              .findIndex(item => item.id.toString() === active.id);
            
            const overIndex = itemsInSameColumn
              .sort((a, b) => a.position - b.position)
              .findIndex(item => item.id.toString() === over.id);
            
            if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
              // Get all items in the column, sorted by position
              const itemsInColumn = itemsInSameColumn.sort((a, b) => a.position - b.position);
              
              // Reorder items
              const reorderedItems = arrayMove(itemsInColumn, activeIndex, overIndex);
              
              // Update positions for all items in the column to match their new order
              const updates = reorderedItems
                .filter(item => item.id && !isNaN(item.id)) // Only include items with valid IDs
                .map((item, index) => ({
                  id: item.id.toString(),
                  position: index + 1
                }));
              
              // Use batch update for better performance
              try {
                await updateLeadPositions(updates);
                
                // Update local state for all affected items
                setItems(items.map(item => {
                  const update = updates.find(u => u.id === item.id.toString());
                  return update 
                    ? { ...item, position: update.position }
                    : item;
                }));
              } catch (err) {
                console.error('Error batch updating lead positions:', err);
              }
            }
          }
        } catch (err) {
          console.error('Error updating lead position:', err);
          // You might want to show a toast notification here
        }
      }
    }

    setActiveId(null);
    setActiveColumnId(null);
  };

  if (loading) {
    return <div className="py-10 text-center">Loading leads...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">{totalLeads}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{conversionRate}%</p>
            </div>
            <BarChart className="w-8 h-8 text-emerald-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-indigo-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Qualified Leads</p>
              <p className="text-2xl font-bold">{qualifiedLeads}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-slate-600" />
          </div>
        </Card>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <AddLeadDialog onLeadAdded={handleLeadAdded}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </AddLeadDialog>
          <Button variant="outline" className="border-slate-200">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-4">
        <SortableContext
          items={columns.map(col => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex space-x-6 min-w-full" style={{ width: `${columns.length * 320}px` }}>
            {columns.map((column) => (
              <div key={column.id} className="w-[300px] flex-shrink-0">
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  onTitleChange={(newTitle) => {
                    setColumns(columns.map(col =>
                      col.id === column.id ? { ...col, title: newTitle } : col
                    ));
                  }}
                  onColorChange={(newColor) => {
                    setColumns(columns.map(col =>
                      col.id === column.id ? { ...col, color: newColor } : col
                    ));
                  }}
                  onDelete={() => {
                    setColumns(columns.filter(col => col.id !== column.id));
                    // Move leads in deleted column to New
                    setItems(items.map(item =>
                      item.status === column.id
                        ? { ...item, status: 'New' }
                        : item
                    ));
                  }}
                  availableColors={availableColors}
                  isDeletable={column.id !== 'New'}
                >
                  <SortableContext
                    items={items
                      .filter(item => item.status === column.id)
                      .map(item => item.id.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    {items
                      .filter(item => 
                        item.status === column.id &&
                        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.company.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .sort((a, b) => a.position - b.position)
                      .map((item) => (
                        <KanbanCard
                          key={item.id}
                          id={item.id.toString()}
                          lead={item}
                          columnColor={column.color}
                        />
                      ))
                    }
                  </SortableContext>
                </KanbanColumn>
              </div>
            ))}
          </div>
        </SortableContext>
      </div>

      <DragOverlay>
        {activeId ? (
          <KanbanCard
            id={activeId}
            lead={items.find(item => item.id.toString() === activeId)!}
            columnColor={columns.find(col => col.id === items.find(item => 
              item.id.toString() === activeId
            )?.status)?.color || ''}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}