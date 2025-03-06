# Firebase Integration

## Overview

This document outlines the Firebase integration in our CRM application. Firebase provides a suite of cloud-based services that have been incorporated to enhance functionality, security, and user experience.

> **Implementation Details**: For specific details about how Firebase has been implemented in the application, please refer to [IMPLEMENTATION.md](./IMPLEMENTATION.md).

## Firebase Services Used

The application uses the following Firebase services:

1. **Firebase Authentication**: For user authentication and management
2. **Firestore Database**: For storing and querying application data
3. **Firebase Storage**: For storing user-generated files and documents
4. **Firebase Analytics**: For tracking application usage and user behavior

## Configuration

Firebase is initialized in `lib/firebase.ts` with the following configuration:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyA84mJDOKyZI3UTvbitAlyh00Feuj1vn6U",
  authDomain: "crm2-599eb.firebaseapp.com",
  projectId: "crm2-599eb",
  storageBucket: "crm2-599eb.firebasestorage.app",
  messagingSenderId: "731447884898",
  appId: "1:731447884898:web:3be3694ddca6bc51a9e53b",
  measurementId: "G-PEXDYDNSG3"
};
```

These values are also stored as environment variables in `.env.local` using the following format:


## Firebase Services Initialization

The Firebase services are initialized in `lib/firebase.ts` as follows:

```typescript
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics - only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics };
```

## Usage in Components

Firebase services can be imported into any component using:

```typescript
import { auth, db, storage, analytics } from 'lib/firebase';
```

### Authentication Examples

```typescript
// Sign in with email and password
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'lib/firebase';

async function signInUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign out
import { signOut } from 'firebase/auth';
import { auth } from 'lib/firebase';

async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
```

### Firestore Examples

```typescript
// Add a new document to a collection
import { collection, addDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

async function addLead(leadData) {
  try {
    const docRef = await addDoc(collection(db, 'leads'), leadData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
}

// Get a document by ID
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

async function getLead(leadId) {
  try {
    const docRef = doc(db, 'leads', leadId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting lead:', error);
    throw error;
  }
}

// Query a collection
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from 'lib/firebase';

async function getLeadsByStatus(status) {
  try {
    const q = query(collection(db, 'leads'), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    
    const leads = [];
    querySnapshot.forEach((doc) => {
      leads.push({ id: doc.id, ...doc.data() });
    });
    
    return leads;
  } catch (error) {
    console.error('Error querying leads:', error);
    throw error;
  }
}
```

### Storage Examples

```typescript
// Upload a file
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from 'lib/firebase';

async function uploadFile(file, path) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
```

### Analytics Examples

```typescript
// Log a custom event
import { logEvent } from 'firebase/analytics';
import { analytics } from 'lib/firebase';

function logCustomEvent(eventName, eventParams) {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
}
```

## Data Models

### User Model

Users are stored in Firebase Authentication and may have additional data in Firestore:

```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  // Additional user data stored in Firestore
  role?: 'admin' | 'manager' | 'agent';
  department?: string;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
}
```

### Lead Model

Leads are stored in Firestore with the following structure:

```typescript
interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value?: number;
  source?: string;
  assignedTo?: string; // UID of the user assigned to the lead
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Activity Model

Activities related to leads are stored in Firestore:

```typescript
interface Activity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'document';
  title: string;
  description?: string;
  date: Timestamp;
  createdBy: string; // UID of the user who created the activity
  attachments?: string[]; // Array of Storage URLs
  metadata?: Record<string, any>; // Additional type-specific data
}
```

## Security Rules

The application uses Firebase Security Rules to protect data and enforce access control.

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles can only be read and written by the user themselves or admins
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Leads can be read by any authenticated user, but only written by their assignee or admins/managers
    match /leads/{leadId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.assignedTo == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']);
    }
    
    // Activities can be read by any authenticated user, but only written by the creator or admins/managers
    match /activities/{activityId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']);
    }
  }
}
```

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /leads/{leadId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Further Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase JS SDK Reference](https://firebase.google.com/docs/reference/js)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase with Next.js](https://firebase.google.com/docs/web/setup-nextjs) 