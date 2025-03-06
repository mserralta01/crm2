# SalesPro CRM Documentation

Welcome to the SalesPro CRM documentation. This guide provides comprehensive information about the application's architecture, components, and development practices.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Layout System](#layout-system)
5. [Components](#components)
6. [Styling Guide](#styling-guide)
7. [Animation System](#animation-system)
8. [Development Guidelines](#development-guidelines)
9. [Change Log](#change-log)

## Project Overview

SalesPro CRM is a modern, intuitive customer relationship management system built with Next.js 14. It features a high-converting marketing website with advanced animations and a responsive design.

### Key Features

- Animated hero section with typewriter effect
- Problem statement section with scroll animations
- Dual layout system for marketing and dashboard
- Dynamic color themes with dark mode support
- Performance-optimized animations
- SEO-friendly structure

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Type Safety**: TypeScript
- **State Management**: React Hooks

## Project Structure

```
├── app/
│   ├── globals.css       # Global styles and Tailwind imports
│   ├── layout.tsx        # Root layout with conditional navigation
│   ├── page.tsx          # Marketing home page
│   ├── auth/            # Authentication pages
│   └── dashboard/       # Dashboard pages and layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── navigation.tsx   # Marketing site navigation
│   └── footer.tsx       # Marketing site footer
├── lib/
│   └── utils.ts         # Utility functions
└── docs/
    └── README.md        # This documentation
```

## Layout System

The application uses a dual-layout system to provide different experiences for marketing and dashboard sections:

### Marketing Layout
- Full navigation menu with links to features, pricing, etc.
- Footer with company information and links
- Shown on all public pages (/, /pricing, /auth/*)
- Optimized for conversion and information presentation

### Dashboard Layout
- Dedicated sidebar navigation
- No top navigation or marketing footer
- Custom header for each section
- Optimized for productivity and data management

The layout switching is handled automatically based on the current route:
```typescript
// app/layout.tsx
const isDashboard = typeof window !== 'undefined' 
  ? window.location.pathname.startsWith('/dashboard')
  : false;

// Only show marketing navigation and footer on non-dashboard pages
{!isDashboard && <Navigation />}
{!isDashboard && <Footer />}
```

## Components

### Marketing Components

The marketing site components focus on conversion and information presentation:

- Hero Section: Animated headline and compelling visuals
- Problem Section: Highlights common CRM pain points
- Comparison Section: Feature comparison with competitors
- Testimonials: Social proof from existing customers

### Dashboard Components

The dashboard interface prioritizes efficiency and data management:

- Sidebar Navigation: Quick access to all sections
- Stats Cards: Key metrics and performance indicators
- Data Tables: Efficient data presentation and management
- Action Buttons: Common tasks and operations

## Styling Guide

### Color System

The application uses a sophisticated color system with CSS variables for theming:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --accent: 262.1 83.3% 57.8%;
  /* ... other color variables */
}
```

### Gradient Effects

Custom gradient utilities for text and backgrounds:

```css
.gradient-bg {
  background: linear-gradient(
    135deg,
    hsl(var(--primary)) 0%,
    hsl(var(--accent)) 100%
  );
}
```

## Animation System

### Framer Motion Integration

The project uses Framer Motion for smooth, performant animations:

- Page transitions
- Scroll-triggered animations
- Hover effects
- Staggered animations

Example configuration:

```typescript
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

## Development Guidelines

### Component Creation

1. Use the "use client" directive for components with client-side features
2. Implement responsive design using Tailwind breakpoints
3. Optimize animations for performance
4. Maintain accessibility standards
5. Follow TypeScript best practices

### Code Style

- Use TypeScript for type safety
- Implement proper component separation
- Follow React hooks best practices
- Maintain consistent naming conventions

## Change Log

### March 2024

#### Added
- Authentication System
  * Multi-step registration flow
  * Password reset functionality
  * Protected routes with middleware
  * Simulated authentication
- Marketing Website
  * Typewriter effect in hero section
  * Gradient text and background effects
  * Floating animation for hero image
  * Problem section with scroll animations
  * Video section with modal
  * Testimonials section
  * Comparison section
  * Comprehensive documentation

#### Modified
- Enhanced color system with new gradients
- Improved animation performance
- Updated responsive design
- Added social media integration
- Enhanced footer with additional links
- Implemented dual-layout system for marketing and dashboard

#### Planned
- Dashboard implementation
- User profile management
- Team collaboration features
- Analytics dashboard
- API integration
- Real authentication system