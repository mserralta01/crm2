"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Form schema for validation
const apiSettingsSchema = z.object({
  sendgridApiKey: z.string().min(1, {
    message: "SendGrid API Key is required.",
  }),
});

type ApiSettingsFormValues = z.infer<typeof apiSettingsSchema>;

const testEmailSchema = z.object({
  testEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type TestEmailFormValues = z.infer<typeof testEmailSchema>;

export default function SettingsPage() {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<ApiSettingsFormValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      sendgridApiKey: "",
    },
  });

  const testEmailForm = useForm<TestEmailFormValues>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      testEmail: "",
    },
  });

  // Fetch existing settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const settingsDoc = await getDoc(doc(db, "settings", user.uid));
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          form.reset({
            sendgridApiKey: data.sendgridApiKey || "",
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user, form, toast]);

  // Form submission handler
  const onSubmit = async (data: ApiSettingsFormValues) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Save settings to Firestore
      await setDoc(doc(db, "settings", user.uid), {
        sendgridApiKey: data.sendgridApiKey,
        updatedAt: new Date(),
      }, { merge: true });
      
      toast({
        title: "Settings Saved",
        description: "Your API settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test email handler
  const onTestEmail = async (data: TestEmailFormValues) => {
    if (!user) return;
    
    try {
      setIsTesting(true);
      setTestResult(null);
      
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail: data.testEmail,
        }),
      });
      
      const result = await response.json();
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Test Email Sent",
          description: "Check your inbox for the test email.",
        });
      } else {
        toast({
          title: "Test Failed",
          description: result.message || "Failed to send test email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error testing email:", error);
      setTestResult({
        success: false,
        message: "Error connecting to the server.",
      });
      toast({
        title: "Error",
        description: "Failed to connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!user) {
    return <div className="p-8">Please log in to access settings.</div>;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="api">API Integration</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>API Integration Settings</CardTitle>
              <CardDescription>
                Configure your API keys for various integrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="sendgridApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SendGrid API Key</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your SendGrid API Key" 
                            type="password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The API key will be used for sending emails via SendGrid.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Test SendGrid Integration</CardTitle>
              <CardDescription>
                Send a test email to verify your SendGrid integration is working.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResult && (
                <Alert className={`mb-6 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
              
              <Form {...testEmailForm}>
                <form onSubmit={testEmailForm.handleSubmit(onTestEmail)} className="space-y-6">
                  <FormField
                    control={testEmailForm.control}
                    name="testEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter email address to receive test" 
                            type="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          We'll send a test email to this address.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" variant="outline" disabled={isTesting}>
                    {isTesting ? "Sending..." : "Send Test Email"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account settings will be implemented in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notification settings will be implemented in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 