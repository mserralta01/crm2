"use client";

import { motion } from 'framer-motion';
import { BarChart2, Users, MessageSquare, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';

const stats = [
  {
    title: "Total Leads",
    value: "1,234",
    change: "+12.3%",
    icon: Users,
    trend: "up"
  },
  {
    title: "Conversion Rate",
    value: "32.5%",
    change: "+4.2%",
    icon: BarChart2,
    trend: "up"
  },
  {
    title: "Active Deals",
    value: "64",
    change: "-2.1%",
    icon: MessageSquare,
    trend: "down"
  },
  {
    title: "Revenue",
    value: "$125.3k",
    change: "+15.2%",
    icon: Settings,
    trend: "up"
  }
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your sales today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tasks</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}