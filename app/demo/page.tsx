'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const demoFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyEmail: z.string().email('Please enter a valid email address'),
})

type DemoFormValues = z.infer<typeof demoFormSchema>

export default function DemoPage() {
  const router = useRouter()
  
  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      companyEmail: '',
    },
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const onSubmit = async (data: DemoFormValues) => {
    // Store user info in localStorage 
    localStorage.setItem('demoUser', JSON.stringify(data))
    
    // Show success message instead of redirecting
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Experience Equity Works
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Get hands-on with our AI-powered legal technology. Analyze housing notices 
              for defects or generate compliant documentation in minutes.
            </p>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl">Request Your Demo</CardTitle>
              <p className="text-muted-foreground">
                Please provide your information to access the interactive demo experience.
              </p>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">Request Submitted!</h3>
                  <p className="text-muted-foreground">
                    Check your inbox for communication from us to schedule a demo meeting.
                  </p>
                </div>
              ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="companyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your company email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Submitting...' : 'Complete Request'}
                  </Button>
                </form>
              </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
