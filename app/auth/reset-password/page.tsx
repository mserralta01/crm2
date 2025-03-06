"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Reset your password</h2>
        <p className="text-muted-foreground">
          {!isSubmitted
            ? "Enter your email and we'll send you instructions to reset your password"
            : "Check your email for reset instructions"}
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-bg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      ) : (
        <div className="text-center">
          <p className="mb-6">
            We've sent you an email with instructions to reset your password.
            Please check your inbox.
          </p>
          <Button asChild variant="outline">
            <Link href="/auth/login">Return to login</Link>
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link
          href="/auth/login"
          className="text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}