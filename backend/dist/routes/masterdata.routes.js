"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
/**
 * Master Data APIs (Section 27)
 * All static reference data served from centralized endpoints.
 * Supports: pagination, search, sorting, caching headers.
 */
const router = (0, express_1.Router)();
// ─── Data definitions ─────────────────────────────────────────────────────────
const COUNTRIES = [
    { id: 'IN', name: 'India' }, { id: 'US', name: 'United States' },
    { id: 'UK', name: 'United Kingdom' }, { id: 'CA', name: 'Canada' },
    { id: 'AU', name: 'Australia' }, { id: 'AE', name: 'UAE' },
    { id: 'SG', name: 'Singapore' }, { id: 'DE', name: 'Germany' },
    { id: 'NZ', name: 'New Zealand' }, { id: 'SA', name: 'Saudi Arabia' },
];
const STATES = {
    IN: [
        { id: 'MH', name: 'Maharashtra' }, { id: 'KA', name: 'Karnataka' },
        { id: 'TN', name: 'Tamil Nadu' }, { id: 'DL', name: 'Delhi' },
        { id: 'UP', name: 'Uttar Pradesh' }, { id: 'GJ', name: 'Gujarat' },
        { id: 'RJ', name: 'Rajasthan' }, { id: 'WB', name: 'West Bengal' },
        { id: 'AP', name: 'Andhra Pradesh' }, { id: 'TS', name: 'Telangana' },
        { id: 'KL', name: 'Kerala' }, { id: 'MP', name: 'Madhya Pradesh' },
        { id: 'PB', name: 'Punjab' }, { id: 'HR', name: 'Haryana' },
        { id: 'BR', name: 'Bihar' }, { id: 'JH', name: 'Jharkhand' },
        { id: 'OR', name: 'Odisha' }, { id: 'CG', name: 'Chhattisgarh' },
        { id: 'AS', name: 'Assam' }, { id: 'GA', name: 'Goa' },
        { id: 'UK_S', name: 'Uttarakhand' }, { id: 'HP', name: 'Himachal Pradesh' },
        { id: 'JK', name: 'Jammu & Kashmir' },
    ],
};
const CITIES = {
    MH: [
        { id: 'MUM', name: 'Mumbai' }, { id: 'PUN', name: 'Pune' },
        { id: 'NAG', name: 'Nagpur' }, { id: 'NAS', name: 'Nashik' },
        { id: 'AUR', name: 'Aurangabad' }, { id: 'THN', name: 'Thane' },
        { id: 'KOL', name: 'Kolhapur' }, { id: 'SOL', name: 'Solapur' },
    ],
    KA: [
        { id: 'BLR', name: 'Bengaluru' }, { id: 'MYS', name: 'Mysuru' },
        { id: 'HUB', name: 'Hubli' }, { id: 'MNG', name: 'Mangaluru' },
    ],
    TN: [
        { id: 'CHN', name: 'Chennai' }, { id: 'CBE', name: 'Coimbatore' },
        { id: 'MDU', name: 'Madurai' }, { id: 'TRI', name: 'Trichy' },
    ],
    DL: [{ id: 'NDL', name: 'New Delhi' }, { id: 'DLI', name: 'Delhi NCR' }],
    GJ: [
        { id: 'AMD', name: 'Ahmedabad' }, { id: 'SRT', name: 'Surat' },
        { id: 'VAD', name: 'Vadodara' }, { id: 'RJK', name: 'Rajkot' },
    ],
};
const RELIGIONS = [
    { id: 'hindu', name: 'Hindu' }, { id: 'muslim', name: 'Muslim' },
    { id: 'christian', name: 'Christian' }, { id: 'sikh', name: 'Sikh' },
    { id: 'buddhist', name: 'Buddhist' }, { id: 'jain', name: 'Jain' },
    { id: 'parsi', name: 'Parsi' }, { id: 'jewish', name: 'Jewish' },
    { id: 'other', name: 'Other' },
];
const COMMUNITIES = {
    hindu: [
        { id: 'brahmin', name: 'Brahmin' }, { id: 'maratha', name: 'Maratha' },
        { id: 'rajput', name: 'Rajput' }, { id: 'vaishya', name: 'Vaishya' },
        { id: 'kayastha', name: 'Kayastha' }, { id: 'kshatriya', name: 'Kshatriya' },
        { id: 'lingayat', name: 'Lingayat' }, { id: 'reddy', name: 'Reddy' },
        { id: 'nair', name: 'Nair' }, { id: 'iyer', name: 'Iyer' },
        { id: 'iyengar', name: 'Iyengar' }, { id: 'agarwal', name: 'Agarwal' },
        { id: 'jat', name: 'Jat' }, { id: 'patel', name: 'Patel' },
        { id: 'kamma', name: 'Kamma' }, { id: 'other', name: 'Other' },
    ],
    muslim: [
        { id: 'sunni', name: 'Sunni' }, { id: 'shia', name: 'Shia' },
        { id: 'hanafi', name: 'Hanafi' }, { id: 'other', name: 'Other' },
    ],
    christian: [
        { id: 'catholic', name: 'Catholic' }, { id: 'protestant', name: 'Protestant' },
        { id: 'orthodox', name: 'Orthodox' }, { id: 'other', name: 'Other' },
    ],
    sikh: [
        { id: 'jat_sikh', name: 'Jat Sikh' }, { id: 'khatri', name: 'Khatri' },
        { id: 'ramgarhia', name: 'Ramgarhia' }, { id: 'other', name: 'Other' },
    ],
};
const SUB_COMMUNITIES = {
    brahmin: [
        { id: 'deshastha', name: 'Deshastha' }, { id: 'kokanastha', name: 'Kokanastha' },
        { id: 'saraswat', name: 'Saraswat' }, { id: 'karhade', name: 'Karhade' },
        { id: 'iyer_sub', name: 'Iyer' }, { id: 'iyengar_sub', name: 'Iyengar' },
        { id: 'other', name: 'Other' },
    ],
    maratha: [
        { id: '96k', name: '96 Kuli' }, { id: 'kunbi', name: 'Kunbi' },
        { id: 'other', name: 'Other' },
    ],
};
const LANGUAGES = [
    { id: 'hi', name: 'Hindi' }, { id: 'bn', name: 'Bengali' },
    { id: 'te', name: 'Telugu' }, { id: 'mr', name: 'Marathi' },
    { id: 'ta', name: 'Tamil' }, { id: 'gu', name: 'Gujarati' },
    { id: 'kn', name: 'Kannada' }, { id: 'ml', name: 'Malayalam' },
    { id: 'or', name: 'Odia' }, { id: 'pa', name: 'Punjabi' },
    { id: 'as', name: 'Assamese' }, { id: 'mai', name: 'Maithili' },
    { id: 'ur', name: 'Urdu' }, { id: 'en', name: 'English' },
    { id: 'other', name: 'Other' },
];
const QUALIFICATIONS = [
    { id: 'high_school', name: 'High School' }, { id: 'diploma', name: 'Diploma' },
    { id: 'bachelors', name: "Bachelor's" }, { id: 'masters', name: "Master's" },
    { id: 'phd', name: 'PhD' }, { id: 'ca', name: 'CA/CS/ICWA' },
    { id: 'mbbs', name: 'Medical (MBBS/MD)' }, { id: 'btech', name: 'Engineering (B.Tech/M.Tech)' },
    { id: 'mba', name: 'MBA' }, { id: 'law', name: 'Law (LLB/LLM)' },
    { id: 'other', name: 'Other' },
];
const EDUCATION_FIELDS = [
    { id: 'engineering', name: 'Engineering' }, { id: 'medicine', name: 'Medicine' },
    { id: 'commerce', name: 'Commerce' }, { id: 'arts', name: 'Arts' },
    { id: 'science', name: 'Science' }, { id: 'law', name: 'Law' },
    { id: 'management', name: 'Management' }, { id: 'it', name: 'Information Technology' },
    { id: 'design', name: 'Design' }, { id: 'education', name: 'Education' },
    { id: 'other', name: 'Other' },
];
const PROFESSIONS = [
    { id: 'software', name: 'Software Engineer' }, { id: 'doctor', name: 'Doctor' },
    { id: 'ca', name: 'Chartered Accountant' }, { id: 'business', name: 'Business Owner' },
    { id: 'teacher', name: 'Teacher/Professor' }, { id: 'govt', name: 'Government Job' },
    { id: 'lawyer', name: 'Lawyer' }, { id: 'manager', name: 'Manager' },
    { id: 'banking', name: 'Banking Professional' }, { id: 'civil', name: 'Civil Services (IAS/IPS)' },
    { id: 'army', name: 'Armed Forces' }, { id: 'architect', name: 'Architect' },
    { id: 'scientist', name: 'Scientist' }, { id: 'engineer', name: 'Engineer (Non-IT)' },
    { id: 'pilot', name: 'Pilot' }, { id: 'other', name: 'Other' },
];
const INDUSTRIES = [
    { id: 'it', name: 'IT/Software' }, { id: 'healthcare', name: 'Healthcare' },
    { id: 'finance', name: 'Finance/Banking' }, { id: 'education', name: 'Education' },
    { id: 'government', name: 'Government' }, { id: 'manufacturing', name: 'Manufacturing' },
    { id: 'realestate', name: 'Real Estate' }, { id: 'media', name: 'Media/Entertainment' },
    { id: 'consulting', name: 'Consulting' }, { id: 'ecommerce', name: 'E-commerce' },
    { id: 'telecom', name: 'Telecom' }, { id: 'pharma', name: 'Pharmaceutical' },
    { id: 'other', name: 'Other' },
];
const EMPLOYMENT_TYPES = [
    { id: 'private', name: 'Private Sector' }, { id: 'government', name: 'Government' },
    { id: 'self', name: 'Self Employed' }, { id: 'business', name: 'Business' },
    { id: 'freelance', name: 'Freelance' }, { id: 'not_working', name: 'Not Working' },
];
const DIET_OPTIONS = [
    { id: 'veg', name: 'Vegetarian' }, { id: 'nonveg', name: 'Non-Vegetarian' },
    { id: 'egg', name: 'Eggetarian' }, { id: 'vegan', name: 'Vegan' },
    { id: 'jain', name: 'Jain' },
];
const SMOKING_OPTIONS = [
    { id: 'never', name: 'Never' }, { id: 'occasionally', name: 'Occasionally' },
    { id: 'regularly', name: 'Regularly' },
];
const DRINKING_OPTIONS = [
    { id: 'never', name: 'Never' }, { id: 'socially', name: 'Socially' },
    { id: 'regularly', name: 'Regularly' },
];
const FAMILY_TYPES = [
    { id: 'joint', name: 'Joint Family' }, { id: 'nuclear', name: 'Nuclear Family' },
];
const FAMILY_STATUSES = [
    { id: 'middle', name: 'Middle Class' }, { id: 'upper_middle', name: 'Upper Middle Class' },
    { id: 'rich', name: 'Rich' }, { id: 'affluent', name: 'Affluent' },
];
const INCOME_RANGES = [
    { id: '0_3', name: 'Below 3 Lakhs' }, { id: '3_5', name: '3-5 Lakhs' },
    { id: '5_7', name: '5-7.5 Lakhs' }, { id: '7_10', name: '7.5-10 Lakhs' },
    { id: '10_15', name: '10-15 Lakhs' }, { id: '15_20', name: '15-20 Lakhs' },
    { id: '20_30', name: '20-30 Lakhs' }, { id: '30_50', name: '30-50 Lakhs' },
    { id: '50_75', name: '50-75 Lakhs' }, { id: '75_100', name: '75 Lakhs - 1 Crore' },
    { id: '100_plus', name: 'Above 1 Crore' },
];
const MARITAL_STATUSES = [
    { id: 'never', name: 'Never Married' }, { id: 'divorced', name: 'Divorced' },
    { id: 'widowed', name: 'Widowed' }, { id: 'awaiting', name: 'Awaiting Divorce' },
    { id: 'annulled', name: 'Annulled' },
];
const HEIGHT_RANGE = { min: 120, max: 220, unit: 'cm' };
const AGE_RANGE = { min: 18, max: 70 };
// ─── Helper: paginate, search, sort ─────────────────────────────────────────
function queryList(data, req) {
    const search = (req.query.search || '').toLowerCase();
    const sortBy = req.query.sortBy || 'name';
    const order = req.query.order || 'asc';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    let filtered = data;
    if (search) {
        filtered = data.filter((item) => item.name.toLowerCase().includes(search));
    }
    // Sort
    filtered = [...filtered].sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        return order === 'desc' ? -cmp : cmp;
    });
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return { items, total, page, limit };
}
function setCacheHeaders(res, maxAge = 86400) {
    res.set('Cache-Control', `public, max-age=${maxAge}`);
}
// ─── Routes ─────────────────────────────────────────────────────────────────
// Location
router.get('/countries', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(COUNTRIES, req) });
});
router.get('/states', (req, res) => {
    const countryId = req.query.countryId || 'IN';
    setCacheHeaders(res);
    const data = STATES[countryId] || [];
    res.json({ success: true, data: queryList(data, req) });
});
router.get('/cities', (req, res) => {
    const stateId = req.query.stateId;
    setCacheHeaders(res);
    const data = stateId ? (CITIES[stateId] || []) : Object.values(CITIES).flat();
    res.json({ success: true, data: queryList(data, req) });
});
// Religion & Community (dependent dropdowns)
router.get('/religions', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(RELIGIONS, req) });
});
router.get('/communities', (req, res) => {
    const religionId = req.query.religionId;
    setCacheHeaders(res);
    const data = religionId ? (COMMUNITIES[religionId] || []) : Object.values(COMMUNITIES).flat();
    res.json({ success: true, data: queryList(data, req) });
});
router.get('/sub-communities', (req, res) => {
    const communityId = req.query.communityId;
    setCacheHeaders(res);
    const data = communityId ? (SUB_COMMUNITIES[communityId] || []) : Object.values(SUB_COMMUNITIES).flat();
    res.json({ success: true, data: queryList(data, req) });
});
// Languages
router.get('/languages', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(LANGUAGES, req) });
});
// Education
router.get('/qualifications', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(QUALIFICATIONS, req) });
});
router.get('/education-fields', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(EDUCATION_FIELDS, req) });
});
// Career
router.get('/professions', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(PROFESSIONS, req) });
});
router.get('/industries', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(INDUSTRIES, req) });
});
router.get('/employment-types', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(EMPLOYMENT_TYPES, req) });
});
// Lifestyle
router.get('/diet', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(DIET_OPTIONS, req) });
});
router.get('/smoking', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(SMOKING_OPTIONS, req) });
});
router.get('/drinking', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(DRINKING_OPTIONS, req) });
});
// Family
router.get('/family-types', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(FAMILY_TYPES, req) });
});
router.get('/family-statuses', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(FAMILY_STATUSES, req) });
});
router.get('/income-ranges', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(INCOME_RANGES, req) });
});
// Personal
router.get('/marital-statuses', (req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: queryList(MARITAL_STATUSES, req) });
});
router.get('/height-range', (_req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: HEIGHT_RANGE });
});
router.get('/age-range', (_req, res) => {
    setCacheHeaders(res);
    res.json({ success: true, data: AGE_RANGE });
});
// Bulk endpoint — returns all master data in one call (useful for initial app load)
router.get('/all', (_req, res) => {
    setCacheHeaders(res, 3600); // 1 hour cache
    res.json({
        success: true,
        data: {
            countries: COUNTRIES,
            religions: RELIGIONS,
            languages: LANGUAGES,
            qualifications: QUALIFICATIONS,
            educationFields: EDUCATION_FIELDS,
            professions: PROFESSIONS,
            industries: INDUSTRIES,
            employmentTypes: EMPLOYMENT_TYPES,
            diet: DIET_OPTIONS,
            smoking: SMOKING_OPTIONS,
            drinking: DRINKING_OPTIONS,
            familyTypes: FAMILY_TYPES,
            familyStatuses: FAMILY_STATUSES,
            incomeRanges: INCOME_RANGES,
            maritalStatuses: MARITAL_STATUSES,
            heightRange: HEIGHT_RANGE,
            ageRange: AGE_RANGE,
        },
    });
});
exports.default = router;
//# sourceMappingURL=masterdata.routes.js.map