# Technical Reference: Notes System

## Database Schema

### Activity Interface

The Lead Notes feature uses the Activity interface extended with the `isPinned` property:

```typescript
export interface Activity {
  id: number;              // Unique identifier (timestamp-based)
  type: 'note' | ...;      // Type of activity
  title: string;           // Note title
  description: string;     // Note content
  date: string;            // ISO date string
  isPinned?: boolean;      // Whether the note is pinned
  // Other optional properties
  status?: string;
  duration?: string;
  attachments?: string[];
}
```

## Core Components

### NoteSection Component

The main container component that handles:
- Note creation
- State management
- Sorting (pinned notes first, then by date)
- Database operations

The component uses local state to manage notes, then syncs with Firestore for persistence:

```typescript
// Key state variables
const [notes, setNotes] = useState<Activity[]>(initialNotes || []);
const [noteText, setNoteText] = useState('');
const [noteTitle, setNoteTitle] = useState('');

// Key operations
const handleSaveNote = async () => { /* ... */ }
const handlePinNote = async (noteId: number, isPinned: boolean) => { /* ... */ }
const handleDeleteNote = async (noteId: number) => { /* ... */ }
```

### LeadNote Component

Individual note display with pin/delete functionality:

```typescript
interface LeadNoteProps {
  id: number;
  title: string;
  description: string;
  date: string;
  isPinned?: boolean;
  onPin: (id: number, isPinned: boolean) => void;
  onDelete: (id: number) => void;
}
```

## Service Functions

### Adding a Note

```typescript
// Add a new note
await addActivityToLead(leadId, 'notes', {
  type: 'note',
  title: 'Note Title',
  description: 'Note content...',
  isPinned: false
});
```

### Updating a Note (e.g., Pinning)

```typescript
// Pin or unpin a note
await updateLeadActivity(leadId, 'notes', noteId, { 
  isPinned: true 
});
```

### Deleting a Note

```typescript
// Delete a note
await deleteLeadActivity(leadId, 'notes', noteId);
```

## Sorting Algorithm

Notes are sorted with pinned items at the top, then by reverse chronological order:

```typescript
const sortedNotes = [...notes].sort((a, b) => {
  // First sort by pin status
  if (a.isPinned && !b.isPinned) return -1;
  if (!a.isPinned && b.isPinned) return 1;
  
  // Then sort by date descending (newest first)
  return new Date(b.date).getTime() - new Date(a.date).getTime();
});
```

## Optimistic UI Updates

For a better user experience, the UI is updated immediately before the database operation completes. If the operation fails, error handling should be implemented to revert the UI state.

```typescript
// Example of optimistic UI update (pinning)
setNotes(prev => 
  prev.map(note => 
    note.id === noteId ? { ...note, isPinned } : note
  )
);

// Then perform the actual database operation
await updateLeadActivity(leadId, 'notes', noteId, { isPinned });
```

## Styling Guidelines

Pinned notes use the following Tailwind CSS classes:

```typescript
// For pinned notes
className={cn(
  "p-4 transition-colors", 
  isPinned ? "bg-amber-50/80 border-amber-200" : "bg-muted/50",
  isHovered && "shadow-md"
)}
```

The "PINNED" label uses:

```typescript
<span className="ml-2 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm text-[10px] font-medium uppercase">
  Pinned
</span>
``` 