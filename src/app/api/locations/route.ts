import { NextRequest, NextResponse } from 'next/server'
import { Country, State, City } from 'country-state-city'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const DATA_DIR = path.join(process.cwd(), 'data')

function getIndiaLocations() {
  const filePath = path.join(DATA_DIR, 'india-locations.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function getIndiaPincodes() {
  const filePath = path.join(DATA_DIR, 'india-pincodes.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // countries | states | districts | talukas | cities | pincode
  const countryCode = searchParams.get('country') || ''
  const stateCode = searchParams.get('state') || ''
  const districtCode = searchParams.get('district') || ''
  const talukaCode = searchParams.get('taluka') || ''
  const pincode = searchParams.get('pincode') || ''
  const search = searchParams.get('search') || ''

  try {
    // Pincode lookup (India only)
    if (type === 'pincode' && pincode) {
      const pincodes = getIndiaPincodes()
      const result = pincodes[pincode]
      if (result) {
        return NextResponse.json({ success: true, data: result })
      }
      return NextResponse.json({ success: false, error: 'Pincode not found' }, { status: 404 })
    }

    // Get all countries
    if (type === 'countries') {
      const countries = Country.getAllCountries().map(c => ({
        code: c.isoCode,
        name: c.name,
        phonecode: c.phonecode,
        flag: c.flag,
      }))
      return NextResponse.json({ data: countries })
    }

    // Get states for a country
    if (type === 'states' && countryCode) {
      const states = State.getStatesOfCountry(countryCode).map(s => ({
        code: s.isoCode,
        name: s.name,
      }))
      return NextResponse.json({ data: states })
    }

    // India-specific: Get districts for a state
    if (type === 'districts' && countryCode === 'IN' && stateCode) {
      const indiaData = getIndiaLocations()
      const stateData = indiaData[stateCode]
      if (!stateData) {
        return NextResponse.json({ data: [] })
      }
      const districts = Object.entries(stateData.districts).map(([code, d]: [string, any]) => ({
        code,
        name: d.name,
      }))
      return NextResponse.json({ data: districts })
    }

    // India-specific: Get talukas for a district
    if (type === 'talukas' && countryCode === 'IN' && stateCode && districtCode) {
      const indiaData = getIndiaLocations()
      const stateData = indiaData[stateCode]
      if (!stateData || !stateData.districts[districtCode]) {
        return NextResponse.json({ data: [] })
      }
      const talukas = Object.entries(stateData.districts[districtCode].talukas).map(([code, t]: [string, any]) => ({
        code,
        name: t.name,
      }))
      return NextResponse.json({ data: talukas })
    }

    // India-specific: Get cities for a taluka
    if (type === 'cities' && countryCode === 'IN' && stateCode && districtCode && talukaCode) {
      const indiaData = getIndiaLocations()
      const stateData = indiaData[stateCode]
      if (!stateData || !stateData.districts[districtCode] || !stateData.districts[districtCode].talukas[talukaCode]) {
        return NextResponse.json({ data: [] })
      }
      const cities = stateData.districts[districtCode].talukas[talukaCode].cities.map((name: string) => ({
        name,
      }))
      return NextResponse.json({ data: cities })
    }

    // Non-India: Get cities for a state (using country-state-city)
    if (type === 'cities' && countryCode && countryCode !== 'IN' && stateCode) {
      const cities = City.getCitiesOfState(countryCode, stateCode).map(c => ({
        name: c.name,
        lat: c.latitude,
        lng: c.longitude,
      }))
      return NextResponse.json({ data: cities })
    }

    // Search across all locations
    if (type === 'search' && search) {
      const q = search.toLowerCase()
      const results: any[] = []

      // Search cities in country-state-city
      if (countryCode && countryCode !== 'IN') {
        const allCities = City.getCitiesOfCountry(countryCode) || []
        const matches = allCities
          .filter(c => c.name.toLowerCase().includes(q))
          .slice(0, 20)
          .map(c => ({ name: c.name, state: c.stateCode, type: 'city' }))
        return NextResponse.json({ data: matches })
      }

      // Search India locations
      const indiaData = getIndiaLocations()
      for (const [stCode, state] of Object.entries(indiaData) as [string, any][]) {
        for (const [distCode, dist] of Object.entries(state.districts) as [string, any][]) {
          for (const [talCode, tal] of Object.entries(dist.talukas) as [string, any][]) {
            for (const city of tal.cities) {
              if (city.toLowerCase().includes(q)) {
                results.push({
                  city,
                  taluka: tal.name,
                  district: dist.name,
                  state: state.name,
                  stateCode: stCode,
                  districtCode: distCode,
                  talukaCode: talCode,
                })
                if (results.length >= 15) break
              }
            }
            if (results.length >= 15) break
          }
          if (results.length >= 15) break
        }
        if (results.length >= 15) break
      }
      return NextResponse.json({ data: results })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Location API error:', error)
    return NextResponse.json({ error: 'Failed to fetch location data' }, { status: 500 })
  }
}
