import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface SendEmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

// Function to retrieve the SendGrid API key from Firebase
export async function getSendGridApiKey(userId: string): Promise<string | null> {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", userId));
    if (settingsDoc.exists()) {
      return settingsDoc.data().sendgridApiKey || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching SendGrid API key:", error);
    return null;
  }
}

// Function to send an email using SendGrid
export async function sendEmail(params: SendEmailParams, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = await getSendGridApiKey(userId);
    
    if (!apiKey) {
      return { 
        success: false, 
        message: "SendGrid API key not found. Please configure it in settings." 
      };
    }

    // API call to SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: params.to }]
        }],
        from: { email: params.from },
        subject: params.subject,
        content: [
          {
            type: 'text/plain',
            value: params.text || ''
          },
          ...(params.html ? [{ 
            type: 'text/html',
            value: params.html 
          }] : [])
        ]
      })
    });

    if (response.ok) {
      return { success: true, message: "Email sent successfully" };
    } else {
      const error = await response.json();
      return { 
        success: false, 
        message: `Failed to send email: ${error.message || 'Unknown error'}` 
      };
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return { 
      success: false, 
      message: `Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
} 