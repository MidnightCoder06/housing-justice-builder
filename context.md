# Equity Works - Frontend Technology Stack

## Core Framework
- **Next.js 15.1.0** - Full-stack React framework with app router
- **React 18.3.1** - Main frontend JavaScript library  
- **TypeScript 5.8.3** - Type safety and developer experience

## Full-Stack Capabilities
- **API Routes** - Built-in backend API with TypeScript support
- **Server-Side Rendering (SSR)** - Improved SEO and performance
- **Static Site Generation (SSG)** - Pre-rendered pages for better performance
- **Image Optimization** - Built-in next/image component
- **Automatic Code Splitting** - Optimized bundle sizes

## UI Components & Styling
- **shadcn/ui** - Modern component library built on Radix UI
- **Radix UI** - Headless, accessible UI primitives
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Lucide React 0.462.0** - Icon library
- **class-variance-authority** - Utility for creating component variants
- **clsx & tailwind-merge** - Conditional className utilities

## State Management & Data
- **TanStack Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form state management
- **Zod 3.25.76** - Schema validation

## Enhanced UI Features
- **next-themes 0.3.0** - Theme switching support
- **Sonner 1.7.4** - Toast notifications
- **cmdk 1.1.1** - Command palette component
- **date-fns 3.6.0** - Date utility functions
- **react-day-picker 8.10.1** - Date picker component
- **embla-carousel-react 8.6.0** - Carousel component
- **recharts 2.15.4** - Chart library
- **react-resizable-panels 2.1.9** - Resizable layout panels
- **input-otp 1.4.2** - OTP input component
- **vaul 0.9.9** - Drawer component

## Development Tools
- **ESLint** - Code linting with Next.js configuration
- **TypeScript ESLint** - TypeScript-specific linting
- **Autoprefixer 10.4.21** - CSS vendor prefixing
- **PostCSS 8.5.6** - CSS processing

## Project Architecture
- **Full-Stack Application** - Frontend + Backend API capabilities
- **App Router** - Next.js 13+ file-based routing system
- **Component-based architecture** - Modular React components
- **Type-safe development** - Full TypeScript integration
- **Monorepo ready** - Perfect for adding backend services

## Internal Routes
- **/admin-knowledgebase-addition** - Admin interface for uploading PDF documents into the knowledge base
- **/camelbackventures-product-demo** - Demo workspace with analyze and generate tools tailored for Camelback Ventures Fellowship application
    * The Analyze flow uploads the selected documents via the OpenAI File API with a 24-hour expiry before triggering analysis

## OpenAI Software Used
- **Files API** - The Analyze workflow uploads notice documents to OpenAI with a 24-hour expiration window so they can be referenced later for LLM analysis while keeping storage ephemeral.
- **Vector Stores** - Generated notices are persisted in per-user vector stores so future LLM runs can reference prior documents.

## Third-Party Libraries
- **pdfkit** - Generates the dynamic notice PDFs (see https://www.npmjs.com/package/pdfkit)
- **pg** - Node.js PostgreSQL client used to persist OpenAI file + vector store metadata in Neon

## Migration Benefits
- **Better SEO** - Server-side rendering and static generation
- **Full-Stack TypeScript** - Seamless frontend/backend development
- **API Routes** - Built-in backend for your TypeScript backend needs
- **Performance** - Image optimization, automatic code splitting
- **Production Ready** - Enterprise-grade framework with excellent DX

## Key Features
- Responsive design with mobile-first approach
- Accessible UI components via Radix UI
- Modern CSS with Tailwind utility classes
- Form validation and state management
- Toast notifications and interactive components
- Icon system with Lucide React
- Theme support for light/dark modes
- SEO optimized with proper meta tags
- Performance optimized with Next.js features 


### Next update for Brandon
* Login button (so we can store files by user) on the home page opens a form -> proceeds to the analysis / generation page
* A pdf is actually generated
* There is a download button that actually works
