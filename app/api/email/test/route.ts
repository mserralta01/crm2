import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { sendEmail } from '@/lib/services/email';

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = auth.currentUser;
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const requestData = await request.json();
    const { testEmail } = requestData;
    
    if (!testEmail) {
      return NextResponse.json(
        { success: false, message: "Test email address is required" },
        { status: 400 }
      );
    }

    // Send a test email
    const result = await sendEmail({
      to: testEmail,
      from: 'test@yourdomain.com', // Replace with your verified sender
      subject: 'SendGrid Test Email',
      text: 'This is a test email to verify your SendGrid integration is working correctly.',
      html: '<div><h1>SendGrid Test</h1><p>This is a test email to verify your SendGrid integration is working correctly.</p></div>'
    }, user.uid);

    if (result.success) {
      return NextResponse.json({ success: true, message: "Test email sent successfully" });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in test email API:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send test email" },
      { status: 500 }
    );
  }
} 