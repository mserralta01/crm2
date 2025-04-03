"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LeadNote } from '@/components/leads/lead-note';
import { addActivityToLead, updateLeadActivity, deleteLeadActivity } from '@/lib/services/leads-service';
import { Activity } from '@/data/leads';

interface NoteSectionProps {
  leadId: string;
  notes: Activity[];
}

export function NoteSection({ leadId, notes: initialNotes }: NoteSectionProps) {
  const [notes, setNotes] = useState<Activity[]>(initialNotes || []);
  const [noteText, setNoteText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use effect to update notes when initialNotes changes (like after refresh)
  useEffect(() => {
    setNotes(initialNotes || []);
  }, [initialNotes]);

  // Sort notes with pinned on top, then by date descending
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;

    setIsSaving(true);

    try {
      // Create title from first line or first few words
      const title = noteTitle.trim() || 
        (noteText.split('\n')[0].substring(0, 50) + (noteText.split('\n')[0].length > 50 ? '...' : ''));

      // Create a new note with current timestamp
      const newNote: Omit<Activity, 'id' | 'date'> = {
        type: 'note',
        title,
        description: noteText,
        isPinned: false
      };

      // Add to database
      await addActivityToLead(leadId, 'notes', newNote);

      // For optimistic UI update - create a temporary ID
      const optimisticNote: Activity = {
        ...newNote,
        id: Date.now(),
        date: new Date().toISOString(),
      };

      setNotes(prev => [optimisticNote, ...prev]);
      setNoteText('');
      setNoteTitle('');
      
      // Focus back on textarea for continuous note taking
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePinNote = async (noteId: number, isPinned: boolean) => {
    // Find the note to update
    const noteToUpdate = notes.find(note => note.id === noteId);
    if (!noteToUpdate) return;

    try {
      // Update in database
      await updateLeadActivity(leadId, 'notes', noteId, { isPinned });

      // Update in state for immediate UI feedback
      setNotes(prev => 
        prev.map(note => 
          note.id === noteId ? { ...note, isPinned } : note
        )
      );
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      // Delete from database
      await deleteLeadActivity(leadId, 'notes', noteId);

      // Update state
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <div className="space-y-3">
        <Input
          type="text"
          placeholder="Note title (optional)"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
        />
        <Textarea 
          ref={textareaRef}
          placeholder="Add a note..." 
          className="min-h-[100px]"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => {
            // Save on Ctrl+Enter
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSaveNote();
            }
          }}
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Press Ctrl+Enter to save
          </div>
          <Button 
            onClick={handleSaveNote} 
            disabled={isSaving || !noteText.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </div>
      
      {/* Notes list */}
      {sortedNotes.length > 0 ? (
        <div className="space-y-4 mt-6">
          {sortedNotes.map(note => (
            <LeadNote
              key={note.id}
              id={note.id}
              title={note.title}
              description={note.description}
              date={note.date}
              isPinned={note.isPinned}
              onPin={handlePinNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-4 text-muted-foreground mt-6">
          No notes found. Add your first note above.
        </div>
      )}
    </div>
  );
} 