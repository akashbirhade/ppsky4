"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRashiList = exports.calculateKundali = void 0;
// ─── KUNDALI MATCHING CONSTANTS ──────────────────────────────────────────────
const RASHI_LIST = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const NAKSHATRA_LIST = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];
// Varna (Caste/Nature) - max 1 point
const VARNA_MAP = {
    Aries: 1, Leo: 1, Sagittarius: 1, // Kshatriya
    Taurus: 2, Virgo: 2, Capricorn: 2, // Vaishya
    Gemini: 3, Libra: 3, Aquarius: 3, // Shudra
    Cancer: 4, Scorpio: 4, Pisces: 4, // Brahmin
};
// Vashya (Dominance) grouping
const VASHYA_MAP = {
    Aries: 'Chatushpad', Taurus: 'Chatushpad',
    Leo: 'Vanchar', Sagittarius: 'Chatushpad',
    Cancer: 'Jalachara', Pisces: 'Jalachara',
    Scorpio: 'Keeta',
    Gemini: 'Nara', Virgo: 'Nara', Libra: 'Nara', Aquarius: 'Nara',
    Capricorn: 'Chatushpad',
};
// Yoni (Animal Nature)
const YONI_MAP = {
    Ashwini: 'Horse', Bharani: 'Elephant', Krittika: 'Goat', Rohini: 'Serpent',
    Mrigashirsha: 'Serpent', Ardra: 'Dog', Punarvasu: 'Cat', Pushya: 'Goat',
    Ashlesha: 'Cat', Magha: 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow',
    Hasta: 'Buffalo', Chitra: 'Tiger', Swati: 'Buffalo', Vishakha: 'Tiger',
    Anuradha: 'Deer', Jyeshtha: 'Deer', Mula: 'Dog', 'Purva Ashadha': 'Monkey',
    'Uttara Ashadha': 'Mongoose', Shravana: 'Monkey', Dhanishta: 'Lion',
    Shatabhisha: 'Horse', 'Purva Bhadrapada': 'Lion', 'Uttara Bhadrapada': 'Cow',
    Revati: 'Elephant',
};
// Gana (Temperament)
const GANA_MAP = {
    Ashwini: 'Deva', Mrigashirsha: 'Deva', Punarvasu: 'Deva', Pushya: 'Deva',
    Hasta: 'Deva', Swati: 'Deva', Anuradha: 'Deva', Shravana: 'Deva', Revati: 'Deva',
    Bharani: 'Manushya', Rohini: 'Manushya', Ardra: 'Manushya',
    'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya', 'Purva Ashadha': 'Manushya',
    'Uttara Ashadha': 'Manushya', 'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya',
    Krittika: 'Rakshasa', Ashlesha: 'Rakshasa', Magha: 'Rakshasa',
    Chitra: 'Rakshasa', Vishakha: 'Rakshasa', Jyeshtha: 'Rakshasa',
    Mula: 'Rakshasa', Dhanishta: 'Rakshasa', Shatabhisha: 'Rakshasa',
};
// Nadi (Health/Pulse)
const NADI_MAP = {
    Ashwini: 'Aadi', Ardra: 'Aadi', Punarvasu: 'Aadi', 'Uttara Phalguni': 'Aadi',
    Hasta: 'Aadi', Jyeshtha: 'Aadi', Mula: 'Aadi', Shatabhisha: 'Aadi', 'Purva Bhadrapada': 'Aadi',
    Bharani: 'Madhya', Mrigashirsha: 'Madhya', Pushya: 'Madhya', 'Purva Phalguni': 'Madhya',
    Chitra: 'Madhya', Anuradha: 'Madhya', 'Purva Ashadha': 'Madhya', Dhanishta: 'Madhya', 'Uttara Bhadrapada': 'Madhya',
    Krittika: 'Antya', Rohini: 'Antya', Ashlesha: 'Antya', Magha: 'Antya',
    Swati: 'Antya', Vishakha: 'Antya', 'Uttara Ashadha': 'Antya', Shravana: 'Antya', Revati: 'Antya',
};
// ─── GUNA CALCULATION FUNCTIONS ──────────────────────────────────────────────
function calcVarna(rashiBoy, rashiGirl) {
    const boy = VARNA_MAP[rashiBoy] || 1;
    const girl = VARNA_MAP[rashiGirl] || 1;
    return boy >= girl ? 1 : 0;
}
function calcVashya(rashiBoy, rashiGirl) {
    const boy = VASHYA_MAP[rashiBoy] || 'Nara';
    const girl = VASHYA_MAP[rashiGirl] || 'Nara';
    if (boy === girl)
        return 2;
    if ((boy === 'Nara' && girl === 'Chatushpad') || (boy === 'Chatushpad' && girl === 'Nara'))
        return 1;
    return 0;
}
function calcTara(nakshatraBoy, nakshatraGirl) {
    const boyIdx = NAKSHATRA_LIST.indexOf(nakshatraBoy);
    const girlIdx = NAKSHATRA_LIST.indexOf(nakshatraGirl);
    if (boyIdx < 0 || girlIdx < 0)
        return 1;
    const remainder = ((boyIdx - girlIdx + 27) % 9);
    const favorable = [1, 2, 4, 6, 8];
    return favorable.includes(remainder) ? 3 : 0;
}
function calcYoni(nakshatraBoy, nakshatraGirl) {
    const boy = YONI_MAP[nakshatraBoy] || 'Horse';
    const girl = YONI_MAP[nakshatraGirl] || 'Horse';
    if (boy === girl)
        return 4;
    // Enemy pairs
    const enemies = [
        ['Horse', 'Buffalo'], ['Elephant', 'Lion'], ['Goat', 'Monkey'],
        ['Serpent', 'Mongoose'], ['Dog', 'Deer'], ['Cat', 'Rat'],
        ['Tiger', 'Cow'],
    ];
    for (const pair of enemies) {
        if ((pair[0] === boy && pair[1] === girl) || (pair[1] === boy && pair[0] === girl))
            return 0;
    }
    return 2;
}
function calcGrahaMaitri(rashiBoy, rashiGirl) {
    const boyIdx = RASHI_LIST.indexOf(rashiBoy);
    const girlIdx = RASHI_LIST.indexOf(rashiGirl);
    if (boyIdx < 0 || girlIdx < 0)
        return 3;
    const diff = Math.abs(boyIdx - girlIdx);
    if (diff <= 1 || diff >= 11)
        return 5;
    if (diff <= 3 || diff >= 9)
        return 3;
    return 1;
}
function calcGana(nakshatraBoy, nakshatraGirl) {
    const boy = GANA_MAP[nakshatraBoy] || 'Manushya';
    const girl = GANA_MAP[nakshatraGirl] || 'Manushya';
    if (boy === girl)
        return 6;
    if (boy === 'Deva' && girl === 'Manushya')
        return 5;
    if (boy === 'Manushya' && girl === 'Deva')
        return 4;
    if (boy === 'Rakshasa' || girl === 'Rakshasa')
        return 0;
    return 3;
}
function calcBhakoot(rashiBoy, rashiGirl) {
    const boyIdx = RASHI_LIST.indexOf(rashiBoy);
    const girlIdx = RASHI_LIST.indexOf(rashiGirl);
    if (boyIdx < 0 || girlIdx < 0)
        return 4;
    const diff = ((boyIdx - girlIdx + 12) % 12);
    const unfavorable = [2, 5, 6, 8, 9, 12];
    return unfavorable.includes(diff) ? 0 : 7;
}
function calcNadi(nakshatraBoy, nakshatraGirl) {
    const boy = NADI_MAP[nakshatraBoy] || 'Aadi';
    const girl = NADI_MAP[nakshatraGirl] || 'Aadi';
    return boy === girl ? 0 : 8;
}
function isManglik(rashi, nakshatra) {
    // Simplified: Mars in 1,2,4,7,8,12 from Lagna. Approximation based on rashi/nakshatra
    const manglikNakshatras = ['Mrigashirsha', 'Chitra', 'Dhanishta', 'Ashlesha', 'Magha', 'Jyeshtha'];
    return manglikNakshatras.includes(nakshatra);
}
// ─── CONTROLLER ──────────────────────────────────────────────────────────────
const calculateKundali = async (req, res, next) => {
    try {
        const { boyRashi, boyNakshatra, girlRashi, girlNakshatra } = req.body;
        if (!boyRashi || !boyNakshatra || !girlRashi || !girlNakshatra) {
            return res.status(400).json({
                success: false,
                message: 'boyRashi, boyNakshatra, girlRashi, girlNakshatra are required',
            });
        }
        const gunas = [
            { name: 'Varna', description: 'Spiritual compatibility', maxPoints: 1, obtained: calcVarna(boyRashi, girlRashi) },
            { name: 'Vashya', description: 'Mutual attraction & dominance', maxPoints: 2, obtained: calcVashya(boyRashi, girlRashi) },
            { name: 'Tara', description: 'Destiny & luck', maxPoints: 3, obtained: calcTara(boyNakshatra, girlNakshatra) },
            { name: 'Yoni', description: 'Physical compatibility', maxPoints: 4, obtained: calcYoni(boyNakshatra, girlNakshatra) },
            { name: 'Graha Maitri', description: 'Mental compatibility', maxPoints: 5, obtained: calcGrahaMaitri(boyRashi, girlRashi) },
            { name: 'Gana', description: 'Temperament matching', maxPoints: 6, obtained: calcGana(boyNakshatra, girlNakshatra) },
            { name: 'Bhakoot', description: 'Love & family life', maxPoints: 7, obtained: calcBhakoot(boyRashi, girlRashi) },
            { name: 'Nadi', description: 'Health & genes', maxPoints: 8, obtained: calcNadi(boyNakshatra, girlNakshatra) },
        ];
        const totalObtained = gunas.reduce((sum, g) => sum + g.obtained, 0);
        const totalMax = 36;
        const percentage = Math.round((totalObtained / totalMax) * 100);
        let recommendation;
        if (percentage >= 75)
            recommendation = 'Excellent match! Highly recommended.';
        else if (percentage >= 50)
            recommendation = 'Good match. Proceed with confidence.';
        else if (percentage >= 33)
            recommendation = 'Average compatibility. Consider other factors.';
        else
            recommendation = 'Below average. Discuss with a pandit before proceeding.';
        const manglikBoy = isManglik(boyRashi, boyNakshatra);
        const manglikGirl = isManglik(girlRashi, girlNakshatra);
        let manglikStatus;
        if (!manglikBoy && !manglikGirl)
            manglikStatus = 'Neither is Manglik - No issues';
        else if (manglikBoy && manglikGirl)
            manglikStatus = 'Both are Manglik - Doshas cancel out';
        else
            manglikStatus = 'Manglik Dosha present - Remedies recommended';
        res.json({
            success: true,
            data: {
                totalScore: totalObtained,
                maxScore: totalMax,
                percentage,
                recommendation,
                gunas,
                manglik: { boy: manglikBoy, girl: manglikGirl, status: manglikStatus },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.calculateKundali = calculateKundali;
const getRashiList = async (_req, res) => {
    res.json({ success: true, data: { rashis: RASHI_LIST, nakshatras: NAKSHATRA_LIST } });
};
exports.getRashiList = getRashiList;
//# sourceMappingURL=kundali.controller.js.map