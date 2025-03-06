import { NextRequest, NextResponse } from 'next/server';
import { addActivityToLead } from '@/lib/services/leads-service';

// POST /api/leads/[id]/activities - Add an activity to a lead
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const data = await request.json();
    
    // Validate the activity type
    const validTypes = ['calls', 'notes', 'emails', 'meetings', 'documents'];
    if (!data.type || !validTypes.includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid activity type. Must be one of: ' + validTypes.join(', ') },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json(
        { error: 'Activity title is required' },
        { status: 400 }
      );
    }
    
    await addActivityToLead(params.id, data.type, {
      title: data.title,
      description: data.description || '',
      status: data.status,
      duration: data.duration,
      attachments: data.attachments || []
    });
    
    return NextResponse.json({ message: 'Activity added successfully' });
  } catch (error: any) {
    console.error('Error adding activity:', error);
    return NextResponse.json(
      { error: 'Failed to add activity', message: error.message },
      { status: 500 }
    );
  }
} 