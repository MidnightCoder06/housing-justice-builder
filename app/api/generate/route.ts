import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'
import OpenAI from 'openai'
import { toFile } from 'openai/uploads'
import { Pool } from 'pg'
import { load } from 'cheerio'

const require = createRequire(import.meta.url)
const PDFKitModule = require('pdfkit/js/pdfkit.standalone.js')
const PDFDocument = PDFKitModule.default ?? PDFKitModule

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : null

let tablesInitialized = false

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

const ensureTables = async () => {
  if (!pool || tablesInitialized) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_vector_stores (
      user_id TEXT PRIMARY KEY,
      vector_store_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notice_files (
      file_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      vector_store_id TEXT,
      file_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  tablesInitialized = true
}

const getOrCreateVectorStore = async (userId: string) => {
  if (!pool || !openai.apiKey) return null
  await ensureTables()

  const existing = await pool.query(
    'SELECT vector_store_id FROM user_vector_stores WHERE user_id = $1 LIMIT 1',
    [userId]
  )

  if (existing.rows.length > 0) {
    return existing.rows[0].vector_store_id as string
  }

  const vectorStore = await openai.vectorStores.create({
    name: `notice-store-${userId}`,
  })

  await pool.query(
    'INSERT INTO user_vector_stores (user_id, vector_store_id) VALUES ($1, $2)',
    [userId, vectorStore.id]
  )

  return vectorStore.id
}

const recordNoticeFile = async (
  userId: string,
  fileId: string,
  vectorStoreId: string | null,
  fileName: string
) => {
  if (!pool) return
  await ensureTables()

  await pool.query(
    `
      INSERT INTO notice_files (file_id, user_id, vector_store_id, file_name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (file_id)
      DO UPDATE SET user_id = EXCLUDED.user_id,
                    vector_store_id = EXCLUDED.vector_store_id,
                    file_name = EXCLUDED.file_name
    `,
    [fileId, userId, vectorStoreId, fileName]
  )
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

// Extract clean text from HTML
const extractTextFromHTML = (html: string, url: string): string => {
  const $ = load(html)
  
  // Remove script, style, and nav elements
  $('script, style, nav, header, footer, .nav, .navigation, .menu').remove()
  
  // Site-specific extraction
  if (url.includes('nolo.com')) {
    // Extract main article content from Nolo
    const mainContent = $('article, .article-content, main, .content').first()
    if (mainContent.length > 0) {
      return mainContent.text().trim().replace(/\s+/g, ' ')
    }
  } else if (url.includes('leginfo.legislature.ca.gov')) {
    // Extract statute/bill text from California Legislature site
    const statuteContent = $('body').text()
    return statuteContent.trim().replace(/\s+/g, ' ')
  }
  
  // Fallback: get body text
  return $('body').text().trim().replace(/\s+/g, ' ')
}

// Fetch and extract text from a URL with caching
const fetchWebReference = async (url: string): Promise<string> => {
  try {
    // Check cache first
    const cached = webReferenceCache.get(url)
    const now = Date.now()
    
    if (cached && (now - cached.fetchedAt) < CACHE_TTL) {
      console.log(`Using cached content for ${url}`)
      return cached.content
    }
    
    // Fetch fresh content
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
    
    // Limit text length to prevent context overflow (max 4000 chars per URL)
    const truncatedText = extractedText.slice(0, 4000)
    
    // Cache the result
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
    
    // Filter out empty results and combine
    const validResults = results.filter(text => text.length > 0)
    
    if (validResults.length === 0) {
      console.warn('No web references could be fetched')
      return 'Web references unavailable at this time.'
    }
    
    // Format the combined references
    const formattedReferences = LEGAL_REFERENCE_URLS.map((url, index) => {
      const content = results[index]
      if (content) {
        return `\n=== Reference: ${url} ===\n${content}\n`
      }
      return ''
    }).filter(Boolean).join('\n')
    
    console.log(`Successfully fetched ${validResults.length} legal references`)
    return `\n## CURRENT CALIFORNIA LAW REFERENCES (Fetched in real-time)\nUse these authoritative sources to ensure the generated notice complies with current laws:\n${formattedReferences}`
  } catch (error) {
    console.error('Error fetching web references:', error)
    return 'Web references unavailable at this time.'
  }
}

// Generate notice content using Responses API with file_search tool
const generateNoticeWithKnowledgeBase = async (payload: {
  evictionType: string
  noticeType: string
  tenantNames: Array<{ name: string }>
  landlordName?: string
  propertyAddress: string
  jurisdiction: string
  rentOwed?: string
  situationDescription?: string
}) => {
  try {
    // Fetch fresh legal references and knowledge base vector store ID in parallel
    const [knowledgeBaseVectorStoreId, webReferences] = await Promise.all([
      getKnowledgeBaseVectorStore(),
      fetchAllWebReferences()
    ])

    // Create the system instructions with web references
    const systemInstructions = `You are an expert legal assistant specializing in housing law and eviction notices. Your role is to generate legally compliant eviction notices based on the provided information.

## YOUR RESOURCES

### 1. Knowledge Base (Sample Notices)
You have access to a vector store containing sample eviction notices that represent proper legal formatting, language, and structure. Use the file_search tool to find relevant examples and model your generated notice after these best practices.

### 2. Real-Time Legal References
${webReferences}

## GENERATION GUIDELINES

1. **Search the knowledge base** for similar sample notices to match proper formatting and legal language
2. **Cross-reference with the real-time legal sources above** to ensure compliance with current California law
3. Match the proper legal format and structure from similar notices in the knowledge base
4. Include all required legal language and citations from current California law
5. Follow jurisdiction-specific requirements as detailed in the legal references above
6. Ensure proper notice periods and service methods per current statutes
7. Use appropriate legal terminology
8. Generate notices that are clear, legally sound, and professionally formatted

IMPORTANT: The legal references above contain the CURRENT California rent control laws, eviction statutes, and tenant protection acts. Use these as authoritative sources for legal requirements.

Generate ONLY the notice text without any additional commentary or explanations.`

    // Create the user prompt
    const userPrompt = `Generate a legally compliant ${payload.evictionType} eviction notice for ${payload.noticeType || 'the specified reason'}.

INSTRUCTIONS:
1. First, search the knowledge base for sample notices similar to this eviction type to understand proper formatting
2. Then generate a notice that follows proper legal format and complies with current California law

Details:
- Tenant(s): ${payload.tenantNames.map((t) => t.name).filter(Boolean).join(', ') || 'Not specified'}
- Property Address: ${payload.propertyAddress}
- Jurisdiction: ${payload.jurisdiction}
${payload.landlordName ? `- Landlord: ${payload.landlordName}` : ''}
${payload.rentOwed ? `- Amount Owed: ${payload.rentOwed}` : ''}
${payload.situationDescription ? `- Situation: ${payload.situationDescription}` : ''}

Please generate a complete, legally compliant notice following the format and legal requirements. Include all required sections, legal citations, and proper formatting.`

    // Build the tools array based on vector store availability
    const tools: OpenAI.Responses.Tool[] = []
    
    if (knowledgeBaseVectorStoreId) {
      console.log('Enabling file_search tool with knowledge base vector store for notice generation')
      tools.push({
        type: 'file_search',
        vector_store_ids: [knowledgeBaseVectorStoreId]
      })
    } else {
      console.log('No vector store available - generating without sample notice reference')
    }

    // Call Responses API with file_search tool
    console.log('Calling OpenAI Responses API for notice generation...')
    const response = await openai.responses.create({
      model: 'gpt-4o',
      instructions: systemInstructions,
      input: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      tools: tools.length > 0 ? tools : undefined
    })

    const generatedContent = response.output_text

    if (!generatedContent) {
      throw new Error('No content generated from API')
    }

    console.log('Notice generation complete')
    return generatedContent
  } catch (error) {
    console.error('Error generating notice with knowledge base:', error)
    return null
  }
}

interface NoticePdfPayload {
  title: string
  tenantName: string
  landlordName: string
  propertyAddress: string
  jurisdiction: string
  noticeBody: string
  currentDate: string
}

const buildNoticePdf = (payload: NoticePdfPayload) => {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    doc.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    doc.on('error', reject)

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(payload.title, { align: 'center' })

    doc.moveDown()
    doc.font('Helvetica').fontSize(11)
    doc.text(`Date: ${payload.currentDate}`)
    doc.text(`Tenant: ${payload.tenantName || 'N/A'}`)
    doc.text(`Landlord: ${payload.landlordName || 'N/A'}`)
    doc.text(`Property Address: ${payload.propertyAddress || 'N/A'}`)
    doc.text(`Jurisdiction: ${payload.jurisdiction || 'N/A'}`)

    doc.moveDown()
    doc.font('Helvetica-Bold').text('Notice Details', { underline: true })
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(11)

    const paragraphs = payload.noticeBody.split('\n\n')
    paragraphs.forEach((paragraph) => {
      const trimmed = paragraph.trim()
      if (trimmed.length > 0) {
        doc.text(trimmed, { align: 'left' })
        doc.moveDown(0.75)
      }
    })

    doc.end()
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const formData = await request.json()
    const { 
      tenantName, 
      tenantNames = [],
      landlordName, 
      propertyAddress, 
      noticeType, 
      evictionType = 'residential',
      rentOwed, 
      jurisdiction,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      situationDescription
    } = formData

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Build full address
    const fullAddress = propertyAddress || [
      addressLine1,
      addressLine2,
      `${city}, ${state} ${zipCode}`.trim()
    ].filter(Boolean).join(', ')

    // Combine tenant names
    const allTenantNames = tenantNames.length > 0 
      ? tenantNames 
      : tenantName 
        ? [{ name: tenantName }] 
        : [{ name: 'Tenant Name' }]

    // Try to generate notice using AI with knowledge base
    let generatedNotice = await generateNoticeWithKnowledgeBase({
      evictionType,
      noticeType,
      tenantNames: allTenantNames,
      landlordName,
      propertyAddress: fullAddress,
      jurisdiction,
      rentOwed,
      situationDescription,
    })

    // Fallback to mock notice if AI generation fails
    if (!generatedNotice) {
      console.log('AI generation failed, using fallback mock notice')
      
      let noticeTitle = ""
      let noticePeriod = ""
      let specificLanguage = ""

      switch (noticeType) {
        case "non-payment":
        case "3-day-pay-or-quit":
          noticeTitle = "NOTICE TO PAY RENT OR QUIT"
          noticePeriod = "three (3) days"
          specificLanguage = `YOU ARE HEREBY NOTIFIED that the rent on the above-described premises occupied by you is now due and payable in the amount of ${rentOwed || '$[AMOUNT]'} for the rental period specified above.

YOU ARE FURTHER NOTIFIED that you are required to pay said rent in full within three (3) days after the date of service of this notice or quit and surrender said premises to the undersigned, or legal proceedings will be instituted against you to recover possession of said premises, to declare the forfeiture of the lease or rental agreement under which you occupy said premises and to recover rents and damages, together with court costs and attorney's fees.`
          break
        case "30-day-notice":
          noticeTitle = "30-DAY NOTICE TO QUIT"
          noticePeriod = "thirty (30) days"
          specificLanguage = `YOU ARE HEREBY NOTIFIED that your tenancy of the above-described premises is hereby terminated thirty (30) days after the date of service of this notice on you.

YOU ARE FURTHER NOTIFIED that you are required to quit and surrender said premises to the undersigned on or before the expiration of said thirty (30) days, or legal proceedings will be instituted against you to recover possession of said premises.`
          break
        case "60-day-notice":
          noticeTitle = "60-DAY NOTICE TO QUIT"
          noticePeriod = "sixty (60) days"
          specificLanguage = `YOU ARE HEREBY NOTIFIED that your tenancy of the above-described premises is hereby terminated sixty (60) days after the date of service of this notice on you.

YOU ARE FURTHER NOTIFIED that you are required to quit and surrender said premises to the undersigned on or before the expiration of said sixty (60) days, or legal proceedings will be instituted against you to recover possession of said premises.`
          break
        default:
          noticeTitle = "NOTICE TO QUIT"
          noticePeriod = "as specified by law"
          specificLanguage = "Please see attached lease agreement for specific terms and conditions."
      }

      generatedNotice = `${noticeTitle}

TO: ${allTenantNames.map((t: {name: string}) => t.name).filter(Boolean).join(', ') || 'Tenant Name'}
AND ALL OTHER OCCUPANTS OF THE PREMISES DESCRIBED BELOW:

PLEASE TAKE NOTICE that you are hereby required to quit and surrender to the undersigned the premises now held and occupied by you, being those certain premises situated in ${jurisdiction}, described as follows:

${fullAddress}

${specificLanguage}

${noticeType === "non-payment" || noticeType === "3-day-pay-or-quit" ? `The amount of rent due must be paid to:
${landlordName || '[LANDLORD NAME]'}
[Payment Address - To be filled in]
${jurisdiction}

Acceptable forms of payment: [Cash, Check, Money Order - To be specified]` : ''}

This notice is served upon you for the following reason(s):
${noticeType === "non-payment" || noticeType === "3-day-pay-or-quit" ? `☐ Non-payment of rent in the amount of ${rentOwed || '$[AMOUNT]'}` : '☐ Other breach of lease terms as specified'}

NOTICE: The law provides that if you fail to comply with this notice within ${noticePeriod}, you may be subject to legal proceedings, including unlawful detainer action, to recover possession of the premises and monetary damages. Such legal proceedings may result in your eviction from the premises and a money judgment against you.

IF YOU HAVE QUESTIONS about your rights as a tenant, you may contact a local tenant organization or an attorney. If you cannot afford an attorney, you may be eligible for free legal services from a nonprofit legal services program.

DATED: ${currentDate}

_________________________________
${landlordName || '[LANDLORD NAME]'}
Owner/Authorized Agent

_________________________________
Title

_________________________________
Signature

METHOD OF SERVICE:
☐ Personal service
☐ Substituted service
☐ Posted on premises after attempted personal/substituted service
☐ Other: ________________________

Date of Service: _______________
Time of Service: _______________
Person Served: ________________

I declare under penalty of perjury under the laws of ${jurisdiction} that the foregoing is true and correct.

_________________________________
Signature of Person Serving Notice

_________________________________
Print Name

Note: This is a computer-generated notice template. Please review all applicable local, state, and federal laws before serving. Consider consulting with a qualified attorney to ensure compliance with all legal requirements in your jurisdiction.`
    }

    const noticeFileName = `notice-${new Date().toISOString().split('T')[0]}.pdf`

    // Extract title from generated notice (first line)
    const noticeTitle = generatedNotice.split('\n')[0].trim() || 'HOUSING NOTICE'

    const pdfBuffer = await buildNoticePdf({
      title: noticeTitle,
      tenantName: allTenantNames.map((t: {name: string}) => t.name).filter(Boolean).join(', ') || 'Tenant',
      landlordName: landlordName || 'Landlord',
      propertyAddress: fullAddress,
      jurisdiction: jurisdiction || 'N/A',
      noticeBody: generatedNotice,
      currentDate,
    })

    let uploadedFileId: string | null = null
    let vectorStoreId: string | null = null
    const userId = 'abc'

    try {
      const pdfFile = await toFile(pdfBuffer, noticeFileName, {
        type: 'application/pdf',
      })
      const uploadedFile = await openai.files.create({
        file: pdfFile,
        purpose: 'assistants',
      })
      uploadedFileId = uploadedFile.id
      vectorStoreId = await getOrCreateVectorStore(userId)
      if (vectorStoreId) {
        await openai.vectorStores.files.create(vectorStoreId, {
          file_id: uploadedFile.id,
        })
      }

      await recordNoticeFile(userId, uploadedFile.id, vectorStoreId, noticeFileName)

      console.log('OpenAI storage complete', {
        fileId: uploadedFile.id,
        vectorStoreId,
      })
    } catch (storageError) {
      console.error('Failed to store notice metadata:', storageError)
    }

    const base64Pdf = pdfBuffer.toString('base64')
    const pdfDataUrl = `data:application/pdf;base64,${base64Pdf}`

    return NextResponse.json({ 
      pdfDataUrl,
      fileName: noticeFileName,
      notice: generatedNotice,
      metadata: {
        fileId: uploadedFileId,
        vectorStoreId,
        userId,
      },
    })
  } catch (error) {
    console.error('Generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate notice' },
      { status: 500 }
    )
  }
}
