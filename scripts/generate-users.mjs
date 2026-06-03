import { readFileSync, writeFileSync } from 'fs'
import { createHash } from 'crypto'

// bcrypt hash of "Test@123" (pre-computed)
const PASSWORD_HASH = '$2a$10$UECcKMABBCQrmtw8XVT87edj2DEq8HX70eLT7uoLIpfmA99ieie4K'

const MALE_NAMES = [
  'Aarav Shah','Arjun Mehta','Vivek Sharma','Rohit Patil','Karthik Nair',
  'Nikhil Joshi','Aditya Gupta','Vikram Yadav','Ravi Kumar','Sanjay Desai',
  'Suresh Iyer','Pranav Malhotra','Akash Verma','Deepak Pillai','Manish Reddy',
  'Gaurav Kapoor','Tarun Bhat','Varun Singh','Harsh Pandey','Piyush Chaudhary',
  'Ankit Tiwari','Kunal Saxena','Rajesh Thakur','Amol Kulkarni','Nitin Jain',
  'Shivam Mishra','Abhishek Das','Sourav Ghosh','Arun Naik','Rahul Shetty',
  'Yash Pawar','Neeraj Dubey','Sumit Bhatt','Kartik More','Sandesh Rane',
  'Devraj Nath','Swapnil Wagle','Paresh Bendre','Omkar Salunkhe','Tushar Shirke',
  'Mayur Phule','Sachin Mane','Satyam Jadhav','Vishal Powar','Rakesh Gavhane',
  'Kiran Lokhande','Milind Thite','Girish Bhosale','Dattatray Gaikwad','Sudhir Shinde',
  'Bharat Patil','Hemant Sawant','Mangesh Khot','Nilesh Kale','Prasad Kulkarni',
  'Vijay Jagtap','Ajit Kadam','Santosh Pawar','Dhananjay More','Yogesh Sutar',
  'Rohan Nadar','Shivaji Thorat','Manoj Khade','Sudhakar Pol','Dnyaneshwar Bagal',
  'Pratik Bhor','Rushikesh Doke','Sanket Gawai','Harshal Shende','Abhijit Tupe',
  'Kapil Kamble','Mahesh Waghmode','Rupesh Hadap','Onkar Mhase','Sunil Bachhav',
  'Ramesh Jadhav','Ganesh Chavan','Dinesh Mulik','Umesh Bobade','Satish Kharat',
  'Balasaheb Dalvi','Vitthal Pawar','Pandurang Shinde','Atmaram Borate','Laxman Mhatre',
  'Rajendra Bandgar','Ravindra Karpe','Vasant Gonde','Madhukar Takale','Narendra Pokharkar',
  'Vinod Bodke','Kashinath Bhosle','Haribhau Kumbhar','Vishwanath Salve','Tryambak Sanas',
  'Bhausaheb Kale','Namdev Wagh','Maruti Holkar','Dashrath Nikam','Bapu Shelke'
]

