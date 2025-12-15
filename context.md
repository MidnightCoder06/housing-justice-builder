
## State Management & Data
- **TanStack Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form state management
- **Zod 3.25.76** - Schema validation

## Internal Routes

### Admin Routes
- **/admin-knowledgebase-addition** - Admin interface for uploading sample PDF documents (eviction notices, legal templates) into the **global knowledge base vector store**. These sample documents are then searchable by the analyze route to compare uploaded notices against best practices.

### Demo Workspaces
**Note:** Both `/demo` and `/camelbackventures-product-demo` are separate frontend interfaces that call the **same backend API routes** (`/api/analyze` and `/api/generate`). All OpenAI functionality (Files API, Responses API, vector stores, web references, knowledge base) works identically across both workspaces.

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

#### `/api/admin/knowledgebase-upload` - **FULLY FUNCTIONAL** ✅
Uploads sample PDF documents to the global knowledge base vector store:
- Creates the `housing-justice-knowledge-base` vector store if it doesn't exist
- Stores vector store ID in `knowledge_base_vector_store` database table
- Uploads PDFs to OpenAI Files API with `purpose: 'assistants'`
- Adds files to the vector store for semantic search
- Records file metadata in `knowledge_base_files` database table
- **Used by:** `/admin-knowledgebase-addition` page

#### `/api/file-upload` - **FULLY FUNCTIONAL** ✅
Uploads user documents to OpenAI for analysis:
- Accepts file uploads via FormData
- Uploads to OpenAI Files API with configurable purpose (`user_data`, `assistants`, etc.)
- Returns `fileId` for use in subsequent API calls
- Supports expiration (1-30 days) for automatic file cleanup
- **Used by:** `/demo/analyze` and `/camelbackventures-product-demo/analyze` pages

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
- **GPT-4o** via **Responses API** for document analysis (replaces deprecated Assistants API)
- **Native PDF Processing** - OpenAI processes uploaded PDFs directly via file IDs
- **File Upload Flow** - Frontend uploads PDF → gets `fileId` → passes to analyze endpoint
- **file_search Tool** - Searches the **same knowledge base vector store** that admins upload to via `/admin-knowledgebase-addition`
- **Real-time Web Reference Fetching** - Fetches current law from 3 authoritative URLs to check for violations
- **Legal Checks Data Structure** with 10 predefined compliance checks (5 defects, 5 compliant elements)
- **JSON Response Format** returns detected defects (with severity: high/medium/low) and compliant elements

## Knowledge Base Architecture

