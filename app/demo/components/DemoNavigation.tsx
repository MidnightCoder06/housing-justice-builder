'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FileText, PenTool } from 'lucide-react'

export default function DemoNavigation() {
  const pathname = usePathname()

  return (
    <Card className="p-6 mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-semibold text-primary mb-2">Demo Experience</h2>
          <p className="text-sm text-muted-foreground">
            Choose your workflow to explore Equity Works capabilities
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant={pathname === '/demo/analyze' ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <a href="/demo/analyze" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Analyze Notice
            </a>
          </Button>
          
          <Button
            variant={pathname === '/demo/generate' ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <a href="/demo/generate" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Generate Notice
            </a>
          </Button>
        </div>
      </div>
    </Card>
  )
}
