# Overview

This is a Mini Job Portal web application built with a modern full-stack architecture. The application serves three main user types: job seekers who can browse and apply for jobs, employers who can post job listings, and admins who can review applications. The platform features job filtering, application management, and CSV export functionality for administrative oversight.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 using TypeScript and follows a component-based architecture. The application uses Vite as the build tool and bundler for fast development and optimized production builds. State management is handled through TanStack Query (React Query) for server state management, providing caching, background updates, and optimistic updates.

The UI is built using shadcn/ui components with Radix UI primitives, styled with Tailwind CSS for consistent design and responsive layouts. The application uses Wouter for client-side routing, providing a lightweight alternative to React Router. Form handling is managed through React Hook Form with Zod validation for type-safe form schemas.

## Backend Architecture
The backend follows a REST API architecture built with Express.js and TypeScript. The server implements a layered architecture with separate concerns for routing, business logic, and data access. The application uses a storage interface pattern that abstracts database operations, making it easy to swap database implementations if needed.

API routes are organized under `/api` namespace with clear separation for different entities (jobs, applications, admin functions). The server includes middleware for request logging, error handling, and JSON parsing. Development includes Vite middleware integration for hot module replacement during development.

## Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema includes three main entities:
- Users table for storing user accounts with role-based access (applicant, employer, admin)
- Jobs table containing job postings with details like title, description, salary, location, deadline, and tags
- Applications table linking users to jobs with application details

The schema uses proper foreign key relationships and includes timestamp tracking for audit purposes. Drizzle provides compile-time type safety and automatic migration generation.

## Authentication Strategy
The current implementation uses a simplified authentication approach without JWT tokens, focusing on the core job portal functionality. The user system supports role-based access control with three distinct user types, laying the groundwork for future authentication enhancement.

## Data Storage and Management
Database operations are centralized through a storage interface that provides methods for all CRUD operations. This abstraction allows for easy testing and potential database switching. The storage layer includes filtering capabilities for job searches, pagination support, and aggregation functions for statistics.

Connection pooling is handled through Neon's serverless PostgreSQL driver, optimized for serverless deployments and automatic connection management.

## API Design Patterns
The REST API follows standard HTTP conventions with proper status codes and error handling. Response formats are consistent across endpoints, typically returning JSON with appropriate metadata for paginated results. The API supports filtering, search, and pagination parameters for job listings.

Error handling is centralized through Express middleware, providing consistent error responses and logging. Input validation uses Zod schemas shared between frontend and backend for type safety.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting with automatic scaling and connection pooling
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL with automatic migration generation

## UI and Styling
- **Radix UI**: Headless UI components providing accessibility and keyboard navigation
- **Tailwind CSS**: Utility-first CSS framework for responsive design and consistent styling
- **Lucide React**: Icon library providing consistent iconography throughout the application

## Development Tools
- **Vite**: Fast build tool and development server with hot module replacement
- **TypeScript**: Static typing for enhanced development experience and runtime safety
- **ESBuild**: Fast JavaScript bundler for production builds

## Frontend Libraries
- **TanStack Query**: Data fetching and caching library for server state management
- **React Hook Form**: Form library with minimal re-renders and easy validation integration
- **Zod**: Schema validation library for runtime type checking and form validation
- **Wouter**: Lightweight client-side routing library

## Backend Dependencies
- **Express.js**: Web framework for building the REST API
- **Connect PG Simple**: PostgreSQL session store for Express sessions
- **Date-fns**: Date utility library for date manipulation and formatting