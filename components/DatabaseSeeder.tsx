'use client';

import { useEffect, useState } from 'react';
import { seedDatabase, isDatabaseSeeded } from '@/lib/services/seed-service';
import { runDataMigrations } from '@/lib/services/data-migration';

export function DatabaseSeeder() {
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(true); // Assume seeded until checked
  
  useEffect(() => {
    async function checkAndSeedDatabase() {
      if (process.env.NODE_ENV === 'development') {
        try {
          setSeeding(true);
          const isSeeded = await isDatabaseSeeded();
          
          if (!isSeeded) {
            console.log('Database not seeded, seeding now...');
            await seedDatabase();
            console.log('Database seeding completed successfully!');
          } else {
            console.log('Database already seeded, skipping seed process');
          }
          
          // Run data migrations regardless of whether we seeded
          console.log('Running data migrations...');
          await runDataMigrations();
          console.log('Data migrations completed successfully!');
          
          setSeeded(true);
        } catch (error) {
          console.error('Error initializing database:', error);
        } finally {
          setSeeding(false);
        }
      }
    }
    
    checkAndSeedDatabase();
  }, []);
  
  // This component doesn't render anything visible
  return null;
} 