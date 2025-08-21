# Overview

This is a full-stack web application for selling CBC (Competency-Based Curriculum) past papers. The platform allows students to browse, purchase, and download educational materials with secure payment processing through M-Pesa and Visa. The application features a modern React frontend with an Express.js backend, built for the Kenyan education market.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing without the complexity of React Router
- **State Management**: TanStack Query for server state management and caching, with local React state for UI components
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, accessible design system
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Comprehensive component library using Radix UI primitives for accessibility

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Data Storage**: In-memory storage with interface for easy migration to persistent databases
- **File Upload**: Multer middleware for handling PDF file uploads with validation
- **Development**: Hot reloading with Vite integration for seamless full-stack development

## Database Design
- **Schema**: Drizzle ORM with PostgreSQL dialect for type-safe database operations (Note: MySQL conversion is not supported due to Replit's locked configuration)
- **Tables**: 
  - Past papers with metadata (title, subject, grade, price, file information)
  - Sales tracking with customer details and payment information
  - Admin authentication with username/password
  - User accounts with Replit Auth integration (id, email, profile data)
  - User purchases linking users to their purchased papers
  - Session storage for authentication state management
- **Migrations**: Drizzle Kit for database schema management and version control

## Authentication & Authorization
- **Admin System**: Simple username/password authentication for administrative functions (accessible via /admin route)
- **User Authentication**: Optional Replit Auth integration for user accounts and purchase history
- **Session Management**: Connect-pg-simple for PostgreSQL session storage with Replit OpenID Connect
- **Security**: Replit Auth with secure session management and JWT tokens
- **Purchase History**: Authenticated users can view their past purchases and download PDFs

## Payment Processing
- **M-Pesa Integration**: Real Safaricom Daraja API integration with STK Push for Kenyan mobile payments
- **Payment Flow**: Shopping cart -> payment modal -> STK Push -> real-time verification -> purchase completion
- **Phone Validation**: Supports multiple Kenyan phone number formats (254XXXXXXXXX, 07XXXXXXXX, +254XXXXXXXXX)
- **Status Tracking**: Real-time payment status polling with user-friendly feedback
- **Visa Payments**: Mock integration ready for real payment gateway integration
- **Validation**: Zod schemas for payment data validation and type safety

## File Management
- **Upload**: PDF-only file uploads with 10MB size limits
- **Storage**: Local file system with configurable upload directory
- **Validation**: MIME type checking and file size restrictions for security

## API Design
- **Pattern**: RESTful endpoints with consistent error handling
- **Routes**: CRUD operations for past papers, sales processing, and admin functions
- **Validation**: Input validation using Zod schemas shared between client and server
- **Error Handling**: Centralized error middleware with proper HTTP status codes

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database for production deployment
- **Connection**: Uses DATABASE_URL environment variable for connection string
- **ORM**: Drizzle ORM for type-safe database queries and migrations

## UI Framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessibility-focused component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

## Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **TypeScript**: Strict type checking with modern compiler options
- **ESBuild**: Fast bundling for production server builds

## Payment Services
- **M-Pesa**: Mobile money payment integration for Kenyan market
- **Visa**: Credit card processing for international payments
- **Validation**: Real-time payment form validation and error handling

## Email Services
- **Future Integration**: Planned email delivery service for purchased materials
- **Format**: PDF attachment delivery after successful payment processing

## File Processing
- **Multer**: Multipart form data handling for file uploads
- **PDF Validation**: MIME type checking and file integrity validation
- **Storage**: Local file system with plans for cloud storage migration