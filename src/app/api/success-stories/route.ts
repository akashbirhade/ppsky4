import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const STORIES_FILE = path.join(process.cwd(), 'data', 'success-stories.json')

function getStories() {
  try {
    if (fs.existsSync(STORIES_FILE)) {
      return JSON.parse(fs.readFileSync(STORIES_FILE, 'utf-8'))
    }
  } catch {}
  return getDefaultStories()
}

function getDefaultStories() {
  // Sample stories shown until real users submit their own
  // These are clearly labeled as sample/example stories
  return [
    {
      id: 'sample-1',
      names: 'Share Your Story',
      location: '',
      date: new Date().toISOString().split('T')[0],
      story: 'Have you found your soulmate through our platform? We\'d love to hear your story! Submit yours below and inspire others on their journey to finding love.',
      rating: 5,
      verified: true,
      photo: null,
      isSample: true,
    },
  ]
}

export async function GET() {
  const stories = getStories()
  return NextResponse.json({ stories, total: stories.length })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { names, location, story, rating } = body

    if (!names || !story) {
      return NextResponse.json({ error: 'Names and story are required' }, { status: 400 })
    }

    const stories = getStories()
    const newStory = {
      id: String(Date.now()),
      names,
      location: location || '',
      date: new Date().toISOString().split('T')[0],
      story: story.substring(0, 500),
      rating: Math.min(5, Math.max(1, rating || 5)),
      verified: false, // Needs admin approval
      photo: null,
    }

    stories.push(newStory)

    // Save to file
    const dir = path.dirname(STORIES_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2))

    return NextResponse.json({
      success: true,
      story: newStory,
      message: 'Thank you! Your story will be reviewed and published soon.',
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit story' }, { status: 500 })
  }
}
