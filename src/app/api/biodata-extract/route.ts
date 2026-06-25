import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { authenticateRequest } from '@/lib/auth'
import { extractProfileFromText } from '@/lib/biodata-extractor'

export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('biodata') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json({ error: 'File and userId are required' }, { status: 400 })
    }

    // Ensure user can only upload for themselves
    if (userId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized: cannot upload for another user' }, { status: 403 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, images (JPEG/PNG/WebP), Word documents, and text files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max for documents)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Create biodata directory for the user
    const biodataDir = path.join(process.cwd(), 'public', 'uploads', 'biodata')
    if (!existsSync(biodataDir)) {
      await mkdir(biodataDir, { recursive: true })
    }

    // Generate unique filename and save
    const ext = file.name.split('.').pop() || 'pdf'
    const sanitizedExt = ext.replace(/[^a-zA-Z0-9]/g, '')
    const filename = `${userId}_biodata_${Date.now()}.${sanitizedExt}`
    const filepath = path.join(biodataDir, filename)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    const savedFileUrl = `/uploads/biodata/${filename}`

    // Extract text based on file type
    let extractedText = ''

    if (file.type === 'application/pdf') {
      // eslint-disable-next-line
      const pdfParse = require('pdf-parse')
      const pdfData = await pdfParse(buffer)
      extractedText = pdfData.text
    } else if (file.type === 'text/plain') {
      extractedText = buffer.toString('utf-8')
    } else if (file.type.startsWith('image/')) {
      // For images, we provide a message that OCR is limited without external services
      // In production, integrate with Google Vision API or Tesseract
      extractedText = ''
      return NextResponse.json({
        success: true,
        savedFileUrl,
        extractedData: {},
        message: 'Image saved successfully. For image-based biodata, please use PDF format for automatic data extraction.',
        note: 'Image OCR requires additional setup. Your biodata image has been saved.'
      })
    } else {
      // For Word docs, basic text extraction
      // Extract readable ASCII text from the binary
      extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ')
    }

    // Extract profile data from text
    const extractedData = extractProfileFromText(extractedText)

    return NextResponse.json({
      success: true,
      savedFileUrl,
      extractedData,
      rawText: extractedText.substring(0, 2000), // First 2000 chars for debugging
      message: 'Biodata processed successfully. Review and confirm the extracted details.'
    })
  } catch (error) {
    console.error('Biodata extraction error:', error)
    return NextResponse.json({ error: 'Failed to process biodata document' }, { status: 500 })
  }
}
