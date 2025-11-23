import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { toFile } from 'openai/uploads'
import { Pool } from 'pg'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : null

let tablesInitialized = false

// Ensure database tables exist
const ensureTables = async () => {
  if (!pool || tablesInitialized) return
  
  // Table to store the single global vector store ID
  await pool.query(`
    CREATE TABLE IF NOT EXISTS knowledge_base_vector_store (
      id SERIAL PRIMARY KEY,
      vector_store_id TEXT NOT NULL UNIQUE,
      vector_store_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // Table to track individual files in the knowledge base
  await pool.query(`
    CREATE TABLE IF NOT EXISTS knowledge_base_files (
      file_id TEXT PRIMARY KEY,
      vector_store_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  
  tablesInitialized = true
}

// Get or create the single global vector store
const getOrCreateKnowledgeBaseVectorStore = async () => {
  if (!pool || !openai.apiKey) return null
  await ensureTables()

  // Check if we already have a vector store
  const existing = await pool.query(
    'SELECT vector_store_id FROM knowledge_base_vector_store LIMIT 1'
  )

  if (existing.rows.length > 0) {
    return existing.rows[0].vector_store_id as string
  }

  // Create new vector store
  const vectorStore = await openai.vectorStores.create({
    name: 'housing-justice-knowledge-base',
  })

  // Store in database
  await pool.query(
    `INSERT INTO knowledge_base_vector_store (vector_store_id, vector_store_name) 
     VALUES ($1, $2)`,
    [vectorStore.id, 'housing-justice-knowledge-base']
  )

  return vectorStore.id
}

// Record file in database
const recordKnowledgeBaseFile = async (
  fileId: string,
  vectorStoreId: string,
  fileName: string,
  originalName: string,
  fileSize: number
) => {
  if (!pool) return
  await ensureTables()

  await pool.query(
    `INSERT INTO knowledge_base_files (file_id, vector_store_id, file_name, original_name, file_size)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (file_id) DO UPDATE 
     SET file_name = EXCLUDED.file_name,
         original_name = EXCLUDED.original_name`,
    [fileId, vectorStoreId, fileName, originalName, fileSize]
  )
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    if (!pool) {
      return NextResponse.json(
        { error: 'Database connection is not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'A file must be provided' },
        { status: 400 }
      )
    }

    // Validate PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    // Get or create the global vector store
    const vectorStoreId = await getOrCreateKnowledgeBaseVectorStore()
    
    if (!vectorStoreId) {
      return NextResponse.json(
        { error: 'Failed to initialize vector store' },
        { status: 500 }
      )
    }

    // Upload file to OpenAI
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadFile = await toFile(buffer, file.name, {
      type: 'application/pdf',
    })

    const uploadedFile = await openai.files.create({
      file: uploadFile,
      purpose: 'assistants',
    })

    // Add file to vector store
    await openai.vectorStores.files.create(vectorStoreId, {
      file_id: uploadedFile.id,
    })

    // Record in database
    await recordKnowledgeBaseFile(
      uploadedFile.id,
      vectorStoreId,
      uploadedFile.filename,
      file.name,
      file.size
    )

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.id,
      fileName: file.name,
      vectorStoreId,
    })
  } catch (error) {
    console.error('Knowledge base upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload file to knowledge base',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

