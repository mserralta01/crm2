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
      numericId: id, // Store the numeric ID as a field
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
    
    // Generate a unique negative number for invalid IDs
    // This avoids the warning about duplicate keys when multiple items have invalid IDs
    const generateUniqueInvalidId = () => {
      return -Math.floor(Math.random() * 1000000 + 1);
    };
    
    // Determine the ID - use numericId if available, otherwise try to parse the document ID
    let id: number;
    if (data.numericId !== undefined && !isNaN(Number(data.numericId))) {
      // Use the numericId field if it exists and is valid
      id = Number(data.numericId);
    } else {
      // Fall back to parsing the document ID
      id = isNaN(Number(snapshot.id)) ? generateUniqueInvalidId() : Number(snapshot.id);
    }
    
    // Convert Firestore data to Lead type
    return {
      id: id, // Use the determined ID
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      status: data.status,
      value: data.value,
      position: data.position || 0, // Include position with default
      createdAt: data.createdAt.toDate().toISOString(),
      lastActivity: data.lastActivity.toDate().toISOString(),
      activities: {
        calls: data.activities?.calls?.map((call: any) => ({
          ...call,
          date: call.date.toDate().toISOString()
        })) || [],
        notes: data.activities?.notes?.map((note: any) => ({
          ...note,
          date: note.date.toDate().toISOString()
        })) || [],
        emails: data.activities?.emails?.map((email: any) => ({
          ...email,
          date: email.date.toDate().toISOString()
        })) || [],
        meetings: data.activities?.meetings?.map((meeting: any) => ({
          ...meeting,
          date: meeting.date.toDate().toISOString()
        })) || [],
        documents: data.activities?.documents?.map((document: any) => ({
          ...document,
          date: document.date.toDate().toISOString()
        })) || []
      }
    };
  }
};

// Get all leads
export async function getLeads(): Promise<Lead[]> {
  try {
    const leadsRef = collection(db, LEADS_COLLECTION).withConverter(leadConverter);
    const q = query(leadsRef, orderBy('lastActivity', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      leads.push(doc.data());
    });
    
    return leads;
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
export async function createLead(leadData: Omit<Lead, 'id'>): Promise<string> {
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
    
    // Prepare the lead with Firestore-compatible data
    const firestoreLead = {
      ...leadData,
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
    
    console.log(`Created new lead with ID: ${docRef.id}, numericId: ${timestampId}`);
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
    
    const leadRef = doc(db, LEADS_COLLECTION, id);
    
    // Update the last activity timestamp and provided fields
    const updateData = {
      ...leadData,
      lastActivity: Timestamp.now()
    };
    
    await updateDoc(leadRef, updateData);
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
    const batch = writeBatch(db);
    let hasUpdates = false;
    
    // Prepare batch updates
    for (const update of updates) {
      // Ensure id is a valid string and not NaN or -1
      if (!update.id || update.id === 'NaN' || update.id === 'undefined' || update.id === '-1') {
        console.warn(`Skipping update for invalid lead ID: ${update.id}`);
        continue;
      }
      
      const leadRef = doc(db, LEADS_COLLECTION, update.id);
      batch.update(leadRef, { 
        position: update.position,
        lastActivity: Timestamp.now()
      });
      hasUpdates = true;
    }
    
    // Only commit if we have valid updates
    if (hasUpdates) {
      await batch.commit();
    } else {
      console.log('No valid lead position updates to commit');
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