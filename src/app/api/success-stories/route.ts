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
  return [
    {
      id: '1',
      names: 'Priya & Rahul',
      location: 'Mumbai',
      date: '2024-12-15',
      story: 'We matched on Soulmate Sync based on our shared love for travel and similar family values. After 3 months of chatting, we met and knew instantly we were meant to be. Now happily married!',
      rating: 5,
      verified: true,
      photo: null,
    },
    {
      id: '2',
      names: 'Anita & Vikram',
      location: 'Delhi',
      date: '2024-10-20',
      story: 'The AI matching on this platform is incredible. It found us despite us being from different cities. The compatibility score was 94% and it turned out to be absolutely right!',
      rating: 5,
      verified: true,
      photo: null,
    },
    {
      id: '3',
      names: 'Sneha & Arjun',
      location: 'Bangalore',
      date: '2025-02-14',
      story: 'What I loved about Soulmate Sync is the verified profiles. I felt safe knowing everyone was genuine. Found my perfect match in just 2 months!',
      rating: 5,
      verified: true,
      photo: null,
    },
    {
      id: '4',
      names: 'Kavitha & Rajesh',
      location: 'Chennai',
      date: '2025-01-08',
      story: 'The Kundali matching feature helped our families feel confident. Both horoscopes matched perfectly and we had a beautiful wedding last month.',
      rating: 5,
      verified: true,
      photo: null,
    },
    {
      id: '5',
      names: 'Meera & Siddharth',
      location: 'Pune',
      date: '2025-03-22',
      story: 'Being an NRI, finding a partner with Indian values was important to me. Soulmate Sync understood my preferences perfectly. Siddharth is everything I was looking for.',
      rating: 5,
      verified: true,
      photo: null,
    },
    {
      id: '6',
      names: 'Deepa & Amit',
      location: 'Hyderabad',
      date: '2025-04-10',
      story: 'The video calling feature helped us build trust before meeting in person. We talked every day for 2 months and by the time we met, it felt like we already knew each other.',
      rating: 4,
      verified: true,
      photo: null,
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