const FEMALE_NAMES = [
  'Priya Nair','Sneha Desai','Pooja Iyer','Divya Menon','Ananya Sharma',
  'Kavya Reddy','Meera Krishnan','Deepa Pillai','Lakshmi Subramaniam','Anjali Patel',
  'Ritu Gupta','Sunita Yadav','Shweta Verma','Nisha Malhotra','Preeti Kapoor',
  'Ankita Singh','Swati Mishra','Pooja Saxena','Radhika Bhatt','Nidhi Tiwari',
  'Sonal Jain','Komal Pandey','Tanvi Chaudhary','Riya Sharma','Preethi Suresh',
  'Amruta Kulkarni','Smita Patil','Ashwini Jadhav','Neha Shinde','Vaishali More',
  'Manasi Kale','Pradnya Pawar','Rutuja Bhosale','Shruti Sawant','Pallavi Lokhande',
  'Dipali Thite','Madhuri Gaikwad','Chhaya Waghmode','Archana Kamble','Pratiksha Mhase',
  'Vandana Doke','Sarika Hadap','Swapna Bobade','Rupali Kharat','Sunanda Mulik',
  'Leena Salve','Usha Shende','Rohini Tupe','Rashmi Bhor','Sangita Gawai',
  'Meena Kadam','Sushama Thorat','Jyoti Pol','Rekha Bagal','Sulabha Shirke',
  'Nanda Wagle','Shobha Bendre','Geeta Salunkhe','Ujwala Rane','Pratima Nadar',
  'Sadhana Phule','Kalyani Mane','Lata Gavhane','Sudha Powar','Vanmala Sutar',
  'Ratna Jagtap','Bhagyashree Khade','Shantabai Holkar','Nirmala Dalvi','Shalini Bachhav',
  'Alka Chavan','Suvarna Bandgar','Varada Karpe','Padmaja Gonde','Jayashree Takale',
  'Bharati Pokharkar','Archana Bodke','Mangala Bhosle','Anita Kumbhar','Sunita Wagh',
  'Durga Nikam','Tara Shelke','Manda Borate','Indira Mhatre','Vimal Sanas',
  'Savita Kale','Pramila Naik','Sharada Shetty','Vinaya Pawar','Nandita Das',
  'Monali Ghosh','Asmita Banerjee','Komal Mehta','Tanmayee Shah','Riddhi Joshi',
  'Trushna Thakur','Gauri Pandya','Varsha Bakshi','Himani Sethi','Pallavi Bhat'
]

const CITIES_MH = [
  {city:'Mumbai',lat:19.0760,lng:72.8777},
  {city:'Pune',lat:18.5204,lng:73.8567},
  {city:'Nagpur',lat:21.1458,lng:79.0882},
  {city:'Nashik',lat:19.9975,lng:73.7898},
  {city:'Aurangabad',lat:19.8762,lng:75.3433},
  {city:'Solapur',lat:17.6599,lng:75.9064},
  {city:'Kolhapur',lat:16.7050,lng:74.2433},
  {city:'Sangli',lat:16.8524,lng:74.5815},
  {city:'Satara',lat:17.6805,lng:74.0183},
  {city:'Amravati',lat:20.9374,lng:77.7796},
  {city:'Latur',lat:18.4088,lng:76.5604},
  {city:'Nanded',lat:19.1383,lng:77.3210},
  {city:'Akola',lat:20.7002,lng:77.0082},
  {city:'Jalgaon',lat:21.0077,lng:75.5626},
  {city:'Dhule',lat:20.9013,lng:74.7749},
  {city:'Ahmednagar',lat:19.0948,lng:74.7480},
  {city:'Ratnagiri',lat:16.9902,lng:73.3120},
  {city:'Sindhudurg',lat:16.3498,lng:73.5568},
  {city:'Beed',lat:18.9890,lng:75.7601},
  {city:'Osmanabad',lat:18.1860,lng:76.0413}
]

const OTHER_CITIES = [
  {city:'Delhi',state:'Delhi'},{city:'Bangalore',state:'Karnataka'},
  {city:'Hyderabad',state:'Telangana'},{city:'Chennai',state:'Tamil Nadu'},
  {city:'Kolkata',state:'West Bengal'},{city:'Ahmedabad',state:'Gujarat'},
  {city:'Surat',state:'Gujarat'},{city:'Jaipur',state:'Rajasthan'},
  {city:'Lucknow',state:'Uttar Pradesh'},{city:'Chandigarh',state:'Punjab'}
]

const RELIGIONS = ['Hindu','Hindu','Hindu','Hindu','Hindu','Muslim','Christian','Buddhist','Jain','Sikh']

const CASTES_BY_RELIGION = {
  Hindu: ['Brahmin','Maratha','Mali','Lingayat','Rajput','Yadav','Kayastha','Vaishya','Khatri','Bania','Patel','Nair','Iyer','Iyengar','Reddy','Pillai','Naidu'],
  Muslim: ['Sunni','Shia','Sayed','Sheikh','Pathan','Mughal','Ansari'],
  Christian: ['Roman Catholic','Protestant','Orthodox'],
  Buddhist: ['Mahar','Neo-Buddhist','Theravada'],
  Jain: ['Digambar','Shwetambar','Oswal'],
  Sikh: ['Jat Sikh','Khatri','Arora','Ramgarhia']
}

