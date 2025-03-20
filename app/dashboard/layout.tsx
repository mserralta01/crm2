"use client";

import { Footer } from '@/components/footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardClient>
        {children}
      </DashboardClient>
      <Footer />
    </ProtectedRoute>
  );
}