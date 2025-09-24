# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 8080)
npm run dev

# Build for production
npm run build:prod

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Bundle analysis
npm run build:analyze

# Supabase utilities
npm run supabase:monitor  # Monitor usage and quota
npm run supabase:test     # Test connection and tables
npm run supabase:check    # Run both tests
```

## Key Architecture Patterns

### Project Structure
- `/src/pages/` - Page components with lazy loading
- `/src/components/` - Reusable UI components
- `/src/hooks/` - Custom React hooks for business logic
- `/src/contexts/` - React contexts (AuthContext for authentication)
- `/src/integrations/supabase/` - Supabase client and types
- `/src/utils/` - Utility functions

### Authentication Flow
- Authentication is handled through `AuthContext` using Supabase Auth
- Protected routes use `ProtectedRoute` component wrapper
- Admin routes require `requireAdmin={true}` prop

### Data Fetching Pattern
All data operations use React Query hooks that interact with Supabase:
- Custom hooks in `/src/hooks/` encapsulate data fetching logic
- Hooks return query states (data, loading, error) and mutation functions
- Real-time subscriptions are managed within hooks

### Key Custom Hooks
- `useAuth()` - Authentication state and methods
- `useChamados()` - Ticket/issue management
- `useCustomEvents()` - Custom calendar events
- `useKnowledgeBase()` - Knowledge base entries
- `useProfile()` - User profile management

### Component Patterns
- All UI components use shadcn/ui design system
- Form components use React Hook Form with Zod schemas
- Dialogs and modals follow Radix UI patterns
- Components are client-side only (no SSR)

### Environment Variables
Required environment variables (create `.env` from `.env.example`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### TypeScript Configuration
- Path alias `@/` maps to `./src/`
- Relaxed type checking (noImplicitAny: false, strictNullChecks: false)

### Deployment
The app is deployed to GitHub Pages. Production builds use `/napje-painel-atalhos/` as base path when built with GitHub Actions.

### Lovable Integration
This project was created with Lovable (https://lovable.dev). Changes can be made through Lovable's interface or locally via traditional development.