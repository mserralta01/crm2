"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    router.push('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create your account</h2>
        <p className="text-muted-foreground">
          {step === 1 && "Let's start with your company details"}
          {step === 2 && "Set up your admin account"}
          {step === 3 && "Choose your subscription plan"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Your Company Inc."
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="address">Company Address</Label>
              <Input
                id="address"
                placeholder="123 Business St."
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="New York"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  placeholder="10001"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <RadioGroup defaultValue="free">
              <div className="flex items-center space-x-2 border p-4 rounded-lg">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free" className="flex-1">
                  <div className="font-semibold">Free Plan</div>
                  <div className="text-sm text-muted-foreground">
                    Perfect for small teams getting started
                  </div>
                </Label>
                <div className="text-lg font-semibold">$0</div>
              </div>

              <div className="flex items-center space-x-2 border border-primary p-4 rounded-lg bg-primary/5">
                <RadioGroupItem value="premium" id="premium" />
                <Label htmlFor="premium" className="flex-1">
                  <div className="font-semibold">Premium Plan</div>
                  <div className="text-sm text-muted-foreground">
                    For growing teams needing more power
                  </div>
                </Label>
                <div className="text-lg font-semibold">$79</div>
              </div>
            </RadioGroup>
          </motion.div>
        )}

        <div className="flex space-x-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
            >
              Previous
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1 gradient-bg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : step < 3 ? (
              'Continue'
            ) : (
              'Create Account'
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}