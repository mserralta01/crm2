"use client";

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Palette, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  children: React.ReactNode;
  onTitleChange: (newTitle: string) => void;
  onColorChange: (newColor: string) => void;
  onDelete: () => void;
  availableColors: { id: string; gradient: string }[];
  isDeletable: boolean;
}

export function KanbanColumn({
  id,
  title,
  color,
  children,
  onTitleChange,
  onColorChange,
  onDelete,
  availableColors,
  isDeletable
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type: 'column',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleSubmit = () => {
    if (editedTitle.trim()) {
      onTitleChange(editedTitle);
    } else {
      setEditedTitle(title);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col h-full"
      {...attributes}
    >
      <div
        className={`bg-gradient-to-r ${color} py-2 px-4 cursor-move mb-4 w-full`}
        {...listeners}
      >
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="bg-white/90 border-none"
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between text-white">
            <h3 className="font-semibold">{title}</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
                  >
                    <Palette className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {availableColors.map((colorOption) => (
                      <button
                        key={colorOption.id}
                        onClick={() => onColorChange(colorOption.gradient)}
                        className={`w-6 h-6 rounded-full bg-gradient-to-r ${colorOption.gradient} hover:opacity-80 transition-opacity`}
                      />
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {isDeletable && (
                <button
                  onClick={onDelete}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Card className="flex-1 p-4 bg-muted/50">
        <div className="space-y-4">
          {children}
        </div>
      </Card>
    </div>
  );
}