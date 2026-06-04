import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const hostsPath = path.join(process.cwd(), 'data', 'hosts.json')
    const hostsData = JSON.parse(fs.readFileSync(hostsPath, 'utf-8'))

    const allEvents = hostsData.flatMap((host: any) =>
      (host.events || []).map((event: any) => ({
        ...event,
        hostId: host.id,
        hostName: host.name,
        hostCity: host.city,
        hostRegion: host.region,
        hostCommunity: host.community,
      }))
    )

    // Sort by date (upcoming first)
    allEvents.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ events: allEvents, total: allEvents.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
