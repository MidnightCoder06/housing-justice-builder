'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DemoNavigation from '../components/DemoNavigation'

interface AnalysisResult {
  detectedDefects: Array<{
    issue: string
    severity: 'high' | 'medium' | 'low'
    description: string
  }>
  compliantElements: Array<{
    element: string
    description: string
  }>
}

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null)
  const [documentText, setDocumentText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  
  const { register, handleSubmit, setValue } = useForm()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      
      // Mock text extraction for demo
      const mockText = `NOTICE TO QUIT AND PAY RENT OR QUIT

TO: TENANT NAME
ADDRESS: 123 Main Street, Apartment 2B, San Francisco, CA 94102

YOU ARE HEREBY NOTIFIED that the rent on the above-described premises occupied by you is now due and payable in the amount of $2,400.00 for the period from March 1, 2024 to March 31, 2024.

YOU ARE FURTHER NOTIFIED that you are required to pay said rent in full within three (3) days after the date of service of this notice or quit and surrender said premises to the undersigned, or legal proceedings will be instituted against you to recover possession of said premises, to declare the forfeiture of the lease or rental agreement under which you occupy said premises and to recover rents and damages, together with court costs and attorney's fees.

The amount of rent due must be paid to:
LANDLORD NAME
1234 Property Management Ave
San Francisco, CA 94105

Date: March 5, 2024
Signature: [Landlord Signature]
LANDLORD NAME, Owner/Agent`
      
      setDocumentText(mockText)
      setValue('documentText', mockText)
    }
  }

  const handleAnalyze = async () => {
    if (!documentText.trim()) return
    
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText,
          fileName: file?.name || 'uploaded-document'
        }),
      })
      
      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <DemoNavigation />
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Analyze Housing Notice
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload a housing notice and our AI will identify potential defects and compliant elements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="file-upload">Select PDF or DOCX file</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                  {file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="document-text">Document Text Preview</Label>
                  <Textarea
                    id="document-text"
                    placeholder="Upload a file or paste document text here..."
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    className="mt-2 min-h-[200px]"
                  />
                </div>

                <Button 
                  onClick={handleAnalyze}
                  disabled={!documentText.trim() || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Document'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="space-y-6">
              {analysisResult && (
                <>
                  {/* Detected Defects */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Detected Defects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysisResult.detectedDefects.length === 0 ? (
                        <p className="text-muted-foreground">No defects detected in this document.</p>
                      ) : (
                        <div className="space-y-4">
                          {analysisResult.detectedDefects.map((defect, index) => (
                            <div key={index} className="border-l-4 border-destructive pl-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{defect.issue}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  defect.severity === 'high' ? 'bg-red-100 text-red-800' :
                                  defect.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {defect.severity}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{defect.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Compliant Elements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Compliant Elements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResult.compliantElements.map((element, index) => (
                          <div key={index} className="border-l-4 border-green-500 pl-4">
                            <span className="font-medium">{element.element}</span>
                            <p className="text-sm text-muted-foreground">{element.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!analysisResult && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Analysis Results</h3>
                    <p className="text-muted-foreground">
                      Upload and analyze a document to see detailed results here
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
