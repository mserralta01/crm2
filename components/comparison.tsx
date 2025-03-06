"use client";

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const features = [
  {
    name: "Intuitive Interface",
    salespro: true,
    others: false,
    description: "Clean, modern interface that requires minimal training"
  },
  {
    name: "Smart Automation",
    salespro: true,
    others: true,
    description: "Automated workflows and task management"
  },
  {
    name: "Quick Setup",
    salespro: true,
    others: false,
    description: "Up and running in minutes, not weeks"
  },
  {
    name: "AI-Powered Insights",
    salespro: true,
    others: true,
    description: "Advanced analytics and predictions"
  },
  {
    name: "Unlimited Customization",
    salespro: true,
    others: false,
    description: "Tailor the system to your exact needs"
  }
];

export function Comparison() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose SalesPro?
          </h2>
          <p className="text-lg text-muted-foreground">
            See how we compare to traditional CRM solutions
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-3 p-4 border-b">
              <div className="col-span-1 font-semibold">Feature</div>
              <div className="col-span-1 font-semibold text-center text-primary">SalesPro</div>
              <div className="col-span-1 font-semibold text-center text-muted-foreground">Others</div>
            </div>
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="grid grid-cols-3 p-4 border-b last:border-0 hover:bg-muted/50"
              >
                <div className="col-span-1">
                  <p className="font-medium">{feature.name}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  {feature.others ? (
                    <Check className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}