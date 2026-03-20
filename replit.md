# Lily & Steel - E-commerce Jewelry Store

## Overview

Lily & Steel is a handcrafted jewelry e-commerce application specializing in sterling silver bracelets and crystal accessories. The app features a unique numerology calculator that helps customers discover their personal numerology number and find crystals aligned with their energy. The platform includes product browsing, shopping cart functionality, order placement, and an admin panel for product management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for cart state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with hot module replacement

The frontend follows a pages-based structure with reusable components. Custom hooks abstract data fetching logic (`use-products`, `use-numerology`, `use-orders`, `use-cart`).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Connection**: Neon serverless PostgreSQL with WebSocket support

The server implements a storage layer pattern (`server/storage.ts`) that abstracts database operations. Routes are centralized in `server/routes.ts` with input validation using Zod schemas.

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod schemas for products, orders, and numerology meanings
- `routes.ts`: API route definitions with type-safe inputs and responses

### Data Storage
- **Database**: PostgreSQL via Neon serverless
- **Tables**: 
  - `products`: Jewelry items with name, description, price, images, and category
  - `numerology_meanings`: Number interpretations (1-9) with associated crystals
  - `orders`: Customer orders with items stored as JSONB
- **Schema Push**: Use `npm run db:push` to sync schema changes

### Authentication
- Simple admin authentication using environment variable `ADMIN_PASSWORD`
- Session stored in browser sessionStorage
- No user authentication required for shopping (guest checkout only)

### Key Design Decisions

1. **Monorepo Structure**: Client and server code coexist with shared types, enabling end-to-end type safety without code generation.

2. **Serverless-Ready**: Uses Neon's serverless driver with WebSocket support, optimized for edge deployments.

3. **Price Storage**: Prices stored in cents (integers) to avoid floating-point precision issues.

4. **Image Storage**: Product images stored as JSON array strings in the `imageUrl` field, allowing multiple images per product.

5. **Cart Persistence**: Shopping cart persisted to localStorage for session continuity.

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database accessed via `@neondatabase/serverless`
- **Connection**: Requires `DATABASE_URL` environment variable

### UI Components
- **shadcn/ui**: Pre-built accessible components using Radix UI primitives
- **Radix UI**: Underlying primitives for dialogs, dropdowns, tooltips, etc.
- **Lucide React**: Icon library

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migration tools
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animation library
- `date-fns`: Date manipulation for numerology calculations
- `zod`: Schema validation
- `wouter`: Lightweight routing

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (Neon format)
- `ADMIN_PASSWORD`: Password for accessing admin panel