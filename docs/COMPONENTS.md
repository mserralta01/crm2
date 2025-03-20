# Component Documentation

## Leads Management Interface

### Kanban Board

The Kanban board interface has been redesigned to provide a more professional and efficient experience for sales teams. Key improvements include:

#### Visual Design
- Professional color palette using muted, corporate tones
- Refined typography with clear hierarchy
- Subtle shadows and borders for depth
- Improved contrast and readability
- Enhanced animations and transitions during drag operations

#### Layout
- Summary statistics dashboard showing key metrics
- Streamlined column headers
- Consistent spacing and alignment
- Horizontal scrolling for multiple columns

#### Lead Cards
- Enhanced information density
- Clear visual hierarchy
- Quick action buttons
- Status indicators
- Last activity timestamps
- Value prominence
- Improved drag handles and feedback

#### Functionality
- Improved drag-and-drop between columns using @hello-pangea/dnd
- Smoother animations during drag operations
- Better accessibility features
- Quick filters and search
- Column customization
- Lead management actions
- Optimistic UI updates

### Components

#### LeadsKanban
- Main container for the Kanban board
- Uses @hello-pangea/dnd for drag-and-drop functionality
- Manages lead filtering and sorting
- Displays summary statistics
- Handles optimistic UI updates

#### KanbanColumn
- Individual column component
- Customizable title and color
- Column-specific actions
- Lead card container

#### KanbanCard
- Individual lead card component
- Contact information display
- Quick action buttons
- Status and value indicators
- Last activity timestamp
- Uses Draggable component for drag interactions

### Technical Improvements

1. **Drag and Drop**
   - Migrated from dnd-kit to @hello-pangea/dnd
   - Improved animation quality and feel
   - Better drag previews
   - Enhanced accessibility
   - Reduced code complexity

2. **Performance**
   - Optimized rendering during drag operations
   - Reduced unnecessary re-renders
   - Improved position calculations
   - Better handling of problematic data

3. **Architecture**
   - SSR-compatible via dynamic imports
   - Cleaner component structure
   - Better TypeScript integration
   - Improved error handling

### Component Structure

The Kanban implementation uses a layered approach:

1. **leads-kanban.tsx**
   - Simple re-export that preserves the original component name
   - Maintains compatibility with existing imports

2. **kanban-wrapper.tsx**
   - Dynamic import wrapper 
   - Disables SSR for drag and drop components
   - Solves React/TypeScript compatibility issues

3. **leads-kanban-impl.tsx**
   - Actual implementation
   - Uses @hello-pangea/dnd directly
   - Manages all UI and data state

### Lead Management

The Kanban implementation integrates with several core services:

1. **getLeads()**
   - Fetches leads from Firestore
   - Handled in useEffect on component mount

2. **updateLead()**
   - Updates a lead's status when moved between columns
   - Called after optimistic UI updates

3. **updateLeadPositions()**
   - Batch updates lead positions within a column
   - Called after drag operations complete

4. **identifyProblematicLeads()**
   - Finds leads with data issues
   - Prevents problematic leads from being dragged

### Improvements

1. Professional Aesthetic
   - Replaced bright colors with corporate tones
   - Enhanced typography and spacing
   - Added subtle shadows and borders
   - Improved visual hierarchy

2. Usability
   - Added summary statistics
   - Improved card information density
   - Enhanced action accessibility
   - Added tooltips and hover states

3. Functionality
   - Quick filters and search
   - Column customization
   - Lead management actions
   - Activity tracking

4. Performance
   - Optimized drag-and-drop
   - Efficient rendering
   - Smooth animations