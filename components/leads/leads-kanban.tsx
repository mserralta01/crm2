"use client";

import { useState } from 'react';
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
import { leads } from '@/data/leads';

// Professional color scheme using muted, corporate tones
const initialColumns = [
  { id: 'new', title: 'New Leads', color: 'from-slate-600 to-slate-500' },
  { id: 'contacted', title: 'Contacted', color: 'from-blue-700 to-blue-600' },
  { id: 'qualified', title: 'Qualified', color: 'from-emerald-700 to-emerald-600' },
  { id: 'negotiating', title: 'Negotiating', color: 'from-indigo-700 to-indigo-600' },
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
  const [items, setItems] = useState(leads);
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate summary statistics
  const totalLeads = items.length;
  const qualifiedLeads = items.filter(item => item.status.toLowerCase() === 'qualified').length;
  const totalValue = items.reduce((sum, item) => 
    sum + parseInt(item.value.replace(/[^0-9]/g, '')), 0);
  const conversionRate = Math.round((qualifiedLeads / totalLeads) * 100);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'column') {
      setActiveColumnId(active.id as string);
    } else {
      setActiveId(active.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
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

      if (activeItem && overColumn && activeItem.status !== overColumn) {
        setItems(items.map(item => 
          item.id.toString() === active.id
            ? { ...item, status: overColumn as string }
            : item
        ));
      }
    }

    setActiveId(null);
    setActiveColumnId(null);
  };

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
              <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
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
          <Button onClick={() => {}} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
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
                    setItems(items.map(item =>
                      item.status.toLowerCase() === column.id
                        ? { ...item, status: 'New' }
                        : item
                    ));
                  }}
                  availableColors={availableColors}
                  isDeletable={column.id !== 'new'}
                >
                  <SortableContext
                    items={items
                      .filter(item => item.status.toLowerCase() === column.id)
                      .map(item => item.id.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    {items
                      .filter(item => 
                        item.status.toLowerCase() === column.id &&
                        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.company.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
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
            )?.status.toLowerCase())?.color || ''}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}