"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Users, MessageSquare, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getLeads } from '@/lib/services/leads-service';
import { Lead } from '@/data/leads';
import { formatCurrency, getRelativeTimeString } from '@/lib/utils';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        const data = await getLeads();
        setLeads(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);
  
  // Calculate dashboard statistics
  const totalLeads = leads.length;
  
  const qualifiedLeads = leads.filter(lead => lead.status === 'Qualified').length;
  const conversionRate = totalLeads > 0 
    ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) + '%'
    : '0%';
  
  const activeDeals = leads.filter(lead => 
    ['Contacted', 'Qualified', 'Negotiating'].includes(lead.status)
  ).length;
  
  // Calculate total revenue from lead values
  const totalRevenue = leads.reduce((sum, lead) => {
    // Extract numeric value from string like "$5,000"
    const numericValue = lead.value.replace(/[^0-9]/g, '');
    return sum + (numericValue ? parseInt(numericValue) : 0);
  }, 0);
  
  // Format revenue as "$125.3k" or similar
  const formattedRevenue = totalRevenue >= 1000 
    ? `$${(totalRevenue / 1000).toFixed(1)}k`
    : formatCurrency(totalRevenue);

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads.toString(),
      change: totalLeads > 0 ? "+12.3%" : "0%", // Would need historical data for real change
      icon: Users,
      trend: "up"
    },
    {
      title: "Conversion Rate",
      value: conversionRate,
      change: qualifiedLeads > 0 ? "+4.2%" : "0%", // Would need historical data for real change
      icon: BarChart2,
      trend: "up"
    },
    {
      title: "Active Deals",
      value: activeDeals.toString(),
      change: activeDeals > 0 ? (activeDeals > totalLeads / 2 ? "+2.1%" : "-2.1%") : "0%", // Would need historical data for real change
      icon: MessageSquare,
      trend: activeDeals > totalLeads / 2 ? "up" : "down"
    },
    {
      title: "Revenue",
      value: formattedRevenue,
      change: totalRevenue > 0 ? "+15.2%" : "0%", // Would need historical data for real change
      icon: DollarSign,
      trend: "up"
    }
  ];

  if (loading) {
    return <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <p className="text-xl">Loading dashboard data...</p>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <p className="text-xl text-red-500">{error}</p>
    </div>;
  }

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
            {leads.length === 0 ? (
              <p className="text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {leads
                  .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                  .slice(0, 5)
                  .map(lead => (
                    <div key={lead.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-sm font-medium">{lead.name} ({lead.company})</p>
                        <p className="text-xs text-muted-foreground">
                          Last activity: {getRelativeTimeString(lead.lastActivity)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
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