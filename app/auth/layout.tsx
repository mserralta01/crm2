"use client";

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/90 to-accent/90 text-white relative overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[gradient_3s_linear_infinite]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_100%,rgba(255,255,255,0.1),transparent)]" />
          </div>

          <div className="relative">
            <Link href="/" className="flex items-center space-x-2 mb-12">
              <Zap className="w-10 h-10" />
              <span className="text-3xl font-bold">SalesPro</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-4xl font-bold leading-tight">
                Transform Your Sales Process with Intelligent Automation
              </h1>
              <p className="text-xl opacity-90 leading-relaxed">
                Join thousands of sales teams who have revolutionized their workflow with SalesPro's intuitive CRM platform.
              </p>
            </motion.div>
          </div>

          <div className="relative space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">98%</div>
                <div className="text-sm opacity-80">Customer Satisfaction</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">2.5x</div>
                <div className="text-sm opacity-80">Revenue Growth</div>
              </div>
            </div>
            <div className="text-sm opacity-70">
              © {new Date().getFullYear()} SalesPro. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[440px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}