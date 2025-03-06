import { leads } from '@/data/leads';
import { seedLeads } from './leads-service';

/**
 * Seeds the database with initial data for development purposes
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');
    
    // Seed leads
    await seedLeads(leads);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

/**
 * Checks if the database has already been seeded
 * This is a simplified version - in real apps, you might want to check for specific collections/documents
 */
export async function isDatabaseSeeded(): Promise<boolean> {
  try {
    // For now, we'll just check if any leads exist
    // In a real app, you might have a separate "metadata" collection to track this
    const existingLeads = await fetch('/api/leads/count').then(res => res.json());
    return existingLeads.count > 0;
  } catch (error) {
    console.error('Error checking if database is seeded:', error);
    return false;
  }
} 