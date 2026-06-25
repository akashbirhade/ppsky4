/**
 * Biodata Extractor - Parses text from biodata documents (PDF/images)
 * and extracts profile fields using pattern matching
 */

export interface ExtractedProfile {
  firstName?: string
  lastName?: string
  religion?: string
  caste?: string
  motherTongue?: string
  height?: string
  education?: string
  occupation?: string
  income?: string
  city?: string
  state?: string
  country?: string
  about?: string
  dateOfBirth?: string
  age?: string
  maritalStatus?: string
  gender?: string
  hobbies?: string
  familyType?: string
  fatherOccupation?: string
  motherOccupation?: string
  siblings?: string
}

const RELIGIONS = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Buddhist', 'Parsi']
const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Gujarati', 'Punjabi', 'Bengali', 'Malayalam', 'Urdu', 'Odia', 'Assamese', 'Konkani', 'Sanskrit']
const EDUCATIONS = ["B.Tech", "B.E", "M.Tech", "MBA", "MBBS", "MD", "CA", "PhD", "Bachelor", "Master", "B.Sc", "M.Sc", "B.Com", "M.Com", "BBA", "LLB", "LLM", "B.Arch", "MCA", "BCA"]
const MARITAL_STATUS = ['Never Married', 'Unmarried', 'Single', 'Divorced', 'Widowed', 'Separated', 'Annulled']
const INDIAN_STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'West Bengal', 'Madhya Pradesh', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Punjab', 'Haryana', 'Bihar', 'Odisha', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh', 'Goa', 'Delhi', 'Assam']

function extractField(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  return undefined
}

function findInList(text: string, list: string[]): string | undefined {
  const lowerText = text.toLowerCase()
  for (const item of list) {
    if (lowerText.includes(item.toLowerCase())) {
      return item
    }
  }
  return undefined
}

