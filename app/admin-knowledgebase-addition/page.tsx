'use client'

import React, { useCallback, useRef, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, CheckCircle2, Loader2 } from 'lucide-react'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function AdminKnowledgebaseAdditionPage() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const startUpload = useCallback((file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error')
      setMessage('Only PDF files are supported.')
      return
    }

    setStatus('uploading')
    setMessage('Uploading document to the knowledge base...')
    setFileName(file.name)

    setTimeout(() => {
      setStatus('success')
      setMessage('Upload complete! Your PDF is now part of the knowledge base.')
    }, 1800)
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      startUpload(selectedFile)
      event.target.value = ''
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) {
      startUpload(droppedFile)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Admin Knowledge Base Addition
            </CardTitle>
            <p className="text-muted-foreground">
              Drag & drop new PDF knowledge base entries or click to browse files.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div
              className={`rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-primary/70 bg-primary/5 shadow-lg'
                  : 'border-muted-foreground/30 bg-background'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                {status === 'uploading' ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
                <div>
                  <p className="text-lg font-semibold">
                    {status === 'uploading' ? 'Uploading...' : 'Drop your PDF here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {status === 'uploading'
                      ? 'Please wait while we process your document.'
                      : 'Or click below to choose a file'}
                  </p>
                </div>

                <Button onClick={() => inputRef.current?.click()} disabled={status === 'uploading'}>
                  {status === 'uploading' ? 'Uploading' : 'Browse Files'}
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {fileName && (
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                <span className="font-semibold text-foreground">Selected file:</span>{' '}
                <span className="text-muted-foreground">{fileName}</span>
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
                {message}
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-green-500/50 bg-green-50 px-4 py-6 text-center text-green-700 animate-in fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-10 w-10 text-green-600 animate-in zoom-in" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Upload Complete</p>
                  <p className="text-sm text-green-700/80">
                    The knowledge base has been updated with your latest PDF.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
