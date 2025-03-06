import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Upload file to Firebase Storage
export async function uploadFile(file: File, path: string): Promise<string> {
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

// Upload document for a lead
export async function uploadLeadDocument(leadId: string, file: File): Promise<string> {
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const path = `leads/${leadId}/documents/${fileName}`;
  
  return uploadFile(file, path);
}

// Delete file from Firebase Storage
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Get signed URL for a file (to allow temporary access)
export async function getFileUrlWithToken(filePath: string): Promise<string> {
  try {
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
} 