'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MapPin, Search, Loader2, X, ChevronDown } from 'lucide-react'

interface LocationData {
  country: string
  countryCode: string
  state: string
  stateCode: string
  district: string
  districtCode: string
  taluka: string
  talukaCode: string
  city: string
  pincode: string
}

interface LocationSelectorProps {
  value?: Partial<LocationData>
  onChange: (location: LocationData) => void
  showPincode?: boolean
  compact?: boolean
}

interface DropdownOption {
  code: string
  name: string
}

export default function LocationSelector({ value, onChange, showPincode = true, compact = false }: LocationSelectorProps) {
  const [countries, setCountries] = useState<DropdownOption[]>([])
  const [states, setStates] = useState<DropdownOption[]>([])
  const [districts, setDistricts] = useState<DropdownOption[]>([])
  const [talukas, setTalukas] = useState<DropdownOption[]>([])
  const [cities, setCities] = useState<{ name: string }[]>([])

  const [selectedCountry, setSelectedCountry] = useState(value?.countryCode || 'IN')
  const [selectedState, setSelectedState] = useState(value?.stateCode || '')
  const [selectedDistrict, setSelectedDistrict] = useState(value?.districtCode || '')
  const [selectedTaluka, setSelectedTaluka] = useState(value?.talukaCode || '')
  const [selectedCity, setSelectedCity] = useState(value?.city || '')
  const [pincode, setPincode] = useState(value?.pincode || '')

  const [loading, setLoading] = useState<string>('')
  const [searchMode, setSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const isIndia = selectedCountry === 'IN'
  const searchTimeout = useRef<NodeJS.Timeout>()

  // Fetch countries on mount
  useEffect(() => {
    fetch('/api/locations?type=countries')
      .then(r => r.json())
      .then(d => setCountries(d.data || []))
      .catch(() => {})
  }, [])

  // Fetch states when country changes
  useEffect(() => {
    if (!selectedCountry) return
    setLoading('states')
    fetch(`/api/locations?type=states&country=${selectedCountry}`)
      .then(r => r.json())
      .then(d => { setStates(d.data || []); setLoading('') })
      .catch(() => setLoading(''))
  }, [selectedCountry])

  // Fetch districts when state changes (India only)
  useEffect(() => {
    if (!isIndia || !selectedState) { setDistricts([]); return }
    setLoading('districts')
    fetch(`/api/locations?type=districts&country=IN&state=${selectedState}`)
      .then(r => r.json())
      .then(d => { setDistricts(d.data || []); setLoading('') })
      .catch(() => setLoading(''))
  }, [selectedState, isIndia])

  // Fetch talukas when district changes (India only)
  useEffect(() => {
    if (!isIndia || !selectedState || !selectedDistrict) { setTalukas([]); return }
    setLoading('talukas')
    fetch(`/api/locations?type=talukas&country=IN&state=${selectedState}&district=${selectedDistrict}`)
      .then(r => r.json())
      .then(d => { setTalukas(d.data || []); setLoading('') })
      .catch(() => setLoading(''))
  }, [selectedDistrict, selectedState, isIndia])

  // Fetch cities when taluka changes (India) or state changes (non-India)
  useEffect(() => {
    if (isIndia) {
      if (!selectedState || !selectedDistrict || !selectedTaluka) { setCities([]); return }
      setLoading('cities')
      fetch(`/api/locations?type=cities&country=IN&state=${selectedState}&district=${selectedDistrict}&taluka=${selectedTaluka}`)
        .then(r => r.json())
        .then(d => { setCities(d.data || []); setLoading('') })
        .catch(() => setLoading(''))
    } else {
      if (!selectedCountry || !selectedState) { setCities([]); return }
      setLoading('cities')
      fetch(`/api/locations?type=cities&country=${selectedCountry}&state=${selectedState}`)
        .then(r => r.json())
        .then(d => { setCities(d.data || []); setLoading('') })
        .catch(() => setLoading(''))
    }
  }, [selectedTaluka, selectedState, selectedDistrict, selectedCountry, isIndia])

  // Pincode auto-fill (India only)
  const handlePincodeChange = useCallback(async (code: string) => {
    setPincode(code)
    if (code.length === 6 && isIndia) {
      setLoading('pincode')
      try {
        const res = await fetch(`/api/locations?type=pincode&pincode=${code}`)
        const data = await res.json()
        if (data.success && data.data) {
          const { city, taluka, district, state } = data.data
          setSelectedState(state)
          // Wait for districts to load, then set district
          setTimeout(() => {
            const indiaData = districts // will use the fetched data
            setSelectedDistrict(district)
            setTimeout(() => {
              setSelectedTaluka(taluka)
              setSelectedCity(city)
            }, 100)
          }, 100)
        }
      } catch {} finally {
        setLoading('')
      }
    }
  }, [isIndia, districts])

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (query.length < 2) { setSearchResults([]); return }
    
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const country = selectedCountry || 'IN'
        const res = await fetch(`/api/locations?type=search&search=${encodeURIComponent(query)}&country=${country}`)
        const data = await res.json()
        setSearchResults(data.data || [])
      } catch {} finally {
        setSearchLoading(false)
      }
    }, 300)
  }, [selectedCountry])

  const selectSearchResult = (result: any) => {
    setSelectedState(result.stateCode)
    setSelectedDistrict(result.districtCode)
    setSelectedTaluka(result.talukaCode)
    setSelectedCity(result.city)
    setSearchMode(false)
    setSearchQuery('')
    setSearchResults([])
    emitChange(result.city, result.stateCode, result.districtCode, result.talukaCode)
  }

  // Emit change to parent
  const emitChange = useCallback((city?: string, stCode?: string, distCode?: string, talCode?: string) => {
    const countryObj = countries.find(c => c.code === selectedCountry)
    const stateObj = states.find(s => s.code === (stCode || selectedState))
    const districtObj = districts.find(d => d.code === (distCode || selectedDistrict))
    const talukaObj = talukas.find(t => t.code === (talCode || selectedTaluka))

    onChange({
      country: countryObj?.name || '',
      countryCode: selectedCountry,
      state: stateObj?.name || '',
      stateCode: stCode || selectedState,
      district: districtObj?.name || '',
      districtCode: distCode || selectedDistrict,
      taluka: talukaObj?.name || '',
      talukaCode: talCode || selectedTaluka,
      city: city || selectedCity,
      pincode,
    })
  }, [countries, states, districts, talukas, selectedCountry, selectedState, selectedDistrict, selectedTaluka, selectedCity, pincode, onChange])

  // Emit on city selection
  useEffect(() => {
    if (selectedCity) {
      emitChange(selectedCity)
    }
  }, [selectedCity]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectClass = "w-full px-3 py-2.5 bg-white/[0.03] border border-purple-500/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/30 appearance-none cursor-pointer"
  const labelClass = "text-xs text-purple-200/60 mb-1.5 block"

  return (
    <div className="space-y-4">
      {/* Search Toggle */}
      {isIndia && (
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setSearchMode(!searchMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              searchMode ? 'bg-purple-600/30 text-white border border-purple-500/30' : 'bg-white/[0.03] text-purple-300/60 border border-purple-500/10 hover:text-white'
            }`}
          >
            <Search className="h-3 w-3" /> Quick Search
          </button>
          {showPincode && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-purple-300/40">or</span>
              <div className="relative flex-1 max-w-[160px]">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={e => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-purple-500/10 rounded-lg text-white text-xs placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/30"
                />
                {loading === 'pincode' && <Loader2 className="absolute right-2 top-1.5 h-3 w-3 text-purple-400 animate-spin" />}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Mode */}
      {searchMode && isIndia && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/40" />
          <input
            type="text"
            placeholder="Search city, town, or village..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-purple-500/10 rounded-xl text-white text-sm placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/30"
            autoFocus
          />
          {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 animate-spin" />}
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a0a2e] border border-purple-500/20 rounded-xl max-h-60 overflow-y-auto z-50 shadow-xl">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSearchResult(r)}
                  className="w-full text-left px-4 py-3 hover:bg-purple-500/10 border-b border-purple-500/5 last:border-0 transition-colors"
                >
                  <p className="text-sm text-white font-medium">{r.city}</p>
                  <p className="text-[10px] text-purple-300/50">{r.taluka} → {r.district} → {r.state}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dropdown Mode */}
      {!searchMode && (
        <div className={compact ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
          {/* Country */}
          <div>
            <label className={labelClass}>Country</label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={e => {
                  setSelectedCountry(e.target.value)
                  setSelectedState('')
                  setSelectedDistrict('')
                  setSelectedTaluka('')
                  setSelectedCity('')
                }}
                className={selectClass}
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/40 pointer-events-none" />
            </div>
          </div>

          {/* State */}
          <div>
            <label className={labelClass}>State / Province</label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={e => {
                  setSelectedState(e.target.value)
                  setSelectedDistrict('')
                  setSelectedTaluka('')
                  setSelectedCity('')
                }}
                className={selectClass}
                disabled={!selectedCountry || loading === 'states'}
              >
                <option value="">Select State</option>
                {states.map(s => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/40 pointer-events-none" />
              {loading === 'states' && <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-3 w-3 text-purple-400 animate-spin" />}
            </div>
          </div>

          {/* District (India only) */}
          {isIndia && (
            <div>
              <label className={labelClass}>District</label>
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={e => {
                    setSelectedDistrict(e.target.value)
                    setSelectedTaluka('')
                    setSelectedCity('')
                  }}
                  className={selectClass}
                  disabled={!selectedState || loading === 'districts'}
                >
                  <option value="">Select District</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/40 pointer-events-none" />
                {loading === 'districts' && <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-3 w-3 text-purple-400 animate-spin" />}
              </div>
            </div>
          )}

          {/* Taluka (India only) */}
          {isIndia && (
            <div>
              <label className={labelClass}>Taluka / Tehsil</label>
              <div className="relative">
                <select
                  value={selectedTaluka}
                  onChange={e => {
                    setSelectedTaluka(e.target.value)
                    setSelectedCity('')
                  }}
                  className={selectClass}
                  disabled={!selectedDistrict || loading === 'talukas'}
                >
                  <option value="">Select Taluka</option>
                  {talukas.map(t => (
                    <option key={t.code} value={t.code}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/40 pointer-events-none" />
                {loading === 'talukas' && <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-3 w-3 text-purple-400 animate-spin" />}
              </div>
            </div>
          )}

          {/* City */}
          <div>
            <label className={labelClass}>City / Town</label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className={selectClass}
                disabled={cities.length === 0 || loading === 'cities'}
              >
                <option value="">Select City</option>
                {cities.map((c, i) => (
                  <option key={i} value={c.name}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/40 pointer-events-none" />
              {loading === 'cities' && <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-3 w-3 text-purple-400 animate-spin" />}
            </div>
          </div>
        </div>
      )}

      {/* Selected Location Display */}
      {selectedCity && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/5 border border-green-500/20 rounded-xl">
          <MapPin className="h-4 w-4 text-green-400 shrink-0" />
          <p className="text-xs text-green-300 truncate">
            {selectedCity}
            {isIndia && selectedTaluka && `, ${talukas.find(t => t.code === selectedTaluka)?.name || ''}`}
            {isIndia && selectedDistrict && `, ${districts.find(d => d.code === selectedDistrict)?.name || ''}`}
            {selectedState && `, ${states.find(s => s.code === selectedState)?.name || ''}`}
            {selectedCountry && selectedCountry !== 'IN' && `, ${countries.find(c => c.code === selectedCountry)?.name || ''}`}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCity('')
              setSelectedTaluka('')
              setSelectedDistrict('')
              setSelectedState('')
            }}
            className="ml-auto text-green-400/50 hover:text-green-400"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
