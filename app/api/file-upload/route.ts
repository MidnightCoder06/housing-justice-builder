import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { toFile } from 'openai/uploads'

const allowedFilePurposes = [
  'assistants',
  'batch',
  'fine-tune',
  'vision',
  'user_data',
  'evals',
] as const

type FileUploadPurpose = (typeof allowedFilePurposes)[number]

const isValidPurpose = (value: unknown): value is FileUploadPurpose =>
  typeof value === 'string' &&
  allowedFilePurposes.includes(value as FileUploadPurpose)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const uploadedPurpose = formData.get('purpose')
    const purpose: FileUploadPurpose = isValidPurpose(uploadedPurpose)
      ? uploadedPurpose
      : 'assistants'
    const expiresInDays = Number(formData.get('expiresInDays')) || 1
    const clampedExpiresInDays = Math.max(1, Math.min(30, expiresInDays))
    const expiresAfterSeconds = clampedExpiresInDays * 24 * 60 * 60

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'A single file must be provided' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadFile = await toFile(buffer, file.name, {
      type: file.type || 'application/octet-stream',
    })

    const uploaded = await openai.files.create({
      file: uploadFile,
      purpose,
      expires_after: {
        anchor: 'created_at',
        seconds: expiresAfterSeconds,
      },
    })

    return NextResponse.json({
      fileId: uploaded.id,
      filename: uploaded.filename,
      createdAt: uploaded.created_at,
      expiresAt: uploaded.expires_at,
    })
  } catch (error) {
    console.error('OpenAI file upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file to OpenAI' },
      { status: 500 }
    )
  }
}