const MOTHER_TONGUES = ['Marathi','Hindi','Gujarati','Telugu','Tamil','Kannada','Malayalam','Punjabi','Bengali','Urdu']

const HEIGHTS_M = ["5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\""]
const HEIGHTS_F = ["4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\""]

const EDUCATIONS = ['B.Tech','B.E.','B.Sc','B.Com','BBA','B.A.','M.Tech','MBA','M.Sc','M.Com','MBBS','MD','LLB','CA','B.Pharm','MCA','BCA','Diploma']
const OCCUPATIONS = ['Software Engineer','Doctor','Teacher','Business Analyst','Manager','Chartered Accountant','Civil Engineer','Mechanical Engineer','Nurse','Architect','Lawyer','Pharmacist','Data Scientist','Product Manager','Marketing Executive','HR Manager','Finance Analyst','Government Employee','Self-Employed','Entrepreneur']
const INCOMES = ['5-8 LPA','8-12 LPA','12-15 LPA','15-20 LPA','20-25 LPA','25-30 LPA','30+ LPA','1-5 LPA','Not Disclosed']
const DIETS = ['Vegetarian','Non-Vegetarian','Vegan','Eggetarian']
const MARITAL = ['Never Married','Never Married','Never Married','Never Married','Divorced','Widowed']
const HOBBIES_POOL = ['Reading','Traveling','Cooking','Yoga','Photography','Cricket','Badminton','Swimming','Dancing','Music','Movies','Trekking','Gardening','Painting','Gaming','Cycling','Gym','Football','Chess','Meditation']
const FAMILY_TYPES = ['Nuclear','Joint','Extended']
const FAMILY_STATUS = ['Middle Class','Upper Middle Class','Upper Class','Lower Middle Class']
const FAMILY_INCOMES = ['₹5-10 Lakhs','₹10-15 Lakhs','₹15-20 Lakhs','₹20-25 Lakhs','₹25-30 Lakhs','₹30+ Lakhs']
const FATHER_JOBS = ['Businessman','Retired (Govt. Officer)','Farmer','Teacher','Engineer','Doctor','Lawyer','Shopkeeper','Contractor','Manager','Professor','Police Officer']
const MOTHER_JOBS = ['Homemaker','Teacher','Nurse','Business','Retired','Social Worker','Homemaker','Homemaker']
const SIBLINGS = ['1 Brother (Married)','1 Sister (Married)','2 Brothers','2 Sisters','1 Brother 1 Sister','Only Child','2 Brothers 1 Sister','1 Brother 2 Sisters']
const PREMIUM_PLANS = [null, null, 'silver', 'silver', 'gold', 'gold', 'gold', 'diamond']

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, n)
}