export function extractProfileFromText(text: string): ExtractedProfile {
  const profile: ExtractedProfile = {}

  // Name extraction
  const namePatterns = [
    /(?:name|full\s*name)\s*[:\-–]\s*([A-Za-z\s]+?)(?:\n|$|,)/i,
    /(?:candidate|bride|groom)\s*(?:name)?\s*[:\-–]\s*([A-Za-z\s]+?)(?:\n|$|,)/i,
  ]
  const fullName = extractField(text, namePatterns)
  if (fullName) {
    const parts = fullName.trim().split(/\s+/)
    profile.firstName = parts[0]
    profile.lastName = parts.slice(1).join(' ')
  }

  // Religion
  profile.religion = findInList(text, RELIGIONS)

  // Caste
  const castePatterns = [
    /(?:caste|jati|sub[\s-]?caste)\s*[:\-–]\s*([A-Za-z\s]+?)(?:\n|$|,|;)/i,
    /(?:gotra|gothra)\s*[:\-–]\s*([A-Za-z\s]+?)(?:\n|$|,|;)/i,
  ]
  profile.caste = extractField(text, castePatterns)

  // Mother Tongue
  const mtPatterns = [
    /(?:mother\s*tongue|language|native\s*language)\s*[:\-–]\s*([A-Za-z\s]+?)(?:\n|$|,|;)/i,
  ]
  profile.motherTongue = extractField(text, mtPatterns) || findInList(text, LANGUAGES)

  // Height
  const heightPatterns = [
    /(?:height)\s*[:\-–]\s*([\d]'[\d]+"?|[\d]\s*(?:ft|feet)\s*[\d]*\s*(?:in|inch|inches)?)/i,
    /(?:height)\s*[:\-–]\s*([\d]+\s*cm)/i,
    /([\d]'[\d]+")/,
  ]
  profile.height = extractField(text, heightPatterns)

  // Education
  const eduPatterns = [
    /(?:education|qualification|degree)\s*[:\-–]\s*(.+?)(?:\n|$|;)/i,
  ]
  profile.education = extractField(text, eduPatterns) || findInList(text, EDUCATIONS)

  // Occupation
  const occPatterns = [
    /(?:occupation|profession|job|designation|working\s*as|employed\s*(?:as|at|in))\s*[:\-–]\s*(.+?)(?:\n|$|;)/i,
    /(?:company|employer|organization)\s*[:\-–]\s*(.+?)(?:\n|$|;)/i,
  ]
  profile.occupation = extractField(text, occPatterns)

  // Income
  const incomePatterns = [
    /(?:income|salary|annual\s*income|package|ctc)\s*[:\-–]\s*(.+?)(?:\n|$|;)/i,
    /(\d+[\s-]*(?:lpa|lakhs?|lakh|crore))/i,
  ]
  profile.income = extractField(text, incomePatterns)

  // Location
  const cityPatterns = [
    /(?:city|current\s*city|residing\s*(?:in|at)|location|place)\s*[:\-–]\s*([A-Za-z\s]+?)(?:\n|$|,|;)/i,
  ]
  profile.city = extractField(text, cityPatterns)

  // State
  profile.state = findInList(text, INDIAN_STATES)

  // Country
  const countryPatterns = [
    /(?:country|nationality)\s*[:\-–]\s*([A-Za-z\s]+?)(?:\n|$|,|;)/i,
  ]
  profile.country = extractField(text, countryPatterns) || 'India'

  // Date of Birth / Age
  const dobPatterns = [
    /(?:date\s*of\s*birth|dob|born\s*on|birth\s*date)\s*[:\-–]\s*(\d{1,2}[\s/\-\.]\w+[\s/\-\.]\d{2,4})/i,
    /(?:date\s*of\s*birth|dob|born\s*on|birth\s*date)\s*[:\-–]\s*(\d{1,2}[\s/\-\.]\d{1,2}[\s/\-\.]\d{2,4})/i,
  ]
  profile.dateOfBirth = extractField(text, dobPatterns)

  const agePatterns = [
    /(?:age)\s*[:\-–]\s*(\d{1,2})\s*(?:years?|yrs?)?/i,
    /(\d{2})\s*(?:years?\s*old|yrs?\s*old)/i,
  ]
  profile.age = extractField(text, agePatterns)

  // Marital Status
  profile.maritalStatus = findInList(text, MARITAL_STATUS)

  // Gender
  const genderMatch = text.match(/(?:gender|sex)\s*[:\-–]\s*(male|female|other)/i)
  if (genderMatch) {
    profile.gender = genderMatch[1]
  } else if (/\b(?:groom|boy|bachelor|son)\b/i.test(text)) {
    profile.gender = 'Male'
  } else if (/\b(?:bride|girl|daughter)\b/i.test(text)) {
    profile.gender = 'Female'
  }

  // About / Bio
  const aboutPatterns = [
    /(?:about\s*(?:me|myself|him|her|candidate)|introduction|bio|description)\s*[:\-–]\s*(.+?)(?:\n\n|$)/i,
  ]
  profile.about = extractField(text, aboutPatterns)

  // Hobbies
  const hobbyPatterns = [
    /(?:hobbies|interests|hobby)\s*[:\-–]\s*(.+?)(?:\n|$)/i,
  ]
  profile.hobbies = extractField(text, hobbyPatterns)

  // Family
  const familyTypePatterns = [
    /(?:family\s*type|family)\s*[:\-–]\s*(joint|nuclear|extended)/i,
  ]
  profile.familyType = extractField(text, familyTypePatterns)

  const fatherPatterns = [
    /(?:father'?s?\s*(?:occupation|profession|job|name))\s*[:\-–]\s*(.+?)(?:\n|$|;)/i,
  ]
  profile.fatherOccupation = extractField(text, fatherPatterns)

  const motherPatterns = [
    /(?:mother'?s?\s*(?:occupation|profession|job|name))\s*[:\-–]\s*(.+?)(?:\n|$|;)/i,
  ]
  profile.motherOccupation = extractField(text, motherPatterns)

  const siblingPatterns = [
    /(?:siblings?|brothers?\s*(?:&|and)\s*sisters?)\s*[:\-–]\s*(.+?)(?:\n|$|;)/i,
  ]
  profile.siblings = extractField(text, siblingPatterns)

  return profile
}
