# Lead Notes System Documentation

## Overview

The Lead Notes system provides a powerful way to track customer interactions, important information, and follow-up items. The system supports unlimited notes for each lead with advanced pinning capabilities to highlight important information.

## Key Features

### 1. Note Management
- **Unlimited Notes**: Create and store as many notes as needed for each lead
- **Rich Text Support**: Preserves line breaks and formatting in notes
- **Auto-Title Generation**: Automatically extracts titles from note content when not specified
- **Keyboard Shortcuts**: Use Ctrl+Enter (or Cmd+Enter on Mac) to quickly save notes

### 2. Pin System
- **Pin Important Notes**: Click the pin icon to highlight critical information
- **Visual Indicators**: Pinned notes have:
  - Light yellow background
  - Amber-colored border
  - "PINNED" label badge
  - Persistent pin icon
- **Automatic Sorting**: Pinned notes always appear at the top of the list

### 3. Database Integration
- **Real-time Saving**: All notes are immediately saved to the database
- **Persistent Storage**: Notes remain available after page refreshes or navigation
- **Timestamp Tracking**: Each note records exact date and time of creation
- **Customer Association**: Notes are properly linked to specific leads

## How to Use the Notes Feature

### Creating Notes
1. Navigate to any lead's detail page
2. Select the "Notes" tab in the right column
3. Optionally enter a title (if blank, one will be generated from content)
4. Type your note in the text area
5. Click "Save Note" or press Ctrl+Enter (Cmd+Enter on Mac)

### Managing Notes
- **View History**: Scroll down to see all previous notes in chronological order
- **Pin Important Notes**: Click the pin icon to move important notes to the top
- **Unpin Notes**: Click the pin icon again to return to chronological sorting
- **Delete Notes**: Use the dropdown menu on any note and select "Delete"

### Best Practices
- Use concise titles for better scanning and organization
- Pin only truly important notes to maintain visual clarity
- Unpin resolved issues to keep the interface clean
- Use consistent formatting for similar types of notes

## Technical Implementation

The Notes feature consists of several interconnected components:

1. **NoteSection Component** (`/components/leads/note-section.tsx`)
   - Main container for note creation and display
   - Handles note sorting, state management, and database operations

2. **LeadNote Component** (`/components/leads/lead-note.tsx`)
   - Individual note display with pinning functionality
   - Provides contextual actions through dropdown menu
   - Implements visual styling for pinned/unpinned states

3. **Database Services** (`/lib/services/leads-service.ts`)
   - `addActivityToLead`: Creates new notes in the database
   - `updateLeadActivity`: Handles pin/unpin operations
   - `deleteLeadActivity`: Removes notes from the database

4. **Data Model** (`/data/leads.ts`)
   - Added `isPinned` property to the `Activity` interface
   - Type-safe implementation for pinned notes

## Upcoming Enhancements

Future updates to the note system are planned:

1. Rich text editing with formatting options (bold, italic, etc.)
2. Note categorization with tags or labels
3. Search functionality to find specific notes
4. Note reminders with calendar integration
5. Note sharing between team members 