function getAge(dob) {
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function randomDOB(minAge, maxAge) {
  const year = 2026 - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function generateAbout(name, occupation, city, hobbies) {
  const templates = [
    `${name.split(' ')[0]} is a ${occupation} based in ${city}. Passionate about ${hobbies[0].toLowerCase()} and ${hobbies[1].toLowerCase()}. Looking for a life partner who shares similar values and interests.`,
    `Working as a ${occupation} in ${city}. I enjoy ${hobbies[0].toLowerCase()}, ${hobbies[1].toLowerCase()}, and ${hobbies[2].toLowerCase()} in my free time. Family-oriented with modern outlook on life.`,
    `A dedicated ${occupation} who believes in balancing career and family life. Loves ${hobbies[0].toLowerCase()} and ${hobbies[1].toLowerCase()}. Looking for someone kind, caring, and ambitious.`,
    `${occupation} by profession, ${hobbies[0].toLowerCase()} enthusiast by passion. Based in beautiful ${city}. Seek a partner who values both tradition and modernity.`,
  ]
  return pick(templates)
}

function generatePhoto(gender, id) {
  // Use public domain avatar services
  const seed = id * 7 + (gender === 'Male' ? 0 : 1000)
  const services = [
    `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4`,
    `https://randomuser.me/api/portraits/${gender === 'Male' ? 'men' : 'women'}/${(id % 99) + 1}.jpg`,
  ]
  return services[1]
}

const existingUsers = JSON.parse(readFileSync('/Users/aakashbirhade/ppsky4/data/users.json', 'utf-8'))
const startId = existingUsers.length + 1

const newUsers = []

for (let i = 0; i < 200; i++) {
  const isMale = i < 100
  const gender = isMale ? 'Male' : 'Female'
  const name = isMale ? MALE_NAMES[i] : FEMALE_NAMES[i - 100]
  const id = String(startId + i)

  const dob = isMale ? randomDOB(24, 38) : randomDOB(21, 33)
  const age = getAge(dob)
  const religion = pick(RELIGIONS)
  const castes = CASTES_BY_RELIGION[religion] || ['General']
  const caste = pick(castes)

  // 80% Maharashtra, 20% other states
  let city, state
  if (Math.random() < 0.8) {
    const loc = pick(CITIES_MH)
    city = loc.city
    state = 'Maharashtra'
  } else {
    const loc = pick(OTHER_CITIES)
    city = loc.city
    state = loc.state
  }

  const education = pick(EDUCATIONS)
  const occupation = pick(OCCUPATIONS)
  const income = pick(INCOMES)
  const hobbies = pickN(HOBBIES_POOL, Math.floor(Math.random() * 3) + 3)
  const diet = pick(DIETS)
  const maritalStatus = pick(MARITAL)
  const premiumPlan = pick(PREMIUM_PLANS)
  const premium = premiumPlan !== null
  const premiumExpiry = premium ? `2026-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}` : null

  const daysAgo = Math.floor(Math.random() * 30)
  const lastActive = new Date(Date.now() - daysAgo * 86400000).toISOString()
  const createdDaysAgo = Math.floor(Math.random() * 365) + 30
  const createdAt = new Date(Date.now() - createdDaysAgo * 86400000).toISOString().split('T')[0]

  const partnerAgeMin = isMale ? age - 6 : age + 1
  const partnerAgeMax = isMale ? age + 2 : age + 10

  newUsers.push({
    id,
    name,
    email: `${name.toLowerCase().replace(/ /g, '.')}${id}@soulmate.com`,
    password: PASSWORD_HASH,
    phone: `+91 ${Math.floor(Math.random()*9000000000)+1000000000}`,
    gender,
    dateOfBirth: dob,
    age,
    religion,
    caste,
    motherTongue: pick(MOTHER_TONGUES),
    height: isMale ? pick(HEIGHTS_M) : pick(HEIGHTS_F),
    education,
    occupation,
    income,
    city,
    state,
    country: 'India',
    about: generateAbout(name, occupation, city, hobbies),
    maritalStatus,
    diet,
    hobbies,
    familyDetails: {
      father: pick(FATHER_JOBS),
      mother: pick(MOTHER_JOBS),
      siblings: pick(SIBLINGS),
      familyType: pick(FAMILY_TYPES),
      familyStatus: pick(FAMILY_STATUS),
      familyIncome: pick(FAMILY_INCOMES)
    },
    partnerPreferences: {
      ageMin: Math.max(18, partnerAgeMin),
      ageMax: Math.min(50, partnerAgeMax),
      heightMin: isMale ? "5'2\"" : "5'7\"",
      heightMax: isMale ? "5'7\"" : "6'1\"",
      religion,
      education: 'Graduate+',
      occupation: 'Any Professional',
      city: `${city}/Any Metro`
    },
    photos: [generatePhoto(gender, parseInt(id))],
    verified: Math.random() > 0.3,
    premium,
    premiumPlan,
    premiumExpiry,
    createdAt,
    lastActive,
    profileComplete: true,
    online: Math.random() > 0.7
  })
}

const allUsers = [...existingUsers, ...newUsers]
writeFileSync('/Users/aakashbirhade/ppsky4/data/users.json', JSON.stringify(allUsers, null, 2))
console.log(`✅ Done! Total users: ${allUsers.length} (${existingUsers.length} existing + ${newUsers.length} new)`)
