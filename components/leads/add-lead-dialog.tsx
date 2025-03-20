"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createLead, getLeadsByStatus } from '@/lib/services/leads-service';
import { toast } from '@/hooks/use-toast';
import { Lead } from '@/data/leads';
import { formatPhoneNumber, isValidPhoneNumber } from '@/app/utils/formatters';

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .min(1, "Phone number is required")
    .refine(val => isValidPhoneNumber(val), {
      message: "Invalid phone number format. Must be a valid US number."
    }),
  status: z.string().min(1, "Status is required"),
  value: z.string().min(1, "Value is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddLeadDialogProps {
  open: boolean;
  onClose: () => void;
  onLeadAdded: (newLead: Lead) => void;
}

export function AddLeadDialog({ open, onClose, onLeadAdded }: AddLeadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      status: "New",
      value: "$0",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      // Format the value as a currency string if it's not already
      if (!values.value.startsWith('$')) {
        values.value = `$${values.value}`;
      }

      // Format the phone number
      const formattedPhone = formatPhoneNumber(values.phone);

      // Create the lead in the database with the current timestamp
      const now = new Date().toISOString();
      
      // Create a temporary numeric ID for the lead
      const tempNumericId = Date.now();
      
      // We don't need to manually calculate position anymore as createLead handles this
      await createLead({
        ...values,
        phone: formattedPhone,
        position: 0, // Will be calculated in createLead function
        createdAt: now,
        lastActivity: now,
        activities: {
          calls: [],
          notes: [],
          emails: [],
          meetings: [],
          documents: [],
        }
      });

      // Show success message
      toast({
        title: "Success",
        description: `Lead for ${values.firstName} ${values.lastName} from ${values.company} has been created.`,
      });

      // Reset form and close dialog
      form.reset();
      onClose();
      
      // Notify parent component
      const newLead: Lead = {
        id: "",
        numericId: tempNumericId,
        firstName: values.firstName,
        lastName: values.lastName,
        company: values.company,
        email: values.email,
        phone: formattedPhone,
        status: values.status,
        value: values.value,
        position: 0,
        createdAt: now,
        lastActivity: now,
        activities: {
          calls: [],
          notes: [],
          emails: [],
          meetings: [],
          documents: [],
        }
      };
      
      onLeadAdded(newLead);
    } catch (error) {
      console.error('Error creating lead:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create lead. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Enter the details for the new lead. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        {...field}
                        onBlur={(e) => {
                          if (isValidPhoneNumber(e.target.value)) {
                            field.onChange(formatPhoneNumber(e.target.value));
                          }
                          field.onBlur();
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Format: +1 (###) ###-####
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Negotiating">Negotiating</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input placeholder="$5,000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Estimated deal value
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 