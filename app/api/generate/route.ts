import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'
import OpenAI from 'openai'
import { toFile } from 'openai/uploads'
import { Pool } from 'pg'

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
    // List files in the vector store
    const files = await openai.vectorStores.files.list(vectorStoreId, {
      limit: 20,
    })

    if (files.data.length === 0) {
      return 'No reference documents found in knowledge base.'
    }

    // Get a sample of file content for context
    // Note: In a production system, you'd use proper embedding-based search
    // For now, we'll inform the model about available files
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

// Generate notice content using Chat Completions API with knowledge base context
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
    const knowledgeBaseVectorStoreId = await getKnowledgeBaseVectorStore()

    // Build the search query
    const searchQuery = `${payload.evictionType} eviction notice ${payload.noticeType} ${payload.jurisdiction}`

    // Get context from vector store
    let vectorStoreContext = ''
    if (knowledgeBaseVectorStoreId) {
      vectorStoreContext = await searchVectorStore(
        knowledgeBaseVectorStoreId,
        searchQuery
      )
    }

    // Create the system prompt
    const systemPrompt = `You are an expert legal assistant specializing in housing law and eviction notices. Your role is to generate legally compliant eviction notices based on the provided information.

${vectorStoreContext}

Guidelines:
1. Match the proper legal format and structure from similar notices
2. Include all required legal language and citations
3. Follow jurisdiction-specific requirements
4. Ensure proper notice periods and service methods
5. Use appropriate legal terminology
6. Generate notices that are clear, legally sound, and professionally formatted

Generate ONLY the notice text without any additional commentary or explanations.`

    // Create the user prompt
    const userPrompt = `Generate a legally compliant ${payload.evictionType} eviction notice for ${payload.noticeType || 'the specified reason'}.

Details:
- Tenant(s): ${payload.tenantNames.map((t) => t.name).filter(Boolean).join(', ') || 'Not specified'}
- Property Address: ${payload.propertyAddress}
- Jurisdiction: ${payload.jurisdiction}
${payload.landlordName ? `- Landlord: ${payload.landlordName}` : ''}
${payload.rentOwed ? `- Amount Owed: ${payload.rentOwed}` : ''}
${payload.situationDescription ? `- Situation: ${payload.situationDescription}` : ''}

Please generate a complete, legally compliant notice following the format and legal requirements. Include all required sections, legal citations, and proper formatting.`

    // Call Chat Completions API with GPT-4o model
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
      temperature: 0.3, // Lower temperature for more consistent legal formatting
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated from API')
    }

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
