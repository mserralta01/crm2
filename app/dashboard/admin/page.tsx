"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, UserPlus } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your CRM system and users</p>
          </div>
          <Button className="gradient-bg">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Admin
          </Button>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="mr-2 h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="p-4">
                    <p>User management content will go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                  Configure access control and user permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="p-4">
                    <p>Permissions content will go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure global system settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="p-4">
                    <p>System settings content will go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
} 