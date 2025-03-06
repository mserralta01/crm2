import { NextRequest, NextResponse } from 'next/server';
import { getLeads, createLead } from '@/lib/services/leads-service';

// GET /api/leads - Get all leads
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const leads = await getLeads();
    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    
    // Simple validation
    if (!data.name || !data.company || !data.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const leadId = await createLead(data);
    
    return NextResponse.json(
      { message: 'Lead created successfully', id: leadId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead', message: error.message },
      { status: 500 }
    );
  }
} 