import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Pool } from 'pg'
import { load } from 'cheerio'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : null

// Global constant for document type
const DOCUMENT_TYPE = '3-day eviction notice'

// Cache for web references (1 hour TTL)
interface CachedWebReference {
  content: string
  fetchedAt: number
}

const webReferenceCache = new Map<string, CachedWebReference>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

// Legal reference URLs for real-time law fetching
const LEGAL_REFERENCE_URLS = [
  'https://www.nolo.com/legal-encyclopedia/california-rent-control-law.html',
  'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1947.12.&lawCode=CIV',
  'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201920200AB1482'
]

// Legal compliance checks data structure
interface LegalCheck {
  title: string
  description: string
  lawCode: string
  checkType: 'defect' | 'compliant'
}

const LEGAL_CHECKS: LegalCheck[] = [
  // Potential Defects to Check For
  {
    title: "Service Method Declaration",
    description: "The notice must clearly specify the method of service and include a declaration of service for legal validity.",
    lawCode: "California Code of Civil Procedure § 1162(a)(3)",
    checkType: "defect"
  },
  {
    title: "Grace Period Language",
    description: "The notice must specify the exact grace period (e.g., '3 days after the date of service of this notice').",
    lawCode: "California Code of Civil Procedure § 1161(2)",
    checkType: "defect"
  },
  {
    title: "Late Fee Itemization",
    description: "Late fees must be itemized separately from base rent if included in the amount due.",
    lawCode: "California Civil Code § 1946.2(c)",
    checkType: "defect"
  },
  {
    title: "Tenant Protection Act Compliance",
    description: "Notice must comply with just-cause eviction requirements if property is covered by AB 1482.",
    lawCode: "California AB 1482 (Tenant Protection Act)",
    checkType: "defect"
  },
  {
    title: "Rent Control Ordinance Compliance",
    description: "Notice must comply with local rent control ordinances if applicable to the jurisdiction.",
    lawCode: "Local Rent Control Ordinances",
    checkType: "defect"
  },
  // Compliant Elements to Check For
  {
    title: "Proper Notice Format",
    description: "Document should follow the standard format with clear heading and structure.",
    lawCode: "California Code of Civil Procedure § 1161(2)",
    checkType: "compliant"
  },
  {
    title: "Required Property Description",
    description: "Must include complete property address as required by law.",
    lawCode: "California Code of Civil Procedure § 1161(2)",
    checkType: "compliant"
  },
  {
    title: "Specific Amount Due",
    description: "Must clearly state the exact amount owed and the time period for which rent is due.",
    lawCode: "California Code of Civil Procedure § 1161(2)",
    checkType: "compliant"
  },
  {
    title: "Landlord Contact Information",
    description: "Must provide complete landlord contact information including name and address for payment.",
    lawCode: "California Civil Code § 1962(a)",
    checkType: "compliant"
  },
  {
    title: "Proper Date and Signature",
    description: "Notice must be dated and include signature line for legal validity.",
    lawCode: "California Code of Civil Procedure § 1162(a)(2)",
    checkType: "compliant"
  }
]

// Extract clean text from HTML
const extractTextFromHTML = (html: string, url: string): string => {
  const $ = load(html)
  
  $('script, style, nav, header, footer, .nav, .navigation, .menu').remove()
  
  if (url.includes('nolo.com')) {
    const mainContent = $('article, .article-content, main, .content').first()
    if (mainContent.length > 0) {
      return mainContent.text().trim().replace(/\s+/g, ' ')
    }
  } else if (url.includes('leginfo.legislature.ca.gov')) {
    const statuteContent = $('body').text()
    return statuteContent.trim().replace(/\s+/g, ' ')
  }
  
  return $('body').text().trim().replace(/\s+/g, ' ')
}

// Fetch and extract text from a URL with caching
const fetchWebReference = async (url: string): Promise<string> => {
  try {
    const cached = webReferenceCache.get(url)
    const now = Date.now()
    
    if (cached && (now - cached.fetchedAt) < CACHE_TTL) {
      console.log(`Using cached content for ${url}`)
      return cached.content
    }
    
    console.log(`Fetching fresh content from ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EquityWorksBot/1.0; +https://equityworks.com)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    const extractedText = extractTextFromHTML(html, url)
    const truncatedText = extractedText.slice(0, 4000)
    
    webReferenceCache.set(url, {
      content: truncatedText,
      fetchedAt: now
    })
    
    return truncatedText
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    return ''
  }
}

// Fetch all legal reference URLs in parallel for real-time law checking
const fetchAllWebReferences = async (): Promise<string> => {
  try {
    console.log('Fetching real-time legal references from authoritative sources...')
    const results = await Promise.all(
      LEGAL_REFERENCE_URLS.map(url => fetchWebReference(url))
    )
    
    const validResults = results.filter(text => text.length > 0)
    
    if (validResults.length === 0) {
      console.warn('No web references could be fetched')
      return 'Web references unavailable at this time.'
    }
    
    const formattedReferences = LEGAL_REFERENCE_URLS.map((url, index) => {
      const content = results[index]
      if (content) {
        return `\n=== Reference: ${url} ===\n${content}\n`
      }
      return ''
    }).filter(Boolean).join('\n')
    
    console.log(`Successfully fetched ${validResults.length} legal references`)
    return `\n## CURRENT CALIFORNIA LAW REFERENCES (Fetched in real-time)\nUse these authoritative sources to verify if the uploaded notice violates any current laws:\n${formattedReferences}`
  } catch (error) {
    console.error('Error fetching web references:', error)
    return 'Web references unavailable at this time.'
  }
}

// Get the knowledge base vector store ID from database
const getKnowledgeBaseVectorStore = async (): Promise<string | null> => {
  if (!pool) {
    console.log('No database connection - vector store unavailable')
    return null
  }
  
  try {
    const result = await pool.query(
      'SELECT vector_store_id FROM knowledge_base_vector_store LIMIT 1'
    )
    const vectorStoreId = result.rows.length > 0 ? result.rows[0].vector_store_id as string : null
    if (vectorStoreId) {
      console.log(`Found knowledge base vector store: ${vectorStoreId}`)
    }
    return vectorStoreId
  } catch (error) {
    console.error('Error fetching knowledge base vector store:', error)
    return null
  }
}

// Analyze document using OpenAI Responses API with file_search tool for vector store
const analyzeDocumentWithAI = async (
  fileId: string | null,
  documentText: string | null,
  fileName: string,
  evictionType?: string,
  noticeType?: string
) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    // Fetch web references and knowledge base vector store ID in parallel
    const [knowledgeBaseVectorStoreId, webReferences] = await Promise.all([
      getKnowledgeBaseVectorStore(),
      fetchAllWebReferences()
    ])

    // Build the legal checks reference for the AI
    const legalChecksReference = LEGAL_CHECKS.map(check => 
      `- ${check.title}: ${check.description} (${check.lawCode})`
    ).join('\n')

    // Create the system instructions with real-time legal references
    const systemInstructions = `You are an expert legal assistant specializing in California housing law and eviction notices. Your role is to analyze uploaded eviction notices for legal compliance.

## YOUR RESOURCES

### 1. Knowledge Base (Sample Notices)
You have access to a vector store containing sample eviction notices that represent proper legal formatting, language, and structure. Use the file_search tool to find relevant examples and compare the uploaded document against these best practices.

### 2. Real-Time Legal References
${webReferences}

## Legal Compliance Checks
Review the document for the following specific legal requirements:

${legalChecksReference}

## ANALYSIS GUIDELINES

1. **Search the knowledge base** for similar sample notices to compare formatting and language
2. **Cross-reference with the real-time legal sources above** to verify compliance with current California law
3. Identify specific defects with severity levels:
   - **high**: Violations that could invalidate the notice or result in case dismissal
   - **medium**: Technical defects that weaken the notice but may not be fatal
   - **low**: Minor issues or best practice recommendations
4. Identify compliant elements that meet legal requirements
5. Reference specific law codes for each finding
6. Be thorough but concise in your analysis

Return your analysis in valid JSON format ONLY (no markdown, no code blocks) with this exact structure:
{
  "detectedDefects": [
    {
      "issue": "Title of the issue",
      "severity": "high" | "medium" | "low",
      "description": "Detailed description of the defect and why it violates the law",
      "source": "Specific law code or statute"
    }
  ],
  "compliantElements": [
    {
      "element": "Title of compliant element",
      "description": "Why this element is compliant with current law",
      "source": "Specific law code or statute"
    }
  ]
}`

    const userPromptText = `Analyze this ${DOCUMENT_TYPE} for legal compliance:

Document Type: ${evictionType || 'Not specified'}
Notice Type: ${noticeType || 'Not specified'}
File Name: ${fileName}

INSTRUCTIONS:
1. First, search the knowledge base for sample notices similar to this document type to understand proper formatting
2. Then analyze the uploaded document against current California law using the real-time legal references provided
3. Identify all defects (law violations) and compliant elements

Provide a thorough analysis. Return ONLY valid JSON.`

    // Build the input content array for the Responses API
    const inputContent: OpenAI.Responses.ResponseInputContent[] = []

    // If we have a file ID, include it as an input_file
    if (fileId) {
      inputContent.push({
        type: 'input_file',
        file_id: fileId
      })
    }

    // Add the text prompt
    inputContent.push({
      type: 'input_text',
      text: documentText 
        ? `${userPromptText}\n\nDOCUMENT CONTENT:\n${documentText}`
        : userPromptText
    })

    // Build the tools array based on vector store availability
    const tools: OpenAI.Responses.Tool[] = []
    
    if (knowledgeBaseVectorStoreId) {
      console.log('Enabling file_search tool with knowledge base vector store')
      tools.push({
        type: 'file_search',
        vector_store_ids: [knowledgeBaseVectorStoreId]
      })
    } else {
      console.log('No vector store available - proceeding without file_search')
    }

    // Call the Responses API
    console.log('Calling OpenAI Responses API for document analysis...')
    const response = await openai.responses.create({
      model: 'gpt-4o',
      instructions: systemInstructions,
      input: [
        {
          role: 'user',
          content: inputContent
        }
      ],
      tools: tools.length > 0 ? tools : undefined,
      text: {
        format: {
          type: 'json_object'
        }
      }
    })

    // Extract the response text
    const analysisContent = response.output_text

    if (!analysisContent) {
      throw new Error('No content generated from API')
    }

    console.log('Analysis complete')
    const analysis = JSON.parse(analysisContent)
    return analysis
  } catch (error) {
    console.error('Error analyzing document with AI:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, documentText, fileName, evictionType, noticeType } = await request.json()

    if (!fileId && !documentText) {
      return NextResponse.json(
        { error: 'Either fileId or documentText is required' },
        { status: 400 }
      )
    }

    // Perform AI analysis using Responses API with file_search
    const analysis = await analyzeDocumentWithAI(
      fileId || null,
      documentText || null,
      fileName || 'uploaded-document',
      evictionType,
      noticeType
    )

    if (!analysis) {
      return NextResponse.json(
        { error: 'AI analysis failed' },
        { status: 500 }
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}
