'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, Plus, Minus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DemoNavigation from '../components/DemoNavigation'

interface AnalysisResult {
  detectedDefects: Array<{
    issue: string
    severity: 'high' | 'medium' | 'low'
    description: string
    source: string
  }>
  compliantElements: Array<{
    element: string
    description: string
    source: string
  }>
}

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null)
  const [commercialLeaseFile, setCommercialLeaseFile] = useState<File | null>(null)
  const [sampleNoticeFile, setSampleNoticeFile] = useState<File | null>(null)
  const [evictionType, setEvictionType] = useState('')
  const [ownerOccupied, setOwnerOccupied] = useState('')
  const [noticeType, setNoticeType] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [monthlyRentDue, setMonthlyRentDue] = useState('')
  const [totalRentBalance, setTotalRentBalance] = useState('')
  const [monthlyBalances, setMonthlyBalances] = useState<Array<{month: string, amount: string, chargeType?: string, otherExplanation?: string}>>([{month: '', amount: '', chargeType: '', otherExplanation: ''}])
  const [situationDescription, setSituationDescription] = useState('')
  const [tenantNames, setTenantNames] = useState<Array<{name: string}>>([{name: ''}])
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [dateOfSale, setDateOfSale] = useState('')
  const [dateDeedOfTrustRecorded, setDateDeedOfTrustRecorded] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  
  const { register, handleSubmit, setValue } = useForm()

  // Upload file to OpenAI and get file ID
  const uploadFileToOpenAI = async (fileToUpload: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', fileToUpload)
    formData.append('purpose', 'user_data')
    formData.append('expiresInDays', '1')

    const response = await fetch('/api/file-upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok || !data.fileId) {
      throw new Error(data.error || 'Failed to upload file to OpenAI')
    }

    console.log('File uploaded to OpenAI:', data)
    return data.fileId
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
    }
  }

  const handleCommercialLeaseUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setCommercialLeaseFile(uploadedFile)
    }
  }

  const handleSampleNoticeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setSampleNoticeFile(uploadedFile)
    }
  }

  const addTenantName = () => {
    if (tenantNames.length < 5) {
      setTenantNames([...tenantNames, {name: ''}])
    }
  }

  const removeTenantName = (index: number) => {
    if (tenantNames.length > 1) {
      setTenantNames(tenantNames.filter((_, i) => i !== index))
    }
  }

  const updateTenantName = (index: number, value: string) => {
    const updated = tenantNames.map((item, i) => 
      i === index ? { ...item, name: value } : item
    )
    setTenantNames(updated)
  }

  const addMonthlyBalance = () => {
    setMonthlyBalances([...monthlyBalances, {month: '', amount: '', chargeType: '', otherExplanation: ''}])
  }

  const removeMonthlyBalance = (index: number) => {
    if (monthlyBalances.length > 1) {
      setMonthlyBalances(monthlyBalances.filter((_, i) => i !== index))
    }
  }

  const updateMonthlyBalance = (index: number, field: 'month' | 'amount' | 'chargeType' | 'otherExplanation', value: string) => {
    const updated = monthlyBalances.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setMonthlyBalances(updated)
  }

  const handleAnalyze = async () => {
    // Check if we have the required files based on eviction type
    if (evictionType === 'commercial') {
      if (!commercialLeaseFile || !sampleNoticeFile) return
    } else {
      if (!file) return
    }
    
    setIsAnalyzing(true)
    
    try {
      // Upload file(s) to OpenAI first to get file ID(s)
      let fileId: string | null = null
      const fileToUpload = evictionType === 'commercial' ? commercialLeaseFile : file
      
      if (fileToUpload) {
        try {
          fileId = await uploadFileToOpenAI(fileToUpload)
        } catch (uploadError) {
          console.error('File upload error:', uploadError)
          // Continue without file ID - the API can still analyze with text extraction fallback
        }
      }

      // Send the file ID to the analyze endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          fileName: evictionType === 'commercial' 
            ? `${commercialLeaseFile?.name || 'lease'} + ${sampleNoticeFile?.name || 'notice'}`
            : file?.name || 'uploaded-document',
          evictionType,
          ownerOccupied,
          noticeType
        }),
      })
      
      const result = await response.json()
      console.log('Analyze API response:', result)
      
      // Check if the response is an error
      if (result.error) {
        console.error('Analysis API error:', result.error)
        setAnalysisResult({
          detectedDefects: [{
            issue: 'Analysis Failed',
            severity: 'high' as const,
            description: result.error || 'Unable to analyze document. Please try again.',
            source: 'System Error'
          }],
          compliantElements: []
        })
      } else {
        setAnalysisResult(result)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisResult({
        detectedDefects: [{
          issue: 'Connection Error',
          severity: 'high' as const,
          description: 'Unable to connect to analysis service. Please check your connection and try again.',
          source: 'System Error'
        }],
        compliantElements: []
      })
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

          <div className={`grid grid-cols-1 gap-8 ${noticeType === 'non-payment' ? '' : 'lg:grid-cols-2'}`}>
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
                  <Label htmlFor="eviction-type">Type of Eviction</Label>
                  <Select value={evictionType} onValueChange={(value) => {
                    setEvictionType(value)
                    // Reset notice type when eviction type changes
                    if (value === 'post-foreclosure') {
                      setNoticeType('')
                    }
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select eviction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="post-foreclosure">Post-Foreclosure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>{evictionType === 'post-foreclosure' ? 'Former Owner *' : 'Tenant Names *'}</Label>
                    {tenantNames.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTenantName}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {evictionType === 'post-foreclosure' ? 'Add Former Owner' : 'Add Tenant'}
                      </Button>
                    )}
                  </div>
                  {tenantNames.map((tenant, index) => (
                    <div key={index} className="flex items-end gap-2 mb-2">
                      <div className="flex-1">
                        <Input 
                          placeholder={evictionType === 'post-foreclosure' ? `Former Owner ${index + 1} name` : `Tenant ${index + 1} name`} 
                          value={tenant.name}
                          onChange={(e) => updateTenantName(index, e.target.value)}
                        />
                      </div>
                      {tenantNames.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTenantName(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {evictionType === 'residential' && (
                  <div>
                    <Label htmlFor="owner-occupied">Owner Occupied?</Label>
                    <Select value={ownerOccupied} onValueChange={setOwnerOccupied}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(evictionType === 'residential' || evictionType === 'commercial') && (
                  <div>
                    <Label htmlFor="notice-type">Reason for Eviction</Label>
                    <Select value={noticeType} onValueChange={setNoticeType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select reason for eviction" />
                      </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-payment">Non-payment of rent</SelectItem>
                      <SelectItem value="breach-covenant">Breach of covenant</SelectItem>
                      <SelectItem value="lease-violation">Lease Violation (e.g., pets, smoking)</SelectItem>
                      <SelectItem value="unauthorized-occupants">Unauthorized Occupants / Subletting</SelectItem>
                      <SelectItem value="refusal-entry">Refusal to Allow Entry</SelectItem>
                      <SelectItem value="minor-nuisance">Minor Nuisance</SelectItem>
                      <SelectItem value="nuisance-interference">Nuisance / Substantial Interference</SelectItem>
                      <SelectItem value="illegal-activity">Illegal Activity (e.g., drugs, violence, etc.)</SelectItem>
                      <SelectItem value="waste-damage">Waste / Damage to Property</SelectItem>
                      <SelectItem value="owner-relative-move">Owner / Relative Move In</SelectItem>
                      <SelectItem value="ellis-act">Ellis Act / Withdrawal from Market</SelectItem>
                    </SelectContent>
                    </Select>
                  </div>
                )}

                {noticeType && noticeType !== 'non-payment' && (
                  <div>
                    <Label htmlFor="situation-description">Describe the Situation</Label>
                    <Textarea
                      id="situation-description"
                      placeholder="Please provide a detailed description of the circumstances leading to the issuance of this eviction notice. Include all relevant dates, factual background, specific incidents (if more than one), applicable lease provisions, and any relevant statutes or legal grounds supporting the notice"
                      value={situationDescription}
                      onChange={(e) => setSituationDescription(e.target.value)}
                      className="mt-2 min-h-[120px]"
                    />
                  </div>
                )}

                {noticeType === 'non-payment' && (
                  <div className="space-y-4 p-6 border border-gray-300 rounded-lg bg-gray-50 w-full max-w-none">
                    <h3 className="text-lg font-medium text-gray-900">Outstanding Rent Balance</h3>
                    
                    <div>
                      <Label htmlFor="monthly-rent-due">Monthly Rent Obligation</Label>
                      <Input
                        id="monthly-rent-due"
                        type="text"
                        placeholder="$0.00"
                        value={monthlyRentDue}
                        onChange={(e) => setMonthlyRentDue(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="total-balance">Total Outstanding Balance</Label>
                      <Input
                        id="total-balance"
                        type="text"
                        placeholder="$0.00"
                        value={totalRentBalance}
                        onChange={(e) => setTotalRentBalance(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Monthly breakdown</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addMonthlyBalance}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Month
                        </Button>
                      </div>
                      
                      {monthlyBalances.map((balance, index) => (
                        <div key={index} className="space-y-2">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end w-full">
                            <div>
                              <Label htmlFor={`month-${index}`}>Month</Label>
                              <Input
                                id={`month-${index}`}
                                type="month"
                                value={balance.month}
                                onChange={(e) => updateMonthlyBalance(index, 'month', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`amount-${index}`}>Amount</Label>
                              <Input
                                id={`amount-${index}`}
                                type="text"
                                placeholder="$0.00"
                                value={balance.amount}
                                onChange={(e) => updateMonthlyBalance(index, 'amount', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`charge-type-${index}`}>Charge Type</Label>
                              <Select 
                                value={balance.chargeType || ''} 
                                onValueChange={(value) => updateMonthlyBalance(index, 'chargeType', value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select charge type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="base-rent">Base Rent</SelectItem>
                                  <SelectItem value="late-fees">Late fees</SelectItem>
                                  <SelectItem value="utilities">Utilities</SelectItem>
                                  <SelectItem value="parking-fees">Parking fees</SelectItem>
                                  <SelectItem value="maintenance-charges">Maintenance charges</SelectItem>
                                  <SelectItem value="storage">Storage</SelectItem>
                                  <SelectItem value="security-deposit">Security deposit balance</SelectItem>
                                  <SelectItem value="additional-rent">Additional Rent (as specified in lease)</SelectItem>
                                  <SelectItem value="other">Other (Please Specify)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {monthlyBalances.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeMonthlyBalance(index)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {balance.chargeType === 'other' && (
                            <div className="mt-2">
                              <Label htmlFor={`other-explanation-${index}`}>Please specify</Label>
                              <Input
                                id={`other-explanation-${index}`}
                                type="text"
                                placeholder="Please limit to 50 words"
                                value={balance.otherExplanation || ''}
                                onChange={(e) => updateMonthlyBalance(index, 'otherExplanation', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evictionType === 'residential' && (
                  <div>
                    <Label htmlFor="property-type">Property Type</Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-family">Single Family Residence</SelectItem>
                        <SelectItem value="multi-unit">Multi-Unit Apartment</SelectItem>
                        <SelectItem value="condominium">Condominium</SelectItem>
                        <SelectItem value="hotel-motel">Hotel/Motel</SelectItem>
                        <SelectItem value="dormitory">Dormitory</SelectItem>
                        <SelectItem value="transitional">Transitional Housing</SelectItem>
                        <SelectItem value="mobilehome">Mobile Home</SelectItem>
                        <SelectItem value="short-term">Short-Term Rental (&lt;30d)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Property Address</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address-line-1">Address Line 1 *</Label>
                      <Input
                        id="address-line-1"
                        type="text"
                        placeholder="123 Main Street"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address-line-2">Address Line 2</Label>
                      <Input
                        id="address-line-2"
                        type="text"
                        placeholder="Apt 2B, Unit 5, etc. (optional)"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="San Francisco"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="CA"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip-code">Zip Code *</Label>
                        <Input
                          id="zip-code"
                          type="text"
                          placeholder="94102"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                  <Input
                    id="jurisdiction"
                    type="text"
                    placeholder="San Francisco, CA"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {evictionType === 'post-foreclosure' && (
                  <>
                    <div>
                      <Label htmlFor="date-of-sale">Date of Sale *</Label>
                      <Input
                        id="date-of-sale"
                        type="date"
                        value={dateOfSale}
                        onChange={(e) => setDateOfSale(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date-deed-recorded">Date Deed of Trust Recorded *</Label>
                      <Input
                        id="date-deed-recorded"
                        type="date"
                        value={dateDeedOfTrustRecorded}
                        onChange={(e) => setDateDeedOfTrustRecorded(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}

                {evictionType === 'commercial' ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="commercial-lease-upload">Select Commercial Lease Agreement</Label>
                      <Input
                        id="commercial-lease-upload"
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleCommercialLeaseUpload}
                        className="mt-2"
                      />
                      {commercialLeaseFile && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {commercialLeaseFile.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="sample-notice-upload">Select Sample Notice</Label>
                      <Input
                        id="sample-notice-upload"
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleSampleNoticeUpload}
                        className="mt-2"
                      />
                      {sampleNoticeFile && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {sampleNoticeFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
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
                )}

                <Button 
                  onClick={handleAnalyze}
                  disabled={(evictionType === 'commercial' ? (!commercialLeaseFile || !sampleNoticeFile) : !file) || isAnalyzing}
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
                              <p className="text-sm text-muted-foreground mb-2">{defect.description}</p>
                              <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                                Source: {defect.source}
                              </p>
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
                            <p className="text-sm text-muted-foreground mb-2">{element.description}</p>
                            <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                              Source: {element.source}
                            </p>
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
