import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { documentText, fileName } = await request.json()

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock analysis results based on document content
    const mockAnalysis = {
      detectedDefects: [
        {
          issue: "Missing Proper Service Method Declaration",
          severity: "high" as const,
          description: "The notice does not clearly specify the method of service or include a declaration of service, which is required for legal validity.",
          source: "California Code of Civil Procedure § 1162(a)(3)"
        },
        {
          issue: "Unclear Grace Period Language",
          severity: "medium" as const,
          description: "The notice uses '3 days after service' but should specify '3 days after the date of service of this notice' for clarity.",
          source: "California Code of Civil Procedure § 1161(2)"
        },
        {
          issue: "Missing Late Fee Breakdown",
          severity: "low" as const,
          description: "If late fees are included in the amount due, they should be itemized separately from base rent.",
          source: "California Civil Code § 1946.2(c)"
        }
      ],
      compliantElements: [
        {
          element: "Proper Notice Format",
          description: "Document follows the standard format for a 3-day notice with clear heading and structure.",
          source: "California Code of Civil Procedure § 1161(2)"
        },
        {
          element: "Required Property Description",
          description: "Includes complete property address with apartment number as required by law.",
          source: "California Code of Civil Procedure § 1161(2)"
        },
        {
          element: "Specific Amount Due",
          description: "Clearly states the exact amount owed and the time period for which rent is due.",
          source: "California Code of Civil Procedure § 1161(2)"
        },
        {
          element: "Landlord Contact Information",
          description: "Provides complete landlord contact information including name and address for payment.",
          source: "California Civil Code § 1962(a)"
        },
        {
          element: "Proper Date and Signature",
          description: "Notice is dated and includes signature line as required for legal validity.",
          source: "California Code of Civil Procedure § 1162(a)(2)"
        }
      ]
    }

    return NextResponse.json(mockAnalysis)
  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}
