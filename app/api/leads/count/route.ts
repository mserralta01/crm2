import { NextRequest, NextResponse } from 'next/server';
import { collection, query, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET /api/leads/count - Get count of leads
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const q = query(collection(db, 'leads'));
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;
    
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Error counting leads:', error);
    return NextResponse.json(
      { error: 'Failed to count leads', message: error.message },
      { status: 500 }
    );
  }
} 