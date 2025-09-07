'use client'

import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PenTool, Copy, CheckCircle, Loader2, FileText, Plus, Minus } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const generateFormSchema = z.object({
  tenantNames: z.array(z.object({ name: z.string().min(2, 'Tenant name is required') })).min(1, 'At least one tenant name is required').max(5, 'Maximum 5 tenant names allowed'),
  landlordName: z.string().min(2, 'Landlord name is required'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  noticeType: z.string().min(1, 'Notice type is required'),
  rentOwed: z.string().min(1, 'Rent owed amount is required'),
  jurisdiction: z.string().min(2, 'Jurisdiction is required'),
})

type GenerateFormValues = z.infer<typeof generateFormSchema>

export default function CamelbackGeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedNotice, setGeneratedNotice] = useState('')
  const [copied, setCopied] = useState(false)
  
  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      tenantNames: [{ name: '' }],
      landlordName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      propertyType: '',
      noticeType: '',
      rentOwed: '',
      jurisdiction: '',
    },
  })

  // @ts-ignore
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: 'tenantNames',
  })

  const onSubmit = async (data: GenerateFormValues) => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      setGeneratedNotice(result.notice)
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedNotice)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex gap-3">
              <a href="/camelbackventures-product-demo/analyze" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <FileText className="h-4 w-4" />
                Analyze Notice
              </a>
              
              <span className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
                <PenTool className="h-4 w-4" />
                Generate Notice
              </span>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Generate Housing Notice
            </h1>
            <p className="text-lg text-muted-foreground">
              Create legally compliant housing notices with AI-powered document generation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Notice Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Tenant Names *</FormLabel>
                          {fields.length < 5 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Current fields length:', fields.length);
                                append({ name: '' });
                                console.log('After append fields length:', fields.length);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Tenant
                            </Button>
                          )}
                        </div>
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex items-end gap-2 mb-2">
                            <FormField
                              control={form.control}
                              name={`tenantNames.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input placeholder={`Tenant ${index + 1} name`} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => remove(index)}
                                className="mb-2"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="landlordName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Landlord Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>


                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single-family">Single Family Residence</SelectItem>
                              <SelectItem value="multi-unit">Multi-Unit Apartment</SelectItem>
                              <SelectItem value="condominium">Condominium</SelectItem>
                              <SelectItem value="hotel-motel">Hotel/Motel</SelectItem>
                              <SelectItem value="dormitory">Dormitory</SelectItem>
                              <SelectItem value="transitional">Transitional Housing</SelectItem>
                              <SelectItem value="mobilehome">Mobilehome</SelectItem>
                              <SelectItem value="short-term">Short-Term Rental (&lt;30d)</SelectItem>
                              <SelectItem value="commercial">Commercial Property</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="noticeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notice Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select notice type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="non-payment">Non-payment of rent</SelectItem>
                                <SelectItem value="breach-covenant">Breach of covenant</SelectItem>
                                <SelectItem value="owner-occupant">Owner-occupant move-in</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rentOwed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rent Owed *</FormLabel>
                            <FormControl>
                              <Input placeholder="$2,400.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Property Address</h3>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="addressLine1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 1 *</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main Street" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      
                          <FormField
                            control={form.control}
                            name="addressLine2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 2</FormLabel>
                                <FormControl>
                                  <Input placeholder="Apt 2B, Unit 5, etc. (optional)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="San Francisco" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="CA" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Zip Code *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="94102" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jurisdiction *</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco, CA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit"
                      disabled={isGenerating}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Notice...
                        </>
                      ) : (
                        'Generate Notice'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Generated Notice Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Notice</span>
                  {generatedNotice && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={copied}
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedNotice ? (
                  <Textarea
                    value={generatedNotice}
                    readOnly
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Generated notice will appear here..."
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-[400px]">
                    <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Generated Notice</h3>
                    <p className="text-muted-foreground">
                      Fill out the form and click "Generate Notice" to create a compliant housing notice
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
