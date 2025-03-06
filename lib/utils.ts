import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { seedDatabase, isDatabaseSeeded } from './services/seed-service';

// Utility function for class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Initialize the database with seed data if necessary
export async function initDatabase() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const seeded = await isDatabaseSeeded();
      
      if (!seeded) {
        console.log('Database not seeded, seeding now...');
        await seedDatabase();
      } else {
        console.log('Database already seeded, skipping seed process');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }
}

// Format currency value
export function formatCurrency(value: number | string): string {
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.]/g, '')) 
    : value;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue);
}

// Format date to a readable string
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time to a readable string
export function formatTime(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  return new Date(dateString).toLocaleTimeString('en-US', options);
}

// Generate a relative time string (e.g., "2 days ago")
export function getRelativeTimeString(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) {
    return 'just now';
  } else if (diffInMins < 60) {
    return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(dateString);
  }
}
