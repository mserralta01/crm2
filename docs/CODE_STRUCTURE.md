# Code Structure

This document outlines the structure of the codebase after the Firebase real data implementation.

## Directory Structure

```
/
├── app/                     # Next.js App Router
│   ├── api/                 # API endpoints
│   │   ├── leads/           # Lead-related API endpoints
│   │   │   ├── [id]/        # Single lead operations
│   │   │   │   ├── activities/ # Lead activity operations
│   │   │   │   └── route.ts  # GET, PATCH, DELETE single lead
│   │   │   ├── count/       # Endpoint for counting leads
│   │   │   └── route.ts     # GET, POST leads
│   │   └── uploads/         # File upload API endpoint
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Dashboard pages
│   │   ├── leads/           # Lead management 
│   │   └── page.tsx         # Main dashboard
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # UI components from shadcn/ui
│   ├── leads/               # Lead-specific components
│   │   ├── leads-table.tsx  # Table view of leads
│   │   ├── leads-kanban.tsx # Kanban board of leads
│   │   └── kanban-*.tsx     # Supporting kanban components
│   ├── DatabaseSeeder.tsx   # Database seeding component
│   └── ...                  # Other components
├── lib/                     # Utility functions and services
│   ├── services/            # Service layer
│   │   ├── leads-service.ts # Lead operations with Firestore
│   │   ├── storage-service.ts # File operations with Firebase Storage
│   │   └── seed-service.ts  # Database seeding utilities
│   ├── firebase.ts          # Firebase configuration and initialization
│   └── utils.ts             # Utility functions
├── data/                    # Data models and mock data
│   └── leads.ts             # Lead data model and mock data
├── docs/                    # Documentation
│   ├── IMPLEMENTATION.md    # Firebase implementation details
│   ├── FIREBASE.md          # Firebase integration overview
│   ├── ARCHITECTURE.md      # Application architecture
│   ├── LEAD_MANAGEMENT.md   # Lead management feature
│   └── ...                  # Other documentation files
├── public/                  # Static assets
└── ...                      # Other configuration files
```

## Key Files

### Service Layer

- **`lib/services/leads-service.ts`**: Core functionality for interacting with Firestore for lead data
- **`lib/services/storage-service.ts`**: File upload and retrieval operations with Firebase Storage
- **`lib/services/seed-service.ts`**: Database seeding utilities

### API Endpoints

- **`app/api/leads/route.ts`**: API routes for retrieving all leads and creating new leads
- **`app/api/leads/[id]/route.ts`**: API routes for individual lead operations
- **`app/api/leads/[id]/activities/route.ts`**: API route for adding activities to leads
- **`app/api/leads/count/route.ts`**: API route for counting leads
- **`app/api/uploads/route.ts`**: API route for file uploads

### UI Components

- **`app/dashboard/page.tsx`**: Main dashboard with real-time statistics
- **`components/leads/leads-table.tsx`**: Table view of leads with real data
- **`components/leads/leads-kanban.tsx`**: Kanban board with real data and status updates
- **`components/DatabaseSeeder.tsx`**: Client-side component that seeds the database if needed

### Utilities

- **`lib/utils.ts`**: Utility functions for date formatting, currency formatting, etc.

## Data Flow

1. **UI Components** fetch data using service functions or API endpoints
2. **Service Functions** interact with Firebase directly
3. **API Endpoints** use service functions to perform operations
4. **Database Seeder** initializes the database with sample data

## Authentication

Authentication has not been implemented yet but will be added in a future update.

## Conclusion

This code structure follows a clean, modular architecture that separates concerns and makes the codebase maintainable and extensible. The service layer abstraction ensures that Firebase interactions are centralized and can be easily modified if needed. 