# College Journal Platform

## Overview

A modern digital college newspaper platform built with React, Express, and PostgreSQL. The application provides a complete content management system for student journalists, featuring article publishing, editorial workflows, comment systems, and team discussions. The platform emphasizes clean typography, professional design inspired by Medium and The Verge, and an intuitive user experience suitable for both student writers and readers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18+ with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Build Tool**: Vite with TypeScript support

**Component Structure:**
- **Public-facing components**: Header, Footer, Article cards, Comment sections
- **Admin components**: Sidebar navigation, Article editor, Dashboard widgets, Discussion panel
- **UI primitives**: Comprehensive Shadcn/ui component library (buttons, forms, dialogs, etc.)

**Design System:**
- **Typography**: Playfair Display (serif) for headlines, Inter (sans-serif) for body/UI
- **Color scheme**: Neutral base with theme support (light/dark modes)
- **Spacing**: Consistent Tailwind spacing units (4, 6, 8, 12, 16, 20, 24)
- **Layout patterns**: Responsive grid system, max-width containers (max-w-7xl, max-w-3xl)

**Authentication Flow:**
- Context-based auth provider with session management
- Protected routes for dashboard and admin features
- Role-based UI rendering (admin vs. redacteur)

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js
- **Database ORM**: Drizzle ORM
- **Session Management**: express-session with MemoryStore (development)
- **Password Security**: bcrypt for hashing
- **Build Process**: esbuild for server bundling

**API Design:**
- RESTful endpoints under `/api/*`
- Session-based authentication (cookie-based)
- Role-based authorization middleware (requireAuth, requireAdmin)
- JSON request/response format

**Data Models:**
- **Users**: username, password (hashed), displayName, role (admin/redacteur), bio, avatarUrl
- **Articles**: title, slug, excerpt, content, coverImageUrl, status (draft/pending/published/rejected), categoryId, authorId, publishedAt
- **Categories**: name, slug, description, color
- **Tags**: name, slug (many-to-many with articles)
- **Comments**: content, articleId, authorId, parentId (threaded), createdAt
- **Channels**: name, description (team discussions)
- **Messages**: content, channelId, authorId, createdAt

**Editorial Workflow:**
- Article lifecycle: draft → pending → published/rejected
- Status-based filtering and permissions
- Automatic read time calculation based on content word count
- Slug generation for SEO-friendly URLs

### Data Storage

**Database Solution:**
- **PostgreSQL** via Neon serverless (connection pooling)
- **Schema Management**: Drizzle Kit for migrations
- **Schema Location**: `shared/schema.ts` for type-safe sharing between client/server

**Database Patterns:**
- Relational structure with foreign keys
- Relations defined via Drizzle ORM relations API
- Timestamps (createdAt, publishedAt) for content chronology
- Slug-based lookups for SEO URLs

**Data Access Layer:**
- Abstracted storage interface in `server/storage.ts`
- Seed data capability for development
- Helper functions (stripPassword for safe user data, calculateReadTime)
- Query optimization with selective field loading

### External Dependencies

**Third-Party Services:**
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Fonts**: Playfair Display, Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter

**Key NPM Packages:**
- **UI Components**: @radix-ui/* primitives (20+ components)
- **Forms**: react-hook-form with @hookform/resolvers and zod validation
- **Database**: drizzle-orm, @neondatabase/serverless, connect-pg-simple
- **Authentication**: bcrypt, express-session
- **Utilities**: date-fns (date formatting), nanoid (ID generation), clsx/tailwind-merge (className utilities)

**Development Tools:**
- **TypeScript**: Strict mode enabled, path aliases configured
- **Vite Plugins**: React plugin, Replit runtime error overlay, cartographer (development only)
- **Build Tools**: esbuild for server bundling, Vite for client bundling

**Deployment Configuration:**
- Static file serving from `dist/public`
- Environment variables: DATABASE_URL (required)
- Production vs. development mode detection
- Session store configurable (MemoryStore default, connect-pg-simple available)