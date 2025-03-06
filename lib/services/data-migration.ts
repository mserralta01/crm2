import { migrateLeadsToNumericId } from './leads-service';

/**
 * Run all necessary data migrations
 * This can be called during app initialization to ensure data is in the correct format
 */
export async function runDataMigrations(): Promise<void> {
  try {
    console.log('Starting data migrations...');
    
    // Migrate leads to have numericId field
    await migrateLeadsToNumericId();
    
    console.log('All data migrations completed successfully.');
  } catch (error) {
    console.error('Error running data migrations:', error);
    throw error;
  }
} 