'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PenTool, Plus, Minus, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DemoNavigation from '../components/DemoNavigation'

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedNotice, setGeneratedNotice] = useState('')
  const [generatedPDF, setGeneratedPDF] = useState('')
  const [pdfFileName, setPdfFileName] = useState('')
  const [copied, setCopied] = useState(false)
  
  // Form state variables matching Analyze Notice
  const [evictionType, setEvictionType] = useState('')
  const [ownerOccupied, setOwnerOccupied] = useState('')
  const [noticeType, setNoticeType] = useState('')
  const [situationDescription, setSituationDescription] = useState('')
  const [tenantNames, setTenantNames] = useState([{ name: '' }])
  const [propertyType, setPropertyType] = useState('')
  const [monthlyRentDue, setMonthlyRentDue] = useState('')
  const [totalRentBalance, setTotalRentBalance] = useState('')
  const [monthlyBalances, setMonthlyBalances] = useState([{ month: '', amount: '', chargeType: '', otherExplanation: '' }])
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [dateOfSale, setDateOfSale] = useState('')
  const [dateDeedOfTrustRecorded, setDateDeedOfTrustRecorded] = useState('')
  const [landlordName, setLandlordName] = useState('')
  const [rentOwed, setRentOwed] = useState('')

  // Helper functions for managing tenant names
  const addTenantName = () => {
    if (tenantNames.length < 5) {
      setTenantNames([...tenantNames, { name: '' }])
    }
  }

  const removeTenantName = (index: number) => {
    if (tenantNames.length > 1) {
      const updated = tenantNames.filter((_, i) => i !== index)
      setTenantNames(updated)
    }
  }

  const updateTenantName = (index: number, value: string) => {
    const updated = tenantNames.map((tenant, i) => 
      i === index ? { ...tenant, name: value } : tenant
    )
    setTenantNames(updated)
  }

  // Helper functions for managing monthly balances
  const addMonthlyBalance = () => {
    setMonthlyBalances([...monthlyBalances, { month: '', amount: '', chargeType: '', otherExplanation: '' }])
  }

  const removeMonthlyBalance = (index: number) => {
    if (monthlyBalances.length > 1) {
      const updated = monthlyBalances.filter((_, i) => i !== index)
      setMonthlyBalances(updated)
    }
  }

  const updateMonthlyBalance = (index: number, field: string, value: string) => {
    const updated = monthlyBalances.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setMonthlyBalances(updated)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedNotice)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleDownloadPDF = () => {
    if (generatedPDF) {
      const link = document.createElement('a')
      link.href = generatedPDF
      link.download = pdfFileName || 'notice.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <DemoNavigation />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Generate Housing Notice
            </h1>
            <p className="text-lg text-muted-foreground">
              Create legally compliant housing notices with AI-powered document generation
            </p>
          </div>

          <div className={`grid grid-cols-1 gap-8 ${noticeType === 'non-payment' ? '' : 'lg:grid-cols-2'}`}>
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Notice Details
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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Property Address</h3>
                  <div>
                    <Label htmlFor="address-line-1">Address Line 1</Label>
                    <Input
                      id="address-line-1"
                      type="text"
                      placeholder="Street address"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-line-2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address-line-2"
                      type="text"
                      placeholder="Apt, suite, unit, etc."
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip-code">Zip Code</Label>
                      <Input
                        id="zip-code"
                        type="text"
                        placeholder="Zip code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    type="text"
                    placeholder="City or County jurisdiction"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {evictionType === 'post-foreclosure' && (
                  <>
                    <div>
                      <Label htmlFor="date-of-sale">Date of Sale</Label>
                      <Input
                        id="date-of-sale"
                        type="date"
                        value={dateOfSale}
                        onChange={(e) => setDateOfSale(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-deed-trust-recorded">Date Deed of Trust Recorded</Label>
                      <Input
                        id="date-deed-trust-recorded"
                        type="date"
                        value={dateDeedOfTrustRecorded}
                        onChange={(e) => setDateDeedOfTrustRecorded(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}


                <Button 
                  onClick={() => {
                    const formData = {
                      evictionType,
                      ownerOccupied,
                      tenantNames,
                      noticeType,
                      situationDescription,
                      propertyType,
                      monthlyRentDue,
                      totalRentBalance,
                      monthlyBalances,
                      addressLine1,
                      addressLine2,
                      city,
                      state,
                      zipCode,
                      jurisdiction,
                      dateOfSale,
                      dateDeedOfTrustRecorded,
                      landlordName,
                      rentOwed
                    }
                    
                    setIsGenerating(true)
                    
                    fetch('/api/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(formData),
                    })
                    .then(response => response.json())
                    .then(result => {
                      setGeneratedNotice(result.notice)
                      setGeneratedPDF(result.pdfPath)
                      setPdfFileName(result.fileName)
                      setIsGenerating(false)
                    })
                    .catch(error => {
                      console.error('Generation error:', error)
                      setIsGenerating(false)
                    })
                  }}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Notice'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Notice Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Notice</span>
                  {generatedPDF && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPDF}
                    >
                      Download PDF
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedPDF ? (
                  <div className="space-y-4">
                    <iframe
                      src={generatedPDF}
                      className="w-full h-[600px] border border-gray-300 rounded"
                      title="Generated Notice PDF"
                    />
                    <div className="flex justify-center">
                      <Button
                        onClick={handleDownloadPDF}
                        className="w-full max-w-xs"
                      >
                        Download PDF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-[400px]">
                    <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Generated Notice</h3>
                    <p className="text-muted-foreground">
                      Fill out the form and click "Generate Notice" to create a compliant housing notice PDF
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
