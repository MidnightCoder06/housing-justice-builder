'use client'

import React, { useCallback, useRef, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, CheckCircle2, Loader2, FileText, AlertCircle, X } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error'

interface UploadedFile {
  id: string
  name: string
  status: FileUploadStatus
  progress: number
  error?: string
}

export default function AdminKnowledgebaseAdditionPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const startUpload = useCallback(async (filesToUpload: File[]) => {
    // Filter out non-PDF files and show warnings
    const pdfFiles = filesToUpload.filter(file => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        // Add error entry for non-PDF files
        const errorFile: UploadedFile = {
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          status: 'error',
          progress: 0,
          error: 'Only PDF files are supported'
        }
        setFiles(prev => [...prev, errorFile])
      }
      return isPdf
    })

    if (pdfFiles.length === 0) return

    setIsUploading(true)

    // Add all files to the list with pending status
    const newFiles: UploadedFile[] = pdfFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      status: 'pending',
      progress: 0,
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Upload files in parallel
    await Promise.all(
      pdfFiles.map(async (file, index) => {
        const fileId = newFiles[index].id
        
        try {
          // Update to uploading status
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'uploading', progress: 10 } : f
          ))

          // Create form data for API request
          const formData = new FormData()
          formData.append('file', file)

          // Simulate progress updates while uploading
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => {
              if (f.id === fileId && f.status === 'uploading' && f.progress < 90) {
                return { ...f, progress: Math.min(f.progress + 15, 90) }
              }
              return f
            }))
          }, 500)

          // Make API request
          const response = await fetch('/api/admin/knowledgebase-upload', {
            method: 'POST',
            body: formData,
          })

          clearInterval(progressInterval)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Upload failed')
          }

          const result = await response.json()

          // Mark as success
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'success', progress: 100 } : f
          ))
        } catch (error) {
          // Mark as error
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { 
              ...f, 
              status: 'error', 
              progress: 0,
              error: error instanceof Error ? error.message : 'Upload failed'
            } : f
          ))
        }
      })
    )

    setIsUploading(false)
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      const filesArray = Array.from(selectedFiles)
      startUpload(filesArray)
      event.target.value = ''
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const droppedFiles = event.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      const filesArray = Array.from(droppedFiles)
      startUpload(filesArray)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const clearAllFiles = () => {
    setFiles([])
  }

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
              Upload one or multiple PDF documents to expand the knowledge base.
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
                {isUploading ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
                <div>
                  <p className="text-lg font-semibold">
                    {isUploading ? 'Uploading...' : 'Drop your PDFs here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isUploading
                      ? 'Please wait while we process your documents.'
                      : 'Select one or multiple PDF files'}
                  </p>
                </div>

                <Button onClick={() => inputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? 'Uploading' : 'Browse Files'}
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* File Upload List */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Uploaded Files ({files.length})
                  </h3>
                  {files.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFiles}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="rounded-lg border bg-card p-4 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {file.status === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : file.status === 'error' ? (
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                          ) : file.status === 'uploading' ? (
                            <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0 mt-0.5" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.name}
                            </p>
                            
                            {file.status === 'error' && file.error && (
                              <p className="text-xs text-destructive mt-1">{file.error}</p>
                            )}
                            
                            {file.status === 'uploading' && (
                              <div className="mt-2 space-y-1">
                                <Progress value={file.progress} className="h-1.5" />
                                <p className="text-xs text-muted-foreground">
                                  {file.progress}% complete
                                </p>
                              </div>
                            )}
                            
                            {file.status === 'success' && (
                              <p className="text-xs text-green-600 mt-1">
                                Successfully uploaded to knowledge base
                              </p>
                            )}
                            
                            {file.status === 'pending' && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Waiting to upload...
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {files.length > 0 && (
                  <div className="rounded-lg bg-muted/30 px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Success: <span className="font-semibold text-green-600">{files.filter(f => f.status === 'success').length}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Failed: <span className="font-semibold text-destructive">{files.filter(f => f.status === 'error').length}</span>
                      </span>
                      <span className="text-muted-foreground">
                        In Progress: <span className="font-semibold text-primary">{files.filter(f => f.status === 'uploading' || f.status === 'pending').length}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
