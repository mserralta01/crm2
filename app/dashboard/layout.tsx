"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  BarChart2,
  Users,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  Zap,
  Shield
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: BarChart2, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Leads', href: '/dashboard/leads' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      // Redirect is handled by the auth state change in AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: isSidebarOpen ? 0 : -300 }}
          className={`fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r transition-transform`}
        >
          <div className="p-4">
            <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
              <Zap className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">SalesPro</span>
            </Link>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              
              {/* Admin-only menu item */}
              {isAdmin && (
                <Link href="/dashboard/admin">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary"
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Admin Panel
                  </Button>
                </Link>
              )}
            </nav>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </motion.aside>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed bottom-4 right-4 z-50 lg:hidden bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Main content */}
        <div className={`${isSidebarOpen ? 'lg:ml-64' : ''} transition-all`}>
          {children}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}