### Single Global Vector Store
The system uses ONE shared vector store (`housing-justice-knowledge-base`) for all sample documents:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN WORKFLOW                               │
│  /admin-knowledgebase-addition                                  │
│         │                                                       │
│         ▼                                                       │
│  /api/admin/knowledgebase-upload                               │
│         │                                                       │
│         ├──► Creates vector store (if needed)                  │
│         ├──► Uploads PDF to OpenAI Files API                   │
│         ├──► Adds file to vector store                         │
│         └──► Stores vector_store_id in database                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              knowledge_base_vector_store table                  │
│              (Neon PostgreSQL)                                  │
│                                                                 │
│  vector_store_id: "vs_abc123..."                               │
│  vector_store_name: "housing-justice-knowledge-base"           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYZE WORKFLOW                             │
│  /demo/analyze or /camelbackventures-product-demo/analyze      │
│         │                                                       │
│         ▼                                                       │
│  /api/analyze                                                   │
│         │                                                       │
│         ├──► Reads vector_store_id from database               │
│         ├──► Attaches to Responses API via file_search tool   │
│         └──► GPT-4o searches sample notices for comparison     │
└─────────────────────────────────────────────────────────────────┘
```

### Database Tables
- **`knowledge_base_vector_store`** - Stores the single global vector store ID
- **`knowledge_base_files`** - Tracks individual files uploaded to the knowledge base

## OpenAI APIs Used

### Responses API (Analyze Route)
The analyze route uses the new OpenAI Responses API (replacement for deprecated Assistants API):
- **`openai.responses.create()`** - Main API call for document analysis
- **`input_file` type** - Passes uploaded file IDs directly to GPT-4o for native PDF processing
- **`file_search` tool** - Searches the knowledge base vector store for sample notices
- **`vector_store_ids`** - Attaches the admin-uploaded knowledge base to enable semantic search
- **`instructions` parameter** - System-level instructions including real-time legal references
- **`text.format.type: 'json_object'`** - Structured JSON output for defects and compliant elements

### Files API
- **Document Upload** - PDFs uploaded via `/api/file-upload` with `purpose: 'user_data'`
- **Knowledge Base Upload** - PDFs uploaded via `/api/admin/knowledgebase-upload` with `purpose: 'assistants'`
- **File References** - File IDs passed to Responses API for native processing

### Vector Stores
- **Knowledge Base Vector Store** - Single global store named `housing-justice-knowledge-base`
  - Admin uploads sample PDFs via `/admin-knowledgebase-addition`
  - Analyze route searches these samples via `file_search` tool
  - Semantic search finds similar sample documents for comparison
- **Per-User Vector Stores** - Generate route persists generated notices (currently using shared user ID 'abc')

### Chat Completions API (Generate Route)
The generate route uses Chat Completions API with:
- Vector store context retrieval from knowledge base
- Real-time legal reference fetching from 3 authoritative sources
- Temperature 0.3 for consistent output

## Real-Time Legal Reference Fetching
Both analyze and generate routes dynamically fetch current legal statutes from 3 authoritative sources:

1. **Nolo California Rent Control Guide** (`nolo.com`)
   - Comprehensive rent control laws and eviction protections
   
2. **California Civil Code §1947.12** (`leginfo.legislature.ca.gov`)
   - Current statutory requirements for rent increases and notices
   
3. **California AB 1482 Tenant Protection Act** (`leginfo.legislature.ca.gov`)
   - Statewide rent cap and just-cause eviction requirements

**How it works:**
- Content is fetched fresh on each request (with 1-hour caching to minimize external requests)
- HTML is parsed with Cheerio to extract legal text
- Text is truncated to 4000 chars per source to fit in context
- Legal references are included in system instructions for AI to cross-reference
- AI checks uploaded notices against current law to identify violations

## Third-Party Libraries
- **pdfkit** - Generates the dynamic notice PDFs (see https://www.npmjs.com/package/pdfkit)
- **pg** - Node.js PostgreSQL client used to persist OpenAI file + vector store metadata in Neon
- **cheerio** - Fast HTML parser for extracting legal content from web references

### Completed Features
* ✅ PDF generation is fully functional (PDFKit)
* ✅ Download button works and serves real PDFs
* ✅ Owner occupied field added to all 4 demo routes
* ✅ Generate route fully AI-powered with GPT-4o, vector stores, and web references
* ✅ Analyze route fully AI-powered with GPT-4o via Responses API
* ✅ Native PDF processing via OpenAI file uploads (no client-side text extraction needed)
* ✅ file_search tool integration - searches admin-uploaded sample notices
* ✅ Admin knowledge base upload connected to analyze route
* ✅ Real-time web scraping of 3 legal reference URLs for current law compliance checking
* ✅ Legal checks data structure with 10 predefined compliance checks
* ✅ Migrated from deprecated Assistants API to Responses API

### TODO - High Priority
* **Add AI Analysis Disclaimer** - Display warning: "This is an initial AI review. Human legal review is required."
* **User Authentication** - Login system to support per-user file storage (currently all users share 'abc' ID)
* **Document Type Configurability** - Allow switching between different notice types (currently hardcoded to "3-day eviction notice")
* **Migrate Generate Route to Responses API** - Update generate endpoint to use Responses API for consistency
