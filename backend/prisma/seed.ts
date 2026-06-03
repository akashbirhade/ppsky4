/**
 * Soulmate Sync — Database Seed Script
 * Generates 100 Groom Profiles + 100 Bride Profiles
 * All from Maharashtra with realistic data
 */

import { PrismaClient, Gender, MaritalStatus, SubscriptionPlan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── MAHARASHTRA LOCATIONS ────────────────────────────────────────────────────

const LOCATIONS = [
  { city: 'Mumbai', district: 'Mumbai City', lat: 19.0760, lng: 72.8777 },
  { city: 'Pune', district: 'Pune', lat: 18.5204, lng: 73.8567 },
  { city: 'Nashik', district: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { city: 'Nagpur', district: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { city: 'Kolhapur', district: 'Kolhapur', lat: 16.7050, lng: 74.2433 },
  { city: 'Aurangabad', district: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
  { city: 'Solapur', district: 'Solapur', lat: 17.6864, lng: 75.9064 },
  { city: 'Sangli', district: 'Sangli', lat: 16.8524, lng: 74.5815 },
  { city: 'Satara', district: 'Satara', lat: 17.6805, lng: 74.0183 },
  { city: 'Ahmednagar', district: 'Ahmednagar', lat: 19.0948, lng: 74.7480 },
  { city: 'Thane', district: 'Thane', lat: 19.2183, lng: 72.9781 },
  { city: 'Kalyan', district: 'Thane', lat: 19.2437, lng: 73.1355 },
  { city: 'Navi Mumbai', district: 'Thane', lat: 19.0330, lng: 73.0297 },
  { city: 'Jalgaon', district: 'Jalgaon', lat: 21.0077, lng: 75.5626 },
  { city: 'Ratnagiri', district: 'Ratnagiri', lat: 16.9902, lng: 73.3120 },
  { city: 'Sindhudurg', district: 'Sindhudurg', lat: 16.3400, lng: 73.6400 },
  { city: 'Latur', district: 'Latur', lat: 18.4088, lng: 76.5604 },
  { city: 'Nanded', district: 'Nanded', lat: 19.1383, lng: 77.3210 },
  { city: 'Amravati', district: 'Amravati', lat: 20.9320, lng: 77.7523 },
  { city: 'Akola', district: 'Akola', lat: 20.7002, lng: 77.0082 },
];

// ─── NAMES ────────────────────────────────────────────────────────────────────

const MALE_NAMES = [
  'Rajesh', 'Suresh', 'Mahesh', 'Ganesh', 'Dinesh', 'Ramesh', 'Nilesh', 'Hitesh',
  'Vikas', 'Amol', 'Sachin', 'Sunil', 'Pravin', 'Sandeep', 'Rohit', 'Amit',
  'Ajay', 'Vijay', 'Sanjay', 'Anil', 'Prashant', 'Nitin', 'Abhijit', 'Vaibhav',
  'Swapnil', 'Ravi', 'Kiran', 'Pramod', 'Devendra', 'Santosh', 'Vivek', 'Ashish',
  'Vinay', 'Ankur', 'Akash', 'Tushar', 'Mayur', 'Pratik', 'Shriram', 'Yogesh',
  'Deepak', 'Hemant', 'Sarang', 'Kedar', 'Omkar', 'Atharva', 'Yash', 'Siddhesh',
  'Gaurav', 'Mangesh', 'Tejas', 'Rushikesh', 'Soham', 'Pranav', 'Vedant', 'Harsh',
  'Parth', 'Rohan', 'Aniket', 'Kartik', 'Shreyas', 'Vikram', 'Mandar', 'Chinmay',
  'Hrishikesh', 'Arjun', 'Siddharth', 'Sahil', 'Chirag', 'Nikhil', 'Sumit', 'Rahul',
  'Rajan', 'Subhash', 'Mukesh', 'Suhas', 'Dilip', 'Girish', 'Harish', 'Ravindra',
  'Balaji', 'Makarand', 'Chandrashekhar', 'Dattatray', 'Madhav', 'Kapil', 'Shubham',
  'Lokesh', 'Bhushan', 'Chetan', 'Dhananjay', 'Kaustubh', 'Pankaj', 'Shekhar',
  'Avinash', 'Dhiraj', 'Saurabh', 'Vivekanand', 'Omkar', 'Pradeep', 'Santosh',
];

const FEMALE_NAMES = [
  'Priya', 'Pooja', 'Kavita', 'Swati', 'Sneha', 'Seema', 'Sunita', 'Meena',
  'Anita', 'Asha', 'Pallavi', 'Manisha', 'Dipali', 'Madhuri', 'Amruta', 'Vrushali',
  'Reshma', 'Archana', 'Sarita', 'Rekha', 'Vidya', 'Vasudha', 'Chitra', 'Smita',
  'Shubhangi', 'Pradnya', 'Rutuja', 'Sayali', 'Neha', 'Aishwarya', 'Mrunali', 'Aparna',
  'Radhika', 'Tanuja', 'Poonam', 'Nisha', 'Supriya', 'Rohini', 'Chetna', 'Varsha',
  'Revati', 'Shital', 'Gayatri', 'Yamini', 'Kanchan', 'Sushma', 'Jyoti', 'Shilpa',
  'Namrata', 'Komal', 'Ritu', 'Sonal', 'Minal', 'Divya', 'Isha', 'Anjali',
  'Prachi', 'Sonali', 'Ujwala', 'Sangeeta', 'Nandini', 'Chandana', 'Padmini', 'Sharmila',
  'Bharati', 'Shweta', 'Ashwini', 'Nilima', 'Shruti', 'Shalini', 'Usha', 'Malati',
  'Manjiri', 'Sadhana', 'Vaishali', 'Leena', 'Hemangi', 'Mugdha', 'Tejashri', 'Rupali',
  'Prajakta', 'Nikita', 'Ankita', 'Aditi', 'Rucha', 'Gauri', 'Shraddha', 'Sampada',
  'Meenal', 'Rajashri', 'Kasturi', 'Devyani', 'Vaishnavi', 'Tanvi', 'Akanksha',
  'Aparajita', 'Bhavana', 'Chandrika', 'Dharitri', 'Ekta',
];

const LAST_NAMES = [
  'Patil', 'Jadhav', 'Shinde', 'Deshmukh', 'Kulkarni', 'Bhosale', 'More', 'Pawar',
  'Kadam', 'Gaikwad', 'Tupe', 'Sawant', 'Mane', 'Yadav', 'Shirke', 'Lokhande',
  'Wadekar', 'Pujari', 'Deshpande', 'Kumbhar', 'Joshi', 'Avhad', 'Salunke', 'Mohite',
  'Waghmare', 'Suryawanshi', 'Gavhane', 'Nikam', 'Chavan', 'Thorat',
];

// ─── RELIGION / CASTE / GOTHRA DATA ─────────────────────────────────────────

const RELIGION_CASTE_DATA = [
  { religion: 'Hindu', caste: 'Maratha', subCaste: 'Deshmukh', gothra: 'Kashyap', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Maratha', subCaste: 'Patil', gothra: 'Bharadwaj', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Maratha', subCaste: 'Shinde', gothra: 'Atri', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Brahmin', subCaste: 'Deshastha', gothra: 'Vishwamitra', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Brahmin', subCaste: 'Konkanastha', gothra: 'Vasishtha', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Brahmin', subCaste: 'CKP', gothra: 'Parashara', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Brahmin', subCaste: 'Saraswat', gothra: 'Agastya', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'CKP', subCaste: 'CKP', gothra: 'Garg', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Mali', subCaste: 'Mali', gothra: 'Sandilya', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Dhangar', subCaste: 'Dhangar', gothra: 'Kashyap', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Koli', subCaste: 'Koli', gothra: 'Bharadwaj', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Lingayat', subCaste: 'Veerashaiva', gothra: 'Atri', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Vaishya', subCaste: 'Maheshwari', gothra: 'Garg', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'Maratha', subCaste: 'Bhosale', gothra: 'Bharadwaj', motherTongue: 'Marathi' },
  { religion: 'Muslim', caste: 'Sunni', subCaste: 'Sheikh', gothra: '', motherTongue: 'Urdu' },
  { religion: 'Muslim', caste: 'Shia', subCaste: 'Syed', gothra: '', motherTongue: 'Urdu' },
  { religion: 'Christian', caste: 'Catholic', subCaste: 'Roman Catholic', gothra: '', motherTongue: 'Marathi' },
  { religion: 'Buddhist', caste: 'Neo-Buddhist', subCaste: 'Ambedkarite', gothra: '', motherTongue: 'Marathi' },
  { religion: 'Jain', caste: 'Digambar', subCaste: 'Digambar', gothra: 'Kashyap', motherTongue: 'Marathi' },
  { religion: 'Hindu', caste: 'SC/ST', subCaste: 'Mahar', gothra: 'Kashyap', motherTongue: 'Marathi' },
];

// ─── EDUCATION / PROFESSION / INCOME ────────────────────────────────────────

const MALE_EDUCATION_PROFESSION = [
  { education: 'B.Tech / B.E.', profession: 'Software Engineer', income: 1200000 },
  { education: 'B.Tech / B.E.', profession: 'IT Consultant', income: 1800000 },
  { education: 'M.Tech / M.E.', profession: 'Senior Software Engineer', income: 2200000 },
  { education: 'MBA', profession: 'Business Manager', income: 1500000 },
  { education: 'MBA', profession: 'Marketing Manager', income: 1400000 },
  { education: 'MBBS', profession: 'Doctor', income: 1800000 },
  { education: 'MD', profession: 'Senior Doctor', income: 3000000 },
  { education: 'CA', profession: 'Chartered Accountant', income: 1600000 },
  { education: 'LLB', profession: 'Advocate', income: 1000000 },
  { education: 'B.Com', profession: 'Accountant', income: 600000 },
  { education: 'B.Sc.', profession: 'Research Scientist', income: 900000 },
  { education: 'M.Sc.', profession: 'Data Scientist', income: 1400000 },
  { education: 'B.Tech / B.E.', profession: 'Civil Engineer', income: 900000 },
  { education: 'B.Tech / B.E.', profession: 'Mechanical Engineer', income: 800000 },
  { education: 'Graduate', profession: 'Government Employee', income: 700000 },
  { education: 'Graduate', profession: 'Bank Officer', income: 850000 },
  { education: 'B.Tech / B.E.', profession: 'Network Engineer', income: 1000000 },
  { education: 'Post Graduate', profession: 'Professor', income: 900000 },
  { education: 'B.Arch', profession: 'Architect', income: 1100000 },
  { education: 'B.Tech / B.E.', profession: 'Product Manager', income: 2500000 },
  { education: 'MBA', profession: 'Finance Manager', income: 1800000 },
  { education: 'B.Tech / B.E.', profession: 'DevOps Engineer', income: 1600000 },
  { education: 'MBBS', profession: 'Dentist', income: 1200000 },
  { education: 'Graduate', profession: 'Police Officer', income: 600000 },
  { education: 'B.Pharm', profession: 'Pharmacist', income: 700000 },
  { education: 'B.Tech / B.E.', profession: 'Electrical Engineer', income: 850000 },
  { education: 'MBA', profession: 'HR Manager', income: 1100000 },
  { education: 'B.Tech / B.E.', profession: 'QA Engineer', income: 900000 },
  { education: 'Graduate', profession: 'Army Officer', income: 800000 },
  { education: 'M.Sc.', profession: 'Teacher', income: 600000 },
];

const FEMALE_EDUCATION_PROFESSION = [
  { education: 'B.Tech / B.E.', profession: 'Software Engineer', income: 1000000 },
  { education: 'B.Sc.', profession: 'Nurse', income: 500000 },
  { education: 'MBBS', profession: 'Doctor', income: 1500000 },
  { education: 'MBA', profession: 'HR Manager', income: 1000000 },
  { education: 'B.Ed', profession: 'Teacher', income: 550000 },
  { education: 'M.Sc.', profession: 'Research Scientist', income: 900000 },
  { education: 'Post Graduate', profession: 'Lecturer', income: 700000 },
  { education: 'CA', profession: 'Chartered Accountant', income: 1400000 },
  { education: 'B.Com', profession: 'Accountant', income: 500000 },
  { education: 'B.Tech / B.E.', profession: 'Data Analyst', income: 1100000 },
  { education: 'MBA', profession: 'Marketing Executive', income: 800000 },
  { education: 'LLB', profession: 'Lawyer', income: 900000 },
  { education: 'B.Pharm', profession: 'Pharmacist', income: 600000 },
  { education: 'Graduate', profession: 'Government Employee', income: 600000 },
  { education: 'Graduate', profession: 'Bank Officer', income: 750000 },
  { education: 'B.Sc.', profession: 'Dietitian', income: 600000 },
  { education: 'B.Des', profession: 'Fashion Designer', income: 700000 },
  { education: 'B.Sc.', profession: 'Lab Technician', income: 450000 },
  { education: 'M.Tech / M.E.', profession: 'Software Developer', income: 1500000 },
  { education: 'MBA', profession: 'Business Analyst', income: 1200000 },
  { education: 'BDS', profession: 'Dentist', income: 1000000 },
  { education: 'Graduate', profession: 'Content Writer', income: 450000 },
  { education: 'B.Sc. Nursing', profession: 'Senior Nurse', income: 600000 },
  { education: 'Post Graduate', profession: 'Psychologist', income: 800000 },
  { education: 'Graduate', profession: 'Homemaker', income: 0 },
  { education: 'B.Sc.', profession: 'Physiotherapist', income: 550000 },
  { education: 'MBA', profession: 'Operations Manager', income: 1100000 },
  { education: 'B.Tech / B.E.', profession: 'UI/UX Designer', income: 1000000 },
  { education: 'Post Graduate', profession: 'Social Worker', income: 400000 },
  { education: 'Graduate', profession: 'Receptionist', income: 360000 },
];

const MALE_BIOS = [
  'A simple and family-oriented person from Maharashtra. Looking for a life partner who shares similar values and traditions.',
  'Software professional with a passion for travel and Marathi culture. Believe in building a strong, happy family together.',
  'Hardworking and honest person. Love spending time with family and friends. Looking for a caring and understanding partner.',
  'A doctor by profession, passionate about helping others. Seeking a like-minded partner to build a beautiful life together.',
  'Engineer by profession, reader by passion. Looking for someone who understands the importance of both career and family.',
  'Well-settled professional from Pune. Love cricket, travel, and good food. Seeking a compatible life partner.',
  'Simple and down-to-earth person. Family values are very important to me. Looking for a partner with similar outlook.',
  'CA professional with a stable career. Enjoy music, trekking, and family gatherings. Seeking a caring partner.',
  'Army officer who believes in discipline and dedication. Looking for a strong, independent, and family-oriented partner.',
  'Software engineer with a good work-life balance. Love exploring Maharashtra&apos;s culture and heritage.',
  'Business professional who values education and tradition. Looking for an educated and independent partner.',
  'Government employee with stable income. Values simplicity, honesty, and family. Looking for a compatible bride.',
  'Architect who loves design and culture. Seeking a creative and understanding life partner.',
  'MBA graduate working in finance sector. Believe in mutual respect and partnership in marriage.',
  'Doctor committed to both profession and family life. Looking for a well-educated, family-oriented partner.',
];

const FEMALE_BIOS = [
  'A cheerful and family-loving girl from Maharashtra. Looking for a caring and responsible partner for life.',
  'Software professional who loves learning new things. Believe in a balanced life of career and family.',
  'Teacher passionate about education and children. Seeking a mature, responsible, and caring life partner.',
  'Doctor who loves her work and family equally. Looking for an understanding and supportive partner.',
  'Simple girl with traditional values. Love cooking, reading, and spending time with family.',
  'Working professional from Pune. Enjoy traveling, cooking, and cultural activities. Seeking a compatible match.',
  'Independent woman with a stable career. Value family traditions and modern thinking equally.',
  'Friendly and caring person looking for an honest and respectful life partner.',
  'CA professional with strong family values. Looking for a well-educated and family-oriented partner.',
  'Teacher who believes education is the foundation of a strong family. Seeking a kind and responsible match.',
  'Nurse with compassionate nature. Family and relationships are the priority in life.',
  'MBA professional who believes in equal partnership in marriage. Looking for a like-minded partner.',
  'Artist and designer passionate about Maharashtrian culture. Seeking a creative and open-minded partner.',
  'Government employee who values stability and family. Looking for an honest and supportive life partner.',
  'Simple homemaker who loves family life. Seeking a caring, respectful, and family-oriented partner.',
];

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = ['FREE', 'FREE', 'FREE', 'SILVER', 'GOLD', 'PLATINUM'];
const MARITAL_STATUSES: MaritalStatus[] = ['NEVER_MARRIED', 'NEVER_MARRIED', 'NEVER_MARRIED', 'DIVORCED', 'WIDOWED'];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function randomBetween(min: number, max: number, seed: number): number {
  return min + ((seed * 7 + 13) % (max - min + 1));
}

function generateDOB(gender: Gender, index: number): Date {
  const minAge = gender === 'MALE' ? 23 : 19;
  const maxAge = gender === 'MALE' ? 42 : 36;
  const age = minAge + (index % (maxAge - minAge + 1));
  const year = new Date().getFullYear() - age;
  const month = (index % 12) + 1;
  const day = (index % 28) + 1;
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
}

function generateHeight(gender: Gender, index: number): number {
  return gender === 'MALE'
    ? 162 + (index % 24) // 162–185 cm
    : 148 + (index % 23); // 148–170 cm
}

function generatePhotos(gender: Gender, index: number): string[] {
  const base = gender === 'MALE'
    ? (i: number) => `https://randomuser.me/api/portraits/men/${(index + i) % 100}.jpg`
    : (i: number) => `https://randomuser.me/api/portraits/women/${(index + i) % 100}.jpg`;
  return [base(0), base(1), base(2), base(3), base(4)];
}

function generateWhatsApp(mobile: string, index: number): string | null {
  return index % 3 === 0 ? mobile : null;
}

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting Soulmate Sync seed...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.dailyStats.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.otpVerification.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.attachment.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.call.deleteMany(),
    prisma.report.deleteMany(),
    prisma.block.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.profileView.deleteMany(),
    prisma.superLike.deleteMany(),
    prisma.like.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.preference.deleteMany(),
    prisma.photo.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.adminUser.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log('✅ Database cleaned\n');

  const hashedPassword = await bcrypt.hash('Test@123', 12);

  // ─── CREATE ADMIN USER ───────────────────────────────────────────────────────
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'admin@soulmatesync.com',
      password: await bcrypt.hash('Admin@Secure123', 12),
      mobileNumber: '9999999999',
      gender: 'MALE',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      mobileVerified: true,
      lastLogin: new Date(),
      lastActive: new Date(),
    },
  });

  await prisma.profile.create({
    data: {
      userId: adminUser.id,
      firstName: 'System',
      lastName: 'Admin',
      dateOfBirth: new Date('1990-01-01'),
      age: 34,
      height: 175,
      religion: 'Hindu',
      caste: 'General',
      motherTongue: 'Marathi',
      education: 'Post Graduate',
      profession: 'System Administrator',
      annualIncome: 1500000,
      state: 'Maharashtra',
      district: 'Pune',
      city: 'Pune',
      latitude: 18.5204,
      longitude: 73.8567,
      profileCompletionPercentage: 100,
      isVerified: true,
      verificationBadge: true,
    },
  });

  await prisma.adminUser.create({
    data: { userId: adminUser.id, role: 'super_admin', permissions: ['*'] },
  });

  await prisma.subscription.create({
    data: { userId: adminUser.id, plan: 'DIAMOND', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), videoCallingAccess: true, unlimitedLikes: true, advancedFilters: true, seeProfileVisitors: true, priorityListing: true, superLikesPerDay: 10, boostsPerMonth: 5 },
  });
  console.log('✅ Admin user created\n');

  // ─── GENERATE PROFILES ───────────────────────────────────────────────────────

  async function createProfile(gender: Gender, index: number) {
    const isGroom = gender === 'MALE';
    const firstName = isGroom ? pick(MALE_NAMES, index) : pick(FEMALE_NAMES, index);
    const lastName = pick(LAST_NAMES, index);
    const location = pick(LOCATIONS, index);
    const rcData = pick(RELIGION_CASTE_DATA, index);
    const epData = isGroom
      ? pick(MALE_EDUCATION_PROFESSION, index)
      : pick(FEMALE_EDUCATION_PROFESSION, index);
    const maritalStatus = pick(MARITAL_STATUSES, index);
    const dob = generateDOB(gender, index);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const height = generateHeight(gender, index);
    const photos = generatePhotos(gender, index);
    const subscriptionPlan = pick(SUBSCRIPTION_PLANS, index);
    const isPremium = subscriptionPlan !== 'FREE';

    // Vary income slightly
    const incomeVariance = 1 + ((index % 5) * 0.1);
    const annualIncome = Math.round(epData.income * incomeVariance);

    const mobileNumber = `9${String(700000000 + (isGroom ? index : 100 + index)).padStart(9, '0')}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@gmail.com`;
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}`;
    const bio = isGroom ? pick(MALE_BIOS, index) : pick(FEMALE_BIOS, index);
    const whatsapp = generateWhatsApp(mobileNumber, index);

    // Random lat/lng offset for privacy (±0.01 degrees ≈ 1 km)
    const latOffset = ((index % 20) - 10) * 0.001;
    const lngOffset = ((index % 17) - 8) * 0.001;

    const hobbies = [
      ['Reading', 'Cooking', 'Travel'],
      ['Cricket', 'Music', 'Trekking'],
      ['Yoga', 'Gardening', 'Photography'],
      ['Dancing', 'Movies', 'Social Work'],
      ['Gym', 'Cycling', 'Cooking'],
    ][index % 5];

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        mobileNumber,
        gender,
        accountStatus: 'ACTIVE',
        emailVerified: true,
        mobileVerified: index % 4 !== 0,
        lastLogin: new Date(Date.now() - randomBetween(0, 7, index) * 24 * 60 * 60 * 1000),
        lastActive: new Date(Date.now() - randomBetween(0, 48, index) * 60 * 60 * 1000),
      },
    });

    // Profile
    const completionScore = Math.min(100, 60 + (index % 40));
    await prisma.profile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        dateOfBirth: dob,
        age,
        height,
        weight: isGroom ? 60 + (index % 30) : 45 + (index % 25),
        maritalStatus,
        motherTongue: rcData.motherTongue,
        religion: rcData.religion,
        caste: rcData.caste,
        subCaste: rcData.subCaste,
        gothra: rcData.gothra || null,
        manglik: index % 7 === 0,
        education: epData.education,
        profession: epData.profession,
        company: index % 3 === 0 ? `${['TCS', 'Infosys', 'Wipro', 'HCL', 'Persistent', 'Tech Mahindra'][index % 6]}` : null,
        annualIncome,
        bio,
        hobbies,
        familyType: index % 2 === 0 ? 'Nuclear' : 'Joint',
        familyStatus: ['Middle Class', 'Upper Middle Class', 'Rich'][index % 3],
        fatherOccupation: ['Farmer', 'Government Service', 'Business', 'Retired'][index % 4],
        motherOccupation: ['Homemaker', 'Teacher', 'Government Service', 'Business'][index % 4],
        siblings: index % 3,
        state: 'Maharashtra',
        district: location.district,
        city: location.city,
        pincode: `4${String(10000 + index).slice(1)}`,
        latitude: location.lat + latOffset,
        longitude: location.lng + lngOffset,
        whatsappNumber: whatsapp,
        whatsappVisible: whatsapp !== null && index % 2 === 0,
        isVerified: index % 5 === 0,
        verificationBadge: index % 5 === 0,
        emailVerificationStatus: 'VERIFIED',
        mobileVerificationStatus: index % 4 !== 0 ? 'VERIFIED' : 'PENDING',
        govtIdVerificationStatus: index % 5 === 0 ? 'VERIFIED' : 'PENDING',
        profileViews: randomBetween(5, 500, index),
        likesReceived: randomBetween(0, 100, index),
        superLikesReceived: randomBetween(0, 20, index),
        profileCompletionPercentage: completionScore,
      },
    });

    // Photos (5 per profile, first is main)
    await prisma.photo.createMany({
      data: photos.map((url, i) => ({
        userId: user.id,
        url,
        isMain: i === 0,
        order: i,
      })),
    });

    // Preferences (opposite gender preferred)
    await prisma.preference.create({
      data: {
        userId: user.id,
        minAge: isGroom ? Math.max(18, age - 8) : Math.max(21, age + 1),
        maxAge: isGroom ? age + 5 : age + 12,
        minHeight: isGroom ? 150 : null,
        maxHeight: isGroom ? null : 190,
        religion: rcData.religion !== 'Hindu' ? [rcData.religion] : [],
        caste: index % 4 === 0 ? [rcData.caste] : [],
        maritalStatus: maritalStatus === 'NEVER_MARRIED'
          ? ['NEVER_MARRIED']
          : ['NEVER_MARRIED', maritalStatus],
        motherTongue: [rcData.motherTongue],
        education: ['Graduate', 'Post Graduate', 'B.Tech / B.E.', 'MBA', 'MBBS'].slice(0, 2 + (index % 3)),
        minIncome: isGroom ? null : 300000,
        maxIncome: null,
        preferredCities: [location.city],
        preferredDistricts: [location.district],
        preferredStates: ['Maharashtra'],
        maxDistance: [50, 100, 150, 200, null][index % 5] as number | null,
      },
    });

    // Subscription
    const subPlanFeatures = {
      FREE: { unlimitedLikes: false, advancedFilters: false, seeProfileVisitors: false, priorityListing: false, videoCallingAccess: false, superLikesPerDay: 1, boostsPerMonth: 0 },
      SILVER: { unlimitedLikes: true, advancedFilters: true, seeProfileVisitors: false, priorityListing: false, videoCallingAccess: false, superLikesPerDay: 3, boostsPerMonth: 1 },
      GOLD: { unlimitedLikes: true, advancedFilters: true, seeProfileVisitors: true, priorityListing: true, videoCallingAccess: false, superLikesPerDay: 5, boostsPerMonth: 2 },
      PLATINUM: { unlimitedLikes: true, advancedFilters: true, seeProfileVisitors: true, priorityListing: true, videoCallingAccess: true, superLikesPerDay: 10, boostsPerMonth: 5 },
      DIAMOND: { unlimitedLikes: true, advancedFilters: true, seeProfileVisitors: true, priorityListing: true, videoCallingAccess: true, superLikesPerDay: 10, boostsPerMonth: 5 },
    };

    const features = subPlanFeatures[subscriptionPlan];
    const subStart = isPremium ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : undefined;
    const subEnd = isPremium ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) : undefined;
    const subAmount = { FREE: 0, SILVER: 499, GOLD: 999, PLATINUM: 1999, DIAMOND: 3999 }[subscriptionPlan];

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: subscriptionPlan,
        isActive: isPremium,
        startDate: subStart,
        endDate: subEnd,
        amount: subAmount,
        currency: 'INR',
        ...features,
      },
    });

    return user;
  }

  // ─── SEED 100 GROOMS ─────────────────────────────────────────────────────────
  console.log('👨 Seeding 100 Groom profiles...');
  const grooms: any[] = [];
  for (let i = 0; i < 100; i++) {
    const user = await createProfile('MALE', i);
    grooms.push(user);
    if ((i + 1) % 10 === 0) console.log(`  ✓ ${i + 1}/100 grooms created`);
  }

  // ─── SEED 100 BRIDES ─────────────────────────────────────────────────────────
  console.log('\n👩 Seeding 100 Bride profiles...');
  const brides: any[] = [];
  for (let i = 0; i < 100; i++) {
    const user = await createProfile('FEMALE', i);
    brides.push(user);
    if ((i + 1) % 10 === 0) console.log(`  ✓ ${i + 1}/100 brides created`);
  }

  // ─── SEED INTERACTIONS (Likes, Views, Conversations) ────────────────────────
  console.log('\n💜 Seeding social interactions...');

  // Create some likes (grooms like brides)
  const likePairs: Array<{ fromUserId: string; toUserId: string; isMatch: boolean }> = [];
  for (let i = 0; i < 50; i++) {
    const groom = grooms[i % grooms.length];
    const bride = brides[(i + 3) % brides.length];
    const reverseExists = likePairs.some(p => p.fromUserId === bride.id && p.toUserId === groom.id);
    likePairs.push({ fromUserId: groom.id, toUserId: bride.id, isMatch: reverseExists });
  }

  // Some brides like grooms back (creating matches)
  for (let i = 0; i < 20; i++) {
    const bride = brides[i % brides.length];
    const groom = grooms[(i + 3) % grooms.length];
    const forwardExists = likePairs.some(p => p.fromUserId === groom.id && p.toUserId === bride.id);
    likePairs.push({ fromUserId: bride.id, toUserId: groom.id, isMatch: forwardExists });
    // Mark forward as match
    if (forwardExists) {
      const fwd = likePairs.find(p => p.fromUserId === groom.id && p.toUserId === bride.id);
      if (fwd) fwd.isMatch = true;
    }
  }

  await prisma.like.createMany({ data: likePairs, skipDuplicates: true });
  console.log(`  ✓ ${likePairs.length} likes created (including mutual matches)`);

  // Create conversations for matched pairs
  const matchedPairs = likePairs.filter(l => l.isMatch && l.fromUserId !== l.toUserId);
  const conversationsCreated: string[] = [];

  for (const pair of matchedPairs.slice(0, 15)) {
    const [user1Id, user2Id] = [pair.fromUserId, pair.toUserId].sort();
    const existing = conversationsCreated.includes(`${user1Id}-${user2Id}`);
    if (existing) continue;
    conversationsCreated.push(`${user1Id}-${user2Id}`);

    const conv = await prisma.conversation.create({
      data: { user1Id, user2Id, lastMessage: 'Hello! I liked your profile 😊', lastMessageAt: new Date(), isActive: true },
    });

    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: pair.fromUserId,
        content: 'Hello! I liked your profile 😊',
        type: 'TEXT',
        isDelivered: true,
        isRead: true,
      },
    });
  }
  console.log(`  ✓ ${conversationsCreated.length} conversations with messages created`);

  // Profile views
  const viewData = [];
  for (let i = 0; i < 100; i++) {
    viewData.push({ viewerId: grooms[i % grooms.length].id, viewedId: brides[(i + 5) % brides.length].id });
  }
  await prisma.profileView.createMany({ data: viewData, skipDuplicates: true });
  console.log('  ✓ 100 profile views created');

  // ─── PRINT SUMMARY ────────────────────────────────────────────────────────────
  const totalUsers = await prisma.user.count();
  const totalProfiles = await prisma.profile.count();
  const totalLikes = await prisma.like.count();
  const totalMatches = await prisma.like.count({ where: { isMatch: true } });
  const totalConversations = await prisma.conversation.count();
  const premiumCount = await prisma.subscription.count({ where: { isActive: true, plan: { not: 'FREE' } } });

  console.log(`
╔═══════════════════════════════════════════╗
║         SEED COMPLETE — SUMMARY           ║
╠═══════════════════════════════════════════╣
║  👥 Total Users:          ${String(totalUsers).padEnd(16)}║
║  📋 Total Profiles:       ${String(totalProfiles).padEnd(16)}║
║  💜 Total Likes:          ${String(totalLikes).padEnd(16)}║
║  🤝 Mutual Matches:       ${String(totalMatches).padEnd(16)}║
║  💬 Conversations:        ${String(totalConversations).padEnd(16)}║
║  ⭐ Premium Users:         ${String(premiumCount).padEnd(16)}║
╠═══════════════════════════════════════════╣
║  🔐 Login Credentials:                    ║
║     Any user email from the list          ║
║     Password: Test@123                    ║
║  👑 Admin:                                ║
║     admin@soulmatesync.com                ║
║     Admin@Secure123                       ║
╚═══════════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
