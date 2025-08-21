# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server on port 8080
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run build:prod` - Production build with production config
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - TypeScript type checking without compilation
- `npm run preview` - Preview production build locally
- `npm run clean` - Clean dist directory

### Deployment Commands
- `npm run deploy` - Deploy to staging (uses deploy.sh script)
- `npm run deploy:production` - Deploy to production (uses deploy-production.sh script)
- `npm run pre-deploy` - Complete build pipeline (clean + lint + type-check + production build)
- `npm run deploy:check` - Quick deploy check (type-check + build)

### Supabase & Database Commands
- `npm run supabase:monitor` - Monitor Supabase usage and quota
- `npm run supabase:test` - Test Supabase connection and tables
- `npm run supabase:check` - Run both monitoring and testing
- `npm run import:feriados` - Import holidays data to database

## Application Architecture

### Tech Stack
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth + Database + Edge Functions)
- **State Management**: TanStack Query for server state, React Context for auth
- **Routing**: React Router v6 with lazy loading

### Directory Structure

#### Core Application
- `src/pages/` - Page components (lazy loaded)
- `src/components/` - Reusable UI components organized by domain
- `src/hooks/` - Custom React hooks for business logic
- `src/contexts/` - React contexts (primarily AuthContext)
- `src/integrations/supabase/` - Supabase client and type definitions
- `src/utils/` - Utility functions and helpers
- `src/types/` - TypeScript type definitions

#### Component Organization
- `src/components/ui/` - shadcn/ui components (design system)
- `src/components/admin/` - Admin-specific components
- `src/components/dashboard/` - Dashboard-specific components  
- `src/components/knowledge-base/` - Knowledge base functionality
- `src/components/notifications/` - Notification system components

### Key Architectural Patterns

#### Authentication & Authorization
- Uses Supabase Auth with session-based authentication
- `AuthContext` provides auth state throughout the app
- `ProtectedRoute` component handles route protection
- Admin routes require `requireAdmin={true}` prop
- Session state managed with automatic refresh

#### Database Integration
- All database interactions through Supabase client
- Type-safe database operations with generated TypeScript types
- Row Level Security (RLS) policies enforce data access rules
- Edge functions for AI/ML features and complex operations

#### State Management Pattern
- Server state: TanStack Query for caching, synchronization, and mutations
- Local state: useState for component state
- Global state: React Context only for authentication
- Form state: react-hook-form with zod validation

#### Route Structure
- `/` - Dashboard (default protected route)
- `/auth` - Authentication page (public)
- `/admin/*` - Admin routes (require admin role)
- All routes except `/auth` are protected and require authentication

#### Component Patterns
- Lazy loading for all page components to improve initial bundle size
- Compound components for complex UI (dialogs, forms)
- Custom hooks encapsulate business logic and API calls
- Error boundaries for graceful error handling

#### Build Configuration
- Vite with manual chunk splitting for optimal loading
- Separate chunks for: vendor, router, UI components, query, Supabase, DnD
- Production builds use different base path for GitHub Pages deployment
- Bundle analysis available via `npm run analyze`

## Database Schema Overview

The application uses Supabase with several core tables:
- User management and profiles
- Chamados (tickets/cases) system
- Knowledge base with file attachments
- Calendar events and holidays (feriados)
- Post-it notes and important memories
- Weekly notification settings
- Custom events and work calendar

## Development Guidelines

### Code Style
- ESLint configured with TypeScript and React rules
- Relaxed rules for production (`@typescript-eslint/no-explicit-any` as warning)
- React hooks dependency warnings instead of errors
- Unused variables check disabled for development flexibility

### Component Development  
- Use shadcn/ui components as base building blocks
- Follow compound component pattern for complex dialogs
- Custom hooks for API interactions and business logic
- TypeScript strict mode enabled

### AI Integration
- Edge functions in `supabase/functions/` handle AI operations
- Semantic search, text enhancement, and chat assistance
- PDF processing and knowledge extraction capabilities