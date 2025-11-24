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

// Legal reference URLs
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

// Fetch all legal reference URLs in parallel
const fetchAllWebReferences = async (): Promise<string> => {
  try {
    const results = await Promise.all(
      LEGAL_REFERENCE_URLS.map(url => fetchWebReference(url))
    )
    
    const validResults = results.filter(text => text.length > 0)
    
    if (validResults.length === 0) {
      return 'Web references unavailable at this time.'
    }
    
    const formattedReferences = LEGAL_REFERENCE_URLS.map((url, index) => {
      const content = results[index]
      if (content) {
        return `\n=== Reference: ${url} ===\n${content}\n`
      }
      return ''
    }).filter(Boolean).join('\n')
    
    return `\n## LEGAL REFERENCES (Current as of fetch time)\n${formattedReferences}`
  } catch (error) {
    console.error('Error fetching web references:', error)
    return 'Web references unavailable at this time.'
  }
}

// Get the knowledge base vector store ID
const getKnowledgeBaseVectorStore = async () => {
  if (!pool) return null
  
  try {
    const result = await pool.query(
      'SELECT vector_store_id FROM knowledge_base_vector_store LIMIT 1'
    )
    return result.rows.length > 0 ? result.rows[0].vector_store_id as string : null
  } catch (error) {
    console.error('Error fetching knowledge base vector store:', error)
    return null
  }
}

// Search vector store for relevant context
const searchVectorStore = async (
  vectorStoreId: string,
  query: string
): Promise<string> => {
  try {
    const files = await openai.vectorStores.files.list(vectorStoreId, {
      limit: 20,
    })

    if (files.data.length === 0) {
      return 'No reference documents found in knowledge base.'
    }

    const fileList = files.data
      .slice(0, 5)
      .map((f) => f.id)
      .join(', ')

    return `Reference documents available in knowledge base (${files.data.length} total files). Use these as examples for proper legal formatting, language, and structure.`
  } catch (error) {
    console.error('Error searching vector store:', error)
    return 'Knowledge base available but search failed.'
  }
}

// Analyze document using GPT-4o with knowledge base and web references
const analyzeDocumentWithAI = async (
  documentText: string,
  fileName: string,
  evictionType?: string,
  noticeType?: string
) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    // Fetch web references and knowledge base in parallel
    const [knowledgeBaseVectorStoreId, webReferences] = await Promise.all([
      getKnowledgeBaseVectorStore(),
      fetchAllWebReferences()
    ])

    // Get context from vector store
    let vectorStoreContext = ''
    if (knowledgeBaseVectorStoreId) {
      vectorStoreContext = await searchVectorStore(
        knowledgeBaseVectorStoreId,
        `${evictionType || ''} ${noticeType || ''} eviction notice analysis`
      )
    }

    // Build the legal checks reference for the AI
    const legalChecksReference = LEGAL_CHECKS.map(check => 
      `- ${check.title}: ${check.description} (${check.lawCode})`
    ).join('\n')

    // Create the system prompt
    const systemPrompt = `You are an expert legal assistant specializing in California housing law and eviction notices. Your role is to analyze uploaded eviction notices for legal compliance.

${vectorStoreContext}

${webReferences}

## Legal Compliance Checks
Review the document for the following specific legal requirements:

${legalChecksReference}

Guidelines:
1. Analyze the document against current California law and local rent control ordinances
2. Identify specific defects with severity levels (high, medium, low)
3. Identify compliant elements that meet legal requirements
4. Reference specific law codes for each finding
5. Be thorough but concise in your analysis
6. Use the legal references above as authoritative sources

Return your analysis in valid JSON format ONLY (no markdown, no code blocks) with this exact structure:
{
  "detectedDefects": [
    {
      "issue": "Title of the issue",
      "severity": "high" | "medium" | "low",
      "description": "Detailed description of the defect",
      "source": "Specific law code or statute"
    }
  ],
  "compliantElements": [
    {
      "element": "Title of compliant element",
      "description": "Why this element is compliant",
      "source": "Specific law code or statute"
    }
  ]
}`

    const userPrompt = `Analyze this ${DOCUMENT_TYPE} for legal compliance:

Document Type: ${evictionType || 'Not specified'}
Notice Type: ${noticeType || 'Not specified'}
File Name: ${fileName}

DOCUMENT CONTENT:
${documentText}

Provide a thorough analysis identifying both defects and compliant elements. Return ONLY valid JSON.`

    // Call Chat Completions API with GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const analysisContent = completion.choices[0]?.message?.content

    if (!analysisContent) {
      throw new Error('No content generated from API')
    }

    const analysis = JSON.parse(analysisContent)
    return analysis
  } catch (error) {
    console.error('Error analyzing document with AI:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { documentText, fileName, evictionType, noticeType } = await request.json()

    if (!documentText) {
      return NextResponse.json(
        { error: 'Document text is required' },
        { status: 400 }
      )
    }

    // Perform AI analysis
    const analysis = await analyzeDocumentWithAI(
      documentText,
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
