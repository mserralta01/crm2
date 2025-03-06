"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsTable } from '@/components/leads/leads-table';
import { LeadsKanban } from '@/components/leads/leads-kanban';
import { AddLeadDialog } from '@/components/leads/add-lead-dialog';
import { Search, Plus, LayoutGrid, List } from 'lucide-react';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Use to trigger refresh of lead data

  // Function to refresh data after a new lead is added
  const handleLeadAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground">Manage and track your sales leads</p>
          </div>
          <AddLeadDialog onLeadAdded={handleLeadAdded}>
            <Button className="gradient-bg">
              <Plus className="w-5 h-5 mr-2" />
              Add Lead
            </Button>
          </AddLeadDialog>
        </div>

        <Card className="mb-8">
          <div className="p-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filters
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="kanban" className="w-full">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="kanban">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="w-4 h-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="kanban">
            <LeadsKanban searchTerm={searchTerm} key={`kanban-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="list">
            <LeadsTable searchTerm={searchTerm} key={`table-${refreshKey}`} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}