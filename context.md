
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
- Real-time AI analysis and generation with latest legal statutes
- PDF generation and download capabilities

## OpenAI Software Used
- **Files API** - The Analyze workflow uploads notice documents to OpenAI with a 24-hour expiration window so they can be referenced later for LLM analysis while keeping storage ephemeral.
- **Vector Stores** - Generated notices are persisted in per-user vector stores so future LLM runs can reference prior documents.
- **Knowledge Base Vector Store** - Admin-uploaded PDFs are stored in a single global vector store (`housing-justice-knowledge-base`) for AI-powered legal reference and compliance checking. The vector store ID is persisted in Neon for reuse across all uploads.
- **Chat Completions API (GPT-4o)** - The generate workflow uses OpenAI's GPT-4o model with vector store context retrieval and real-time legal reference fetching. The system queries the knowledge base vector store for sample notices and dynamically fetches current California rent control laws, statutes, and tenant protection acts from authoritative sources. This ensures generated notices comply with the latest legal requirements. As more sample notices are added to the knowledge base, the AI generates better formatting, legal language, and jurisdiction-specific requirements for more accurate notices.

TODO: ask for help on what do with analyze flow
^show a warning that just an initial review. Requires human check as well

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


### Next update for Brandon
* Login button (so we can store files by user) on the home page opens a form -> proceeds to the analysis / generation page
* A pdf is actually generated
* There is a download button that actually works
* owner occupied field is there


TOOD: analyze route functionality