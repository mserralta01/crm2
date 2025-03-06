# CRM2 - Modern Customer Relationship Management System

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/mserralta01/crm2)

## Overview

CRM2 is a modern, feature-rich Customer Relationship Management system built with Next.js and Firebase. It provides comprehensive tools for lead management, customer engagement, and sales pipeline tracking.

## Documentation

For detailed documentation about the application architecture, components, and features, please refer to the [docs directory](./docs/README.md).

## Firebase Setup

This project uses Firebase for various backend services. To set up Firebase:

1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup process

2. **Get your Firebase configuration:**
   - In the Firebase console, go to Project Settings
   - Scroll down to "Your apps" section and click the web app icon (</>) to register a web app
   - Copy the configuration object

3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Replace the placeholder values with your actual Firebase configuration

4. **Enable required Firebase services:**
   - Authentication: Set up the sign-in methods you want to use
   - Firestore Database: Create a database in production or test mode
   - Storage: Set up Firebase Storage if you need file uploads
   - Analytics: Enable Firebase Analytics for usage tracking

## Available Firebase Services

The following Firebase services are configured in this project:

- **Authentication** (`firebase/auth`): For user authentication
- **Firestore** (`firebase/firestore`): For database functionality
- **Storage** (`firebase/storage`): For file storage
- **Analytics** (`firebase/analytics`): For usage tracking and user behavior analysis

Import these services from `lib/firebase.ts` in your components:

```typescript
import { auth, db, storage, analytics } from 'lib/firebase';
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Firebase as described above
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Features

- **User Authentication**: Secure login/signup with Firebase Authentication
- **Lead Management**: Comprehensive tools for tracking and managing leads
- **Activity Tracking**: Log calls, meetings, emails, and notes
- **Document Management**: Store and manage documents with Firebase Storage
- **Analytics**: Track user behavior and application usage

## Technologies Used

- **Next.js**: React framework for building the application
- **Firebase**: Backend services (Auth, Firestore, Storage, Analytics)
- **TypeScript**: For type safety and better development experience
- **Tailwind CSS**: For styling with utility-first approach
- **shadcn/ui**: Component library based on Radix UI
- **React Hook Form**: For form handling with validation