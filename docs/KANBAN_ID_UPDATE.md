# Kanban ID Format Update Documentation

## Overview

This document details the changes made to fix the issue with lead ID handling in the Kanban board, particularly when moving leads between columns and updating their positions.

## Issue

The application was experiencing an error when attempting to update leads:

```
Cannot update non-existent lead with ID: 1742496500248
Error updating lead: Error: Lead with ID 1742496500248 does not exist
```

The root cause was a mismatch between how lead IDs were stored and referenced:
- In Firestore, each document has a unique ID like `ZD7cty3QvnRRUMuWaqaW`
- Inside the document, there was a `numericId` field (e.g., `1742496500248`)
- The Lead interface used the numeric ID, but database operations needed the document ID

## Changes Implemented

### 1. Updated Lead Interface (`data/leads.ts`)

Changed the Lead interface to use string IDs, matching Firestore's document IDs:

```typescript
export interface Lead {
  id: string;        // Changed from number to string (Firestore document ID)
  numericId: number; // Added to store the numeric ID separately
  // ...other fields
}
```

### 2. Modified Firestore Converter (`lib/services/leads-service.ts`)

Updated the leadConverter to properly handle the string IDs:

```typescript
const leadConverter: FirestoreDataConverter<Lead> = {
  toFirestore(lead: Lead): DocumentData {
    const { id, ...leadData } = lead;
    // ...existing conversion code
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Lead {
    const data = snapshot.data();
    
    // Use document ID as the lead ID
    return {
      id: snapshot.id, // Use the document ID (string)
      numericId: data.numericId || Date.now(),
      // ...other fields
    };
  }
}
```

### 3. Updated Lead Creation Logic

Modified the `createLead` function to handle both ID types:

```typescript
export async function createLead(leadData: Omit<Lead, 'id' | 'numericId'>): Promise<string> {
  // ...existing code
  const timestampId = Date.now();
  const firestoreLead = {
    ...leadData,
    numericId: timestampId,
    // ...other fields
  };
  // Document ID will become the lead.id
  const docRef = await addDoc(leadsCollection, firestoreLead);
  return docRef.id;
}
```

### 4. Fixed Kanban Drag and Drop Logic

Updated `handleDragEnd` in the Kanban implementation to use document IDs consistently:

```typescript
const handleDragEnd = async (result: DropResult) => {
  // ...existing code
  const lead = items.find(item => item.id === draggableId);
  
  // Use lead.id directly (it's now a string matching the Firestore document ID)
  await updateLead(lead.id, { 
    status: destination.droppableId 
  });
  
  // Updated positions
  await updateLeadPositions(
    updatedDestinationLeads.map(lead => ({
      id: lead.id, // Use document ID
      position: lead.position
    }))
  );
};
```

### 5. Added Better Error Recovery

Improved error handling to ensure UI consistency:

```typescript
try {
  // Database operations...
} catch (error) {
  console.error("Error updating lead:", error);
  
  // Reload data from server to ensure UI consistency
  setTimeout(() => {
    fetchLeads();
  }, 1000);
}
```

## Benefits

1. **Consistency**: IDs now consistently refer to the Firestore document ID
2. **Robustness**: Better error handling with automatic recovery
3. **Type Safety**: Improved TypeScript type checking for IDs
4. **Performance**: Fewer conversions between string and number IDs

## Migration Path

This change is backward compatible because:
1. The `numericId` field is still preserved for existing code that may reference it
2. Firestore documents maintain their existing structure
3. The Lead interface extends the previous one rather than replacing it 