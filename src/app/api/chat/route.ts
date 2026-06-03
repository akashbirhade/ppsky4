import { NextRequest, NextResponse } from 'next/server'
import { processMessage } from '@/ai-engine'
import { getUserById } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const { message, history, userId, sessionId } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get user profile if available
    const userProfile = userId ? getUserById(userId) : null
    const userName = userProfile?.name?.split(' ')[0]

    // Process with AI Engine (RAG + NLP + Multilingual)
    const aiResult = processMessage(
      message,
      sessionId || userId || 'anonymous',
      userName
    )

    return NextResponse.json({
      response: aiResult.message,
      language: aiResult.language,
      intent: aiResult.intent,
      confidence: aiResult.confidence
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ 
      response: "I'm having a brief moment. Could you try again? 😊" 
    })
  }
}
