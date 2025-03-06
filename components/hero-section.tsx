"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const phrases = [
  "TRANSFORM YOUR LEADS",
  "CLOSE MORE DEALS",
  "BOOST YOUR REVENUE",
  "SIMPLIFY YOUR SALES"
];

export function HeroSection() {
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetPhrase = phrases[currentIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentPhrase.length < targetPhrase.length) {
          setCurrentPhrase(targetPhrase.slice(0, currentPhrase.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentPhrase.length === 0) {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % phrases.length);
        } else {
          setCurrentPhrase(currentPhrase.slice(0, -1));
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentPhrase, currentIndex, isDeleting]);

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg opacity-10" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid" />

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-gradient">{currentPhrase}</span>
              <span className="typewriter-cursor" />
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-8"
            >
              Stop losing deals in complicated systems. Our CRM helps you close more deals with less effort.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center md:justify-start"
            >
              <Button size="lg" className="text-lg gradient-bg hover:opacity-90 transition-opacity" asChild>
                <Link href="/auth/register">Start Your Free Trial</Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg"
            >
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-sm text-muted-foreground">
                <span className="flex items-center space-x-2">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-primary"
                  >
                    ★
                  </motion.span>
                  <span>Trusted by 1,000+ Companies</span>
                </span>
                <span>98% Customer Satisfaction</span>
                <span>30-Day Money-Back Guarantee</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl floating">
              <Image
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="SalesPro CRM Dashboard"
                width={1200}
                height={800}
                className="object-cover"
                priority
              />
              
              {/* Floating elements */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 2,
                }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="gradient-bg p-3 rounded-full">
                    <span className="text-white text-xl font-bold">27%</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Conversion Rate</p>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}