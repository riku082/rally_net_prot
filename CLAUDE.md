# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rally Net** - A comprehensive badminton analysis platform built with Next.js 15, React 19, Firebase, and TypeScript. The application provides match analysis, player management, MBTI diagnostics, and practice management features for the badminton community.

## Key Commands

```bash
# Development
npm run dev        # Start development server with Turbopack at http://localhost:3000

# Production
npm run build      # Build for production
npm run start      # Start production server

# Code Quality
npm run lint       # Run ESLint checks
```

## Architecture

### Core Stack
- **Framework**: Next.js 15.2.5 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Firebase (Firestore + Auth + Storage)
- **Charts**: Chart.js with react-chartjs-2

### Directory Structure

- `/src/app/` - Next.js App Router pages and API routes
  - Page routes follow file-based routing (e.g., `/matches/page.tsx` ’ `/matches`)
  - API routes in `/api/` subdirectories
  
- `/src/components/` - React components organized by feature
  - Complex components like `MatchManagement.tsx`, `PracticeCardForm.tsx`
  - UI components like `Sidebar.tsx`, `MobileNav.tsx`
  
- `/src/context/` - React Context providers
  - `AuthContext.tsx` - Firebase authentication and user profile management
  - `BadmintonContext.tsx` - Global badminton-related state
  
- `/src/types/` - TypeScript type definitions
  - Domain models: `match.ts`, `player.ts`, `practice.ts`, `mbti.ts`
  
- `/src/utils/` - Utility functions and configurations
  - `firebase.ts` - Firebase initialization (WARNING: contains hardcoded credentials)
  - `db.ts` - Firestore database operations
  - `auth.ts` - Authentication utilities

### Firebase Integration

The app uses Firebase services extensively:
- **Authentication**: Email/password and social logins
- **Firestore**: NoSQL database for all application data
- **Storage**: File uploads for images and documents
- **Security Rules**: Multiple `.rules` files for different environments

### Key Features

1. **Match Management** (`/matches`)
   - Create and track badminton matches
   - Analyze match statistics and player performance

2. **Practice Management** (`/practice`, `/practice-cards`)
   - Schedule practices
   - Create practice cards with visual court diagrams
   - Track practice attendance and progress

3. **Player Profiles** (`/players`, `/profile`)
   - Manage player information
   - Track skill levels and achievements
   - MBTI personality analysis for players

4. **MBTI Diagnostics** (`/mbti`)
   - Badminton-specific MBTI questionnaire
   - Personality-based training recommendations

5. **News & Articles** (`/news`, `/articles`)
   - Badminton news aggregation
   - Community articles and guides

### API Routes

- `/api/practice-cards/` - CRUD operations for practice cards
- `/api/mbti/` - MBTI diagnostic and sync endpoints
- `/api/news/` - News aggregation
- `/api/feedback/` - User feedback collection

### State Management

- **Authentication State**: Managed via `AuthContext` with Firebase Auth
- **Application State**: `BadmintonContext` for global badminton-related data
- **Component State**: React hooks (useState, useEffect) for local state

### Important Considerations

1. **Firebase Credentials**: Currently hardcoded in `src/utils/firebase.ts`. Should be moved to environment variables.

2. **TypeScript**: Strict typing throughout the codebase. Always define proper types for new features.

3. **Tailwind CSS**: Uses Tailwind v4 with PostCSS. Follow existing utility class patterns.

4. **Japanese Language**: The app is primarily in Japanese. Maintain consistent Japanese UI text and comments.

5. **Mobile Responsiveness**: Components use responsive design with `MobileNav` for mobile layouts.