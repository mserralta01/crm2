import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lead } from '@/data/leads';

// Collection name
const LEADS_COLLECTION = 'leads';

// Define a converter for the Lead type
const leadConverter: FirestoreDataConverter<Lead> = {
  toFirestore(lead: Lead): DocumentData {
    // Convert Lead to Firestore format
    // We need to remove the id since it's stored as the document ID
    const { id, ...leadData } = lead;
    
    // Add the ID as a numericId field to ensure we can retrieve it later
    const firestoreData = {
      ...leadData,
      // We don't need to store the document ID - it's already the document ID
      // Just keep numericId field for backward compatibility
      position: lead.position || 0, // Ensure position is included
      createdAt: Timestamp.fromDate(new Date(lead.createdAt)),
      lastActivity: Timestamp.fromDate(new Date(lead.lastActivity)),
      // Convert complex activity objects
      activities: {
        calls: lead.activities.calls.map(call => ({
          ...call,
          date: Timestamp.fromDate(new Date(call.date))
        })),
        notes: lead.activities.notes.map(note => ({
          ...note,
          date: Timestamp.fromDate(new Date(note.date))
        })),
        emails: lead.activities.emails.map(email => ({
          ...email,
          date: Timestamp.fromDate(new Date(email.date))
        })),
        meetings: lead.activities.meetings.map(meeting => ({
          ...meeting,
          date: Timestamp.fromDate(new Date(meeting.date))
        })),
        documents: lead.activities.documents.map(document => ({
          ...document,
          date: Timestamp.fromDate(new Date(document.date))
        }))
      }
    };
    
    return firestoreData;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): Lead {
    const data = snapshot.data(options);
    
    // Determine the numeric ID from the numericId field or generate one if needed
    let numericId: number;
    if (data.numericId !== undefined && !isNaN(Number(data.numericId))) {
      // Use the numericId field if it exists and is valid
      numericId = Number(data.numericId);
    } else {
      // Fall back to generating a timestamp as numericId
      numericId = Date.now();
    }
    
    // Helper function to safely convert Timestamp to ISO string
    const safeTimestampToISOString = (timestamp: any) => {
      if (!timestamp) return new Date().toISOString(); // Default to current date
      if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toISOString();
      }
      return new Date().toISOString(); // Fallback
    };
    
    // Helper function to safely convert activity date
    const safeActivityDateToISOString = (activity: any) => {
      if (!activity || !activity.date) return { ...activity, date: new Date().toISOString() };
      return {
        ...activity,
        date: safeTimestampToISOString(activity.date)
      };
    };
    
    // Convert Firestore data to Lead type
    return {
      id: snapshot.id, // Use the document ID (string)
      numericId,       // Use the numeric ID from data
      firstName: data.firstName || (data.name ? data.name.split(' ')[0] || '' : ''), // Handle migration from name
      lastName: data.lastName || (data.name ? data.name.split(' ').slice(1).join(' ') || '' : ''), // Handle migration from name
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      status: data.status || 'New',
      value: data.value || '$0',
      position: data.position || 0, // Include position with default
      createdAt: safeTimestampToISOString(data.createdAt),
      lastActivity: safeTimestampToISOString(data.lastActivity),
      
      // Address fields - preserve exactly as stored
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode, 
      country: data.country,
      
      // Lead source information
      source: data.source,
      referredBy: data.referredBy,
      campaign: data.campaign,
      
      // Tags - ensure it's an array
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      
      // Custom fields
      customFields: data.customFields || [],
      
      // Social profiles
      socialProfiles: data.socialProfiles || {},
      
      // Business details
      website: data.website,
      industry: data.industry,
      companySize: data.companySize,
      annualRevenue: data.annualRevenue,
      
      // Lead preferences
      budget: data.budget,
      timeline: data.timeline,
      preferredContact: data.preferredContact,
      keyRequirements: data.keyRequirements,
      
      activities: {
        calls: Array.isArray(data.activities?.calls) 
          ? data.activities.calls.map(safeActivityDateToISOString) 
          : [],
        notes: Array.isArray(data.activities?.notes) 
          ? data.activities.notes.map(safeActivityDateToISOString) 
          : [],
        emails: Array.isArray(data.activities?.emails) 
          ? data.activities.emails.map(safeActivityDateToISOString) 
          : [],
        meetings: Array.isArray(data.activities?.meetings) 
          ? data.activities.meetings.map(safeActivityDateToISOString) 
          : [],
        documents: Array.isArray(data.activities?.documents) 
          ? data.activities.documents.map(safeActivityDateToISOString) 
          : []
      }
    };
  }
};

// Get all leads
export async function getLeads(): Promise<Lead[]> {
  try {
    console.log('Fetching all leads from database');
    const leadsRef = collection(db, LEADS_COLLECTION).withConverter(leadConverter);
    
    // Don't sort in the query - we'll sort by position after grouping by status
    const q = query(leadsRef);
    const querySnapshot = await getDocs(q);
    
    const leads: Lead[] = [];
    let leadsWithoutPosition = 0;
    
    querySnapshot.forEach((doc) => {
      try {
        const leadData = doc.data();
        
        // Log any lead without a valid position for debugging
        if (leadData.position === undefined || isNaN(leadData.position)) {
          leadsWithoutPosition++;
          console.log(`Lead ${leadData.id} has no valid position`);
        }
        
        leads.push(leadData);
      } catch (conversionError) {
        console.error(`Error converting lead document ${doc.id}:`, conversionError);
        // Skip this document and continue with others
      }
    });
    
    if (leadsWithoutPosition > 0) {
      console.warn(`Found ${leadsWithoutPosition} leads without valid positions`);
    }
    
    // Group leads by status
    const leadsByStatus: Record<string, Lead[]> = {};
    
    leads.forEach(lead => {
      if (!leadsByStatus[lead.status]) {
        leadsByStatus[lead.status] = [];
      }
      leadsByStatus[lead.status].push(lead);
    });
    
    // Sort each status group by position
    Object.keys(leadsByStatus).forEach(status => {
      leadsByStatus[status].sort((a, b) => {
        // Use default position 999 for leads without a position
        const posA = a.position !== undefined && !isNaN(a.position) ? a.position : 999;
        const posB = b.position !== undefined && !isNaN(b.position) ? b.position : 999;
        
        // Log sorting comparisons for debugging
        // console.log(`Comparing ${a.id} (pos: ${posA}) with ${b.id} (pos: ${posB})`);
        
        return posA - posB;
      });
      
      // Log the sorted positions for this status
      console.log(`Sorted leads for status "${status}": `, 
        leadsByStatus[status].map(lead => `${lead.id}:${lead.position}`).join(', ')
      );
    });
    
    // Flatten the leads back into a single array
    const sortedLeads: Lead[] = [];
    Object.values(leadsByStatus).forEach(statusLeads => {
      sortedLeads.push(...statusLeads);
    });
    
    console.log(`Retrieved ${sortedLeads.length} leads, sorted by position within each status`);
    
    return sortedLeads;
  } catch (error) {
    console.error('Error getting leads:', error);
    throw error;
  }
}

// Get a lead by ID
export async function getLeadById(id: string): Promise<Lead | null> {
  try {
    const leadRef = doc(db, LEADS_COLLECTION, id).withConverter(leadConverter);
    const docSnap = await getDoc(leadRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting lead:', error);
    throw error;
  }
}

// Get leads by status
export async function getLeadsByStatus(status: string): Promise<Lead[]> {
  try {
    const leadsRef = collection(db, LEADS_COLLECTION).withConverter(leadConverter);
    const q = query(
      leadsRef, 
      where('status', '==', status),
      orderBy('lastActivity', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      leads.push(doc.data());
    });
    
    return leads;
  } catch (error) {
    console.error('Error getting leads by status:', error);
    throw error;
  }
}

// Create a new lead
export async function createLead(leadData: Omit<Lead, 'id' | 'numericId'>): Promise<string> {
  try {
    const now = new Date().toISOString();
    
    // If no position is specified, find the max position for leads with the same status
    let position = leadData.position || 0;
    if (!position) {
      const leadsWithSameStatus = await getLeadsByStatus(leadData.status || 'New');
      position = leadsWithSameStatus.length > 0
        ? Math.max(...leadsWithSameStatus.map(lead => lead.position || 0)) + 1
        : 1;
    }
    
    // Generate a timestamp ID for the lead
    const timestampId = Date.now();
    
    // Ensure tags is never undefined
    const tags = leadData.tags || [];
    
    // Clean the data for Firestore - replace undefined with null or default values
    const cleanedData = { ...leadData };
    
    // Handle undefined values
    if (cleanedData.tags === undefined) cleanedData.tags = [];
    if (cleanedData.customFields === undefined) cleanedData.customFields = [];
    if (cleanedData.socialProfiles === undefined) cleanedData.socialProfiles = {};
    
    // Prepare the lead with Firestore-compatible data
    const firestoreLead = {
      ...cleanedData,
      tags,
      position,
      numericId: timestampId, // Set a numeric ID
      createdAt: Timestamp.fromDate(new Date(now)),
      lastActivity: Timestamp.fromDate(new Date(now)),
      activities: {
        calls: (leadData.activities?.calls || []).map(a => ({
          ...a,
          date: a.date ? Timestamp.fromDate(new Date(a.date)) : Timestamp.fromDate(new Date(now))
        })),
        notes: (leadData.activities?.notes || []).map(a => ({
          ...a,
          date: a.date ? Timestamp.fromDate(new Date(a.date)) : Timestamp.fromDate(new Date(now))
        })),
        emails: (leadData.activities?.emails || []).map(a => ({
          ...a,
          date: a.date ? Timestamp.fromDate(new Date(a.date)) : Timestamp.fromDate(new Date(now))
        })),
        meetings: (leadData.activities?.meetings || []).map(a => ({
          ...a,
          date: a.date ? Timestamp.fromDate(new Date(a.date)) : Timestamp.fromDate(new Date(now))
        })),
        documents: (leadData.activities?.documents || []).map(a => ({
          ...a,
          date: a.date ? Timestamp.fromDate(new Date(a.date)) : Timestamp.fromDate(new Date(now))
        }))
      }
    };
    
    // Add the document to Firestore
    const leadsCollection = collection(db, LEADS_COLLECTION);
    const docRef = await addDoc(leadsCollection, firestoreLead);
    
    console.log(`Added lead with ID: ${docRef.id}, numericId: ${timestampId}`);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

// Update a lead
export async function updateLead(id: string, leadData: Partial<Lead>): Promise<void> {
  try {
    // Validate the ID before proceeding
    if (!id || id === 'NaN' || id === 'undefined' || id === '-1') {
      console.error(`Cannot update lead with invalid ID: ${id}`);
      throw new Error(`Invalid lead ID: ${id}`);
    }
    
    // Ensure position is a valid number if provided
    if (leadData.position !== undefined) {
      if (isNaN(leadData.position)) {
        console.error(`Cannot update lead with invalid position: ${leadData.position}`);
        throw new Error(`Invalid position value: ${leadData.position}`);
      }
      // Log position update for debugging
      console.log(`Updating lead ${id} position to ${leadData.position}`);
    }
    
    console.log(`Updating lead ${id} with data:`, JSON.stringify(leadData));
    
    const leadRef = doc(db, LEADS_COLLECTION, id);
    
    // Check if document exists before updating
    const docSnap = await getDoc(leadRef);
    if (!docSnap.exists()) {
      console.error(`Cannot update non-existent lead with ID: ${id}`);
      throw new Error(`Lead with ID ${id} does not exist`);
    }
    
    // Get current data to log changes
    const currentData = docSnap.data();
    
    // Clean up the data for Firestore (remove undefined values)
    const cleanedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(leadData)) {
      // Skip undefined values - Firestore doesn't accept them
      if (value === undefined) continue;
      
      // Handle tags specifically - ensure it's never undefined
      if (key === 'tags' && value === undefined) {
        cleanedData[key] = [];
      } else {
        cleanedData[key] = value;
      }
    }
    
    // Update the last activity timestamp and provided fields
    const updateData = {
      ...cleanedData,
      lastActivity: Timestamp.now()
    };
    
    await updateDoc(leadRef, updateData);
    
    // Verify the update was successful for position changes
    if (leadData.position !== undefined) {
      const updatedSnap = await getDoc(leadRef);
      if (updatedSnap.exists()) {
        const newData = updatedSnap.data();
        console.log(`Verification: Lead ${id} position changed from ${currentData.position || 'undefined'} to ${newData.position}`);
      }
    }
    
    console.log(`Successfully updated lead ${id}`);
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

// Delete a lead
export async function deleteLead(id: string): Promise<void> {
  try {
    const leadRef = doc(db, LEADS_COLLECTION, id);
    await deleteDoc(leadRef);
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

// Add an activity to a lead
export async function addActivityToLead(
  leadId: string, 
  activityType: 'calls' | 'notes' | 'emails' | 'meetings' | 'documents',
  activityData: any
): Promise<void> {
  try {
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    const leadDoc = await getDoc(leadRef);
    
    if (!leadDoc.exists()) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }
    
    const leadData = leadDoc.data();
    const activities = leadData?.activities || {
      calls: [],
      notes: [],
      emails: [],
      meetings: [],
      documents: []
    };
    
    // Add the new activity with timestamp
    const newActivity = {
      ...activityData,
      id: Date.now(), // Generate a unique ID
      date: Timestamp.now()
    };
    
    // Update the specific activity array
    const updatedActivities = {
      ...activities,
      [activityType]: [...(activities[activityType] || []), newActivity]
    };
    
    // Update the lead document
    await updateDoc(leadRef, {
      activities: updatedActivities,
      lastActivity: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
}

// Seed initial lead data (for development only)
export async function seedLeads(initialLeads: Lead[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    for (const lead of initialLeads) {
      const newLeadRef = doc(collection(db, LEADS_COLLECTION));
      const { id, ...leadData } = lead;
      
      // Convert date strings to Firestore Timestamps
      const firestoreData = {
        ...leadData,
        createdAt: Timestamp.fromDate(new Date(lead.createdAt)),
        lastActivity: Timestamp.fromDate(new Date(lead.lastActivity)),
        // Convert complex activity objects
        activities: {
          calls: lead.activities.calls.map(call => ({
            ...call,
            date: Timestamp.fromDate(new Date(call.date))
          })),
          notes: lead.activities.notes.map(note => ({
            ...note,
            date: Timestamp.fromDate(new Date(note.date))
          })),
          emails: lead.activities.emails.map(email => ({
            ...email,
            date: Timestamp.fromDate(new Date(email.date))
          })),
          meetings: lead.activities.meetings.map(meeting => ({
            ...meeting,
            date: Timestamp.fromDate(new Date(meeting.date))
          })),
          documents: lead.activities.documents.map(document => ({
            ...document,
            date: Timestamp.fromDate(new Date(document.date))
          }))
        }
      };
      
      batch.set(newLeadRef, firestoreData);
    }
    
    await batch.commit();
    console.log('Successfully seeded leads data');
  } catch (error) {
    console.error('Error seeding leads:', error);
    throw error;
  }
}

// Add a batch update function for updating multiple lead positions
export async function updateLeadPositions(updates: { id: string; position: number }[]): Promise<void> {
  try {
    console.log(`Attempting to update positions for ${updates.length} leads:`, JSON.stringify(updates));
    
    if (updates.length === 0) {
      console.log('No lead position updates to process');
      return;
    }
    
    // First, check which documents actually exist
    const validUpdates: { id: string; position: number; exists: boolean }[] = [];
    
    for (const update of updates) {
      // Ensure id is a valid string and not NaN or -1
      if (!update.id || update.id === 'NaN' || update.id === 'undefined' || update.id === '-1') {
        console.warn(`Skipping update for invalid lead ID: ${update.id}`);
        continue;
      }
      
      // Ensure position is a valid number
      if (update.position === undefined || isNaN(update.position)) {
        console.warn(`Skipping update for lead ${update.id} with invalid position: ${update.position}`);
        continue;
      }
      
      try {
        // Check if document exists
        const leadRef = doc(db, LEADS_COLLECTION, update.id);
        const docSnap = await getDoc(leadRef);
        validUpdates.push({
          ...update,
          exists: docSnap.exists()
        });
      } catch (checkError) {
        console.warn(`Error checking if lead ${update.id} exists:`, checkError);
      }
    }
    
    // Filter to only include existing documents
    const existingDocUpdates = validUpdates.filter(update => update.exists);
    
    if (existingDocUpdates.length < validUpdates.length) {
      console.warn(`Skipping updates for ${validUpdates.length - existingDocUpdates.length} non-existent leads`);
    }
    
    if (existingDocUpdates.length === 0) {
      console.log('No valid lead position updates to commit (no existing documents)');
      return;
    }
    
    console.log(`Proceeding with batch update for ${existingDocUpdates.length} leads`);
    
    // Now proceed with batch update for existing documents only
    const batch = writeBatch(db);
    
    for (const update of existingDocUpdates) {
      const leadRef = doc(db, LEADS_COLLECTION, update.id);
      
      // Log each update for debugging
      console.log(`Adding to batch: Lead ${update.id} → Position ${update.position}`);
      
      // Use updateDoc instead of set with merge to ensure we're only updating the fields we want
      // This prevents any potential issues with merge behavior
      batch.update(leadRef, { 
        position: update.position,
        lastActivity: Timestamp.now()
      });
    }
    
    // Commit the batch and verify success
    await batch.commit();
    console.log(`Successfully committed position updates for ${existingDocUpdates.length} leads`);
    
    // Double-check that updates were applied correctly
    for (const update of existingDocUpdates.slice(0, 2)) { // Check first 2 for validation
      try {
        const leadRef = doc(db, LEADS_COLLECTION, update.id);
        const docSnap = await getDoc(leadRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log(`Verification: Lead ${update.id} position is now ${data.position}`);
        }
      } catch (verifyError) {
        console.warn(`Error verifying update for lead ${update.id}:`, verifyError);
      }
    }
  } catch (error) {
    console.error('Error updating lead positions:', error);
    throw error;
  }
}

// Migrate existing leads to have numericId field
export async function migrateLeadsToNumericId(): Promise<void> {
  try {
    console.log('Starting lead migration to add numericId field...');
    const leadsRef = collection(db, LEADS_COLLECTION);
    const querySnapshot = await getDocs(leadsRef);
    
    const batch = writeBatch(db);
    let updateCount = 0;
    
    querySnapshot.forEach((document) => {
      const data = document.data();
      
      // Only add numericId if it doesn't exist already
      if (data.numericId === undefined) {
        const parsedId = parseInt(document.id, 10);
        
        if (!isNaN(parsedId)) {
          batch.update(document.ref, { numericId: parsedId });
          updateCount++;
        } else {
          // For documents with unparseable IDs, we'll generate a unique timestamp-based ID
          const timestampId = Date.now() + Math.floor(Math.random() * 1000);
          batch.update(document.ref, { numericId: timestampId });
          updateCount++;
        }
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Migration complete. Updated ${updateCount} leads with numericId.`);
    } else {
      console.log('No leads needed migration.');
    }
  } catch (error) {
    console.error('Error migrating leads:', error);
    throw error;
  }
}

// Identify problematic leads in the database
export async function identifyProblematicLeads(): Promise<string[]> {
  try {
    console.log('Scanning for problematic leads...');
    const leadsRef = collection(db, LEADS_COLLECTION);
    const querySnapshot = await getDocs(leadsRef);
    
    const problematicLeadIds: string[] = [];
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        
        // Check for missing required fields
        const missingFields = [];
        // Don't check for name which doesn't exist in our schema
        // if (!data.name) missingFields.push('name');
        if (!data.status) missingFields.push('status');
        
        // Timestamps can be missing, don't treat as problematic
        // if (!data.createdAt) missingFields.push('createdAt');
        // if (!data.lastActivity) missingFields.push('lastActivity');
        
        // Check for invalid timestamp fields
        const invalidFields = [];
        if (data.createdAt && typeof data.createdAt === 'object' && 
            typeof data.createdAt.toDate !== 'function') {
          invalidFields.push('createdAt');
        }
        if (data.lastActivity && typeof data.lastActivity === 'object' && 
            typeof data.lastActivity.toDate !== 'function') {
          invalidFields.push('lastActivity');
        }
        
        if (missingFields.length > 0 || invalidFields.length > 0) {
          console.warn(`Problematic lead found (ID: ${doc.id})`);
          if (missingFields.length > 0) {
            console.warn(`  Missing fields: ${missingFields.join(', ')}`);
          }
          if (invalidFields.length > 0) {
            console.warn(`  Invalid fields: ${invalidFields.join(', ')}`);
          }
          problematicLeadIds.push(doc.id);
        }
      } catch (error) {
        console.error(`Error analyzing lead ${doc.id}:`, error);
        problematicLeadIds.push(doc.id);
      }
    });
    
    console.log(`Found ${problematicLeadIds.length} problematic leads`);
    return problematicLeadIds;
  } catch (error) {
    console.error('Error identifying problematic leads:', error);
    return []; // Return an empty array on error instead of throwing
  }
}