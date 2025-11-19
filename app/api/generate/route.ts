import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const PDFKitModule = require('pdfkit/js/pdfkit.standalone.js')
const PDFDocument = PDFKitModule.default ?? PDFKitModule

interface NoticePdfPayload {
  title: string
  tenantName: string
  landlordName: string
  propertyAddress: string
  jurisdiction: string
  noticeBody: string
  currentDate: string
}

const buildNoticePdf = (payload: NoticePdfPayload) => {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => {
      chunks.push(chunk as Buffer)
    })
    doc.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    doc.on('error', reject)

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(payload.title, { align: 'center' })

    doc.moveDown()
    doc.font('Helvetica').fontSize(11)
    doc.text(`Date: ${payload.currentDate}`)
    doc.text(`Tenant: ${payload.tenantName || 'N/A'}`)
    doc.text(`Landlord: ${payload.landlordName || 'N/A'}`)
    doc.text(`Property Address: ${payload.propertyAddress || 'N/A'}`)
    doc.text(`Jurisdiction: ${payload.jurisdiction || 'N/A'}`)

    doc.moveDown()
    doc.font('Helvetica-Bold').text('Notice Details', { underline: true })
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(11)

    const paragraphs = payload.noticeBody.split('\n\n')
    paragraphs.forEach((paragraph) => {
      const trimmed = paragraph.trim()
      if (trimmed.length > 0) {
        doc.text(trimmed, { align: 'left' })
        doc.moveDown(0.75)
      }
    })

    doc.end()
  })
}

export async function POST(request: NextRequest) {
  try {
    const { tenantName, landlordName, propertyAddress, noticeType, rentOwed, jurisdiction } = await request.json()

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate mock notice based on form data
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let noticeTitle = ""
    let noticePeriod = ""
    let specificLanguage = ""

    switch (noticeType) {
      case "3-day-pay-or-quit":
        noticeTitle = "NOTICE TO PAY RENT OR QUIT"
        noticePeriod = "three (3) days"
        specificLanguage = `YOU ARE HEREBY NOTIFIED that the rent on the above-described premises occupied by you is now due and payable in the amount of ${rentOwed} for the rental period specified above.

YOU ARE FURTHER NOTIFIED that you are required to pay said rent in full within three (3) days after the date of service of this notice or quit and surrender said premises to the undersigned, or legal proceedings will be instituted against you to recover possession of said premises, to declare the forfeiture of the lease or rental agreement under which you occupy said premises and to recover rents and damages, together with court costs and attorney's fees.`
        break
      case "30-day-notice":
        noticeTitle = "30-DAY NOTICE TO QUIT"
        noticePeriod = "thirty (30) days"
        specificLanguage = `YOU ARE HEREBY NOTIFIED that your tenancy of the above-described premises is hereby terminated thirty (30) days after the date of service of this notice on you.

YOU ARE FURTHER NOTIFIED that you are required to quit and surrender said premises to the undersigned on or before the expiration of said thirty (30) days, or legal proceedings will be instituted against you to recover possession of said premises.`
        break
      case "60-day-notice":
        noticeTitle = "60-DAY NOTICE TO QUIT"
        noticePeriod = "sixty (60) days"
        specificLanguage = `YOU ARE HEREBY NOTIFIED that your tenancy of the above-described premises is hereby terminated sixty (60) days after the date of service of this notice on you.

YOU ARE FURTHER NOTIFIED that you are required to quit and surrender said premises to the undersigned on or before the expiration of said sixty (60) days, or legal proceedings will be instituted against you to recover possession of said premises.`
        break
      default:
        noticeTitle = "NOTICE TO QUIT"
        noticePeriod = "as specified by law"
        specificLanguage = "Please see attached lease agreement for specific terms and conditions."
    }

    const mockNotice = `${noticeTitle}

TO: ${tenantName}
AND ALL OTHER OCCUPANTS OF THE PREMISES DESCRIBED BELOW:

PLEASE TAKE NOTICE that you are hereby required to quit and surrender to the undersigned the premises now held and occupied by you, being those certain premises situated in ${jurisdiction}, described as follows:

${propertyAddress}

${specificLanguage}

${noticeType === "3-day-pay-or-quit" ? `The amount of rent due must be paid to:
${landlordName}
[Payment Address - To be filled in]
${jurisdiction}

Acceptable forms of payment: [Cash, Check, Money Order - To be specified]` : ''}

This notice is served upon you for the following reason(s):
${noticeType === "3-day-pay-or-quit" ? `☐ Non-payment of rent in the amount of ${rentOwed}` : '☐ Other breach of lease terms as specified'}

NOTICE: The law provides that if you fail to comply with this notice within ${noticePeriod}, you may be subject to legal proceedings, including unlawful detainer action, to recover possession of the premises and monetary damages. Such legal proceedings may result in your eviction from the premises and a money judgment against you.

IF YOU HAVE QUESTIONS about your rights as a tenant, you may contact a local tenant organization or an attorney. If you cannot afford an attorney, you may be eligible for free legal services from a nonprofit legal services program.

DATED: ${currentDate}

_________________________________
${landlordName}
Owner/Authorized Agent

_________________________________
Title

_________________________________
Signature

METHOD OF SERVICE:
☐ Personal service
☐ Substituted service
☐ Posted on premises after attempted personal/substituted service
☐ Other: ________________________

Date of Service: _______________
Time of Service: _______________
Person Served: ________________

I declare under penalty of perjury under the laws of ${jurisdiction} that the foregoing is true and correct.

_________________________________
Signature of Person Serving Notice

_________________________________
Print Name

Note: This is a computer-generated notice template. Please review all applicable local, state, and federal laws before serving. Consider consulting with a qualified attorney to ensure compliance with all legal requirements in your jurisdiction.`

    const pdfBuffer = await buildNoticePdf({
      title: noticeTitle,
      tenantName,
      landlordName,
      propertyAddress,
      jurisdiction,
      noticeBody: mockNotice,
      currentDate,
    })

    const base64Pdf = pdfBuffer.toString('base64')
    const pdfDataUrl = `data:application/pdf;base64,${base64Pdf}`

    return NextResponse.json({ 
      pdfDataUrl,
      fileName: `notice-${new Date().toISOString().split('T')[0]}.pdf`,
      notice: mockNotice  // Keep for backward compatibility if needed
    })
  } catch (error) {
    console.error('Generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate notice' },
      { status: 500 }
    )
  }
}
