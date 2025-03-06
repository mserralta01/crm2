"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const tiers = [
  {
    name: 'Starter',
    price: {
      monthly: 29,
      annual: 24
    },
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 1,000 contacts',
      'Basic pipeline management',
      'Email tracking',
      'Mobile app access',
      'Basic reporting'
    ]
  },
  {
    name: 'Professional',
    price: {
      monthly: 79,
      annual: 69
    },
    description: 'For growing teams needing more power',
    features: [
      'Up to 10,000 contacts',
      'Advanced pipeline management',
      'Email automation',
      'Team collaboration tools',
      'Advanced analytics',
      'API access',
      'Priority support'
    ]
  },
  {
    name: 'Enterprise',
    price: {
      monthly: 199,
      annual: 169
    },
    description: 'For large teams with complex needs',
    features: [
      'Unlimited contacts',
      'Custom pipeline workflows',
      'Advanced automation',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Phone support',
      'Training sessions'
    ]
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen pt-32 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the perfect plan for your team
          </p>
          
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Button
              variant="outline"
              size="sm"
              className={`relative ${isAnnual ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <span className="relative z-10">
                {isAnnual ? 'Annual' : 'Monthly'}
              </span>
            </Button>
            <span className={`text-sm ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
              <span className="ml-1 text-xs text-primary">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative p-8 rounded-xl border ${
                index === 1 ? 'border-primary shadow-lg' : 'border-border'
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">
                    ${isAnnual ? tier.price.annual : tier.price.monthly}
                  </span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-primary mt-2">
                    Save ${(tier.price.monthly - tier.price.annual) * 12} yearly
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 mr-3 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>

              <Button
                className={`w-full ${
                  index === 1 ? 'gradient-bg hover:opacity-90' : ''
                }`}
                variant={index === 1 ? 'default' : 'outline'}
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Have questions?
          </h2>
          <p className="text-muted-foreground mb-8">
            Our team is here to help you make the right choice
          </p>
          <Button variant="outline">
            Contact Sales
          </Button>
        </div>
      </motion.div>
    </div>
  );
}