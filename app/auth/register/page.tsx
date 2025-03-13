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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export default function RegisterPage() {
  const router = useRouter();
  const { register, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'free'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePlanChange = (value: string) => {
    setFormData(prev => ({ ...prev, plan: value }));
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    
    try {
      await signInWithGoogle();
      toast.success('Account created successfully with Google!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);
    
    try {
      // Register the user with Firebase
      await register(formData.email, formData.password, formData.name);
      
      // TODO: Store additional company information in Firestore
      // This would be implemented in a separate function in the AuthContext
      
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create your account</h2>
        <p className="text-muted-foreground mb-6">
          Get started with your free trial today
        </p>

        {/* Google Sign-in Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4"
          size="lg"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Sign up with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or sign up with email
            </span>
          </div>
        </div>
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
                value={formData.company}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="address">Company Address</Label>
              <Input
                id="address"
                placeholder="123 Business St."
                value={formData.address}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="New York"
                value={formData.city}
                onChange={handleChange}
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
                  value={formData.state}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  placeholder="10001"
                  value={formData.zip}
                  onChange={handleChange}
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
                value={formData.name}
                onChange={handleChange}
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
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
            <RadioGroup 
              defaultValue="free" 
              value={formData.plan}
              onValueChange={handlePlanChange}
            >
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