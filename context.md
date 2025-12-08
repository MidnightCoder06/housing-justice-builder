
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

## Internal Routes

### Admin Routes
- **/admin-knowledgebase-addition** - Admin interface for uploading PDF documents into the knowledge base (supports multiple PDF uploads with progress tracking)

### Demo Workspaces
**Note:** Both `/demo` and `/camelbackventures-product-demo` are separate frontend interfaces that call the **same backend API routes** (`/api/analyze` and `/api/generate`). All OpenAI functionality (Files API, vector stores, web references, knowledge base) works identically across both workspaces.

- **/demo** - Primary demo workspace for housing justice notices
    * `/demo/analyze` - Upload and analyze eviction notices for legal compliance defects
    * `/demo/generate` - Generate legally compliant eviction notices with AI assistance
    
- **/camelbackventures-product-demo** - Demo workspace tailored for Camelback Ventures Fellowship application
    * `/camelbackventures-product-demo/analyze` - Same analyze functionality as `/demo/analyze`
    * `/camelbackventures-product-demo/generate` - Same generate functionality as `/demo/generate`

**Shared Features Across All Demo Routes:**
- Owner occupied field (for residential evictions)
- Residential, commercial, and post-foreclosure eviction types
- 11+ eviction reasons (non-payment, breach of covenant, lease violations, etc.)
- Comprehensive form fields (tenant names, property address, jurisdiction, etc.)

### Backend API Routes

#### `/api/generate` - **FULLY FUNCTIONAL** ✅
Generates legally compliant eviction notices with full AI integration:
- **GPT-4o** via Chat Completions API for notice generation
- **Knowledge Base Vector Store** queries for sample notice formatting
- **Real-time Web Reference Fetching** (1-hour cache) from 3 authoritative legal sources:
  - Nolo California Rent Control Guide
  - California Civil Code §1947.12
  - California AB 1482 (Tenant Protection Act)
- **Files API** uploads generated PDFs to OpenAI
- **Per-User Vector Stores** persist generated notices for future reference
- **PDFKit** generates downloadable PDF documents
- **Database Tracking** stores file and vector store metadata in Neon
- **Fallback System** uses template-based generation if AI fails

#### `/api/analyze` - **FULLY FUNCTIONAL** ✅
Analyzes uploaded eviction notices with full AI integration:
- **GPT-4o** via Chat Completions API for document analysis
- **Knowledge Base Vector Store** queries for comparison with sample notices
- **Real-time Web Reference Fetching** (1-hour cache) from 3 authoritative legal sources
- **Legal Checks Data Structure** with 10 predefined compliance checks (5 defects, 5 compliant elements)
- **Document Type Constant** currently set to "3-day eviction notice"
- **JSON Response Format** returns detected defects (with severity: high/medium/low) and compliant elements
- **Preserved UI Styling** displays results with icons and color-coded severity indicators
- **Same Retrieval Logic** as generate route for consistency

## OpenAI Software Used (Both Analyze & Generate Routes)
- **Files API** - Generated notices (generate route only) are uploaded to OpenAI for persistence and future reference
- **Vector Stores** - Generated notices are persisted in per-user vector stores (currently using shared user ID 'abc') so future LLM runs can reference prior documents
- **Knowledge Base Vector Store** - Admin-uploaded PDFs are stored in a single global vector store (`housing-justice-knowledge-base`) for AI-powered legal reference and compliance checking. Used by both analyze and generate routes for context
- **Chat Completions API (GPT-4o)** - Both analyze and generate workflows use GPT-4o with:
  - Vector store context retrieval from knowledge base
  - Real-time legal reference fetching from 3 authoritative sources (Nolo, CA Civil Code §1947.12, AB 1482)
  - 1-hour caching to ensure fresh legal data while minimizing external requests
  - Temperature 0.3 for consistent, accurate legal analysis
  - JSON response format for structured data

## Third-Party Libraries
- **pdfkit** - Generates the dynamic notice PDFs (see https://www.npmjs.com/package/pdfkit)
- **pg** - Node.js PostgreSQL client used to persist OpenAI file + vector store metadata in Neon
- **cheerio** - Fast HTML parser for extracting legal content from web references

## Real-Time Legal References
The notice generation workflow dynamically fetches current legal statutes and rent control information from authoritative sources:
- **Nolo California Rent Control Guide** - Comprehensive rent control laws and eviction protections
- **California Civil Code §1947.12** - Current statutory requirements for rent increases and notices
- **California AB 1482 (Tenant Protection Act)** - Statewide rent cap and just-cause eviction requirements

Content is fetched fresh on each generation request and cached for 1 hour to ensure legal accuracy while minimizing external requests. If web references are unavailable, the system falls back to the knowledge base vector store and template-based generation.


### Completed Features
* ✅ PDF generation is fully functional (PDFKit)
* ✅ Download button works and serves real PDFs
* ✅ Owner occupied field added to all 4 demo routes
* ✅ Generate route fully AI-powered with GPT-4o, vector stores, and web references
* ✅ Analyze route fully AI-powered with GPT-4o, vector stores, and web references
* ✅ Legal checks data structure with 10 predefined compliance checks
* ✅ Real-time web reference fetching with 1-hour caching
* ✅ Knowledge base integration for both analyze and generate

### TODO - High Priority
* **Add AI Analysis Disclaimer** - Display warning: "This is an initial AI review. Human legal review is required."
* **User Authentication** - Login system to support per-user file storage (currently all users share 'abc' ID)
* **Document Type Configurability** - Allow switching between different notice types (currently hardcoded to "3-day eviction notice")