// Religion-wise caste and sub-caste data for India

export const CASTES_BY_RELIGION: Record<string, string[]> = {
  Hindu: [
    'Brahmin', 'Rajput', 'Maratha', 'Jat', 'Patel', 'Yadav', 'Agarwal',
    'Kayastha', 'Kshatriya', 'Vaishya', 'Lingayat', 'Vokkaliga', 'Reddy',
    'Naidu', 'Nair', 'Iyer', 'Iyengar', 'Gowda', 'Kamma', 'Kapu',
    'Gupta', 'Baniya', 'Sharma', 'Kurmi', 'Kunbi', 'Teli', 'Mali',
    'Dhangar', 'Mahar', 'Chambhar', 'Matang', 'Vanniyar', 'Thevar',
    'Gounder', 'Mudaliar', 'Pillai', 'Nadar', 'Ezhava', 'Bhumihar',
    'Tyagi', 'Saini', 'Khatri', 'Arora', 'Bania', 'Meena', 'Gujjar',
    'Ahir', 'Lodhi', 'Thakor', 'Darji', 'Suthar', 'Lohana', 'Sindhi',
    'Scheduled Caste', 'Scheduled Tribe', 'OBC', 'Other',
  ],
  Muslim: [
    'Shaikh', 'Syed', 'Pathan', 'Mughal', 'Ansari', 'Qureshi',
    'Khan', 'Malik', 'Mirza', 'Bohra', 'Memon', 'Khoja',
    'Nawab', 'Julaha', 'Dhobi', 'Faqir', 'Mansoori', 'Salmani',
    'Idrisi', 'Raeen', 'Saifi', 'Abbasi', 'Alvi', 'Bukhari',
    'Hashmi', 'Jafri', 'Kazmi', 'Naqvi', 'Rizvi', 'Zaidi',
    'Sunni', 'Shia', 'Other',
  ],
  Christian: [
    'Roman Catholic', 'Protestant', 'Syrian Christian', 'Marthomite',
    'Latin Catholic', 'Jacobite', 'Orthodox', 'CSI', 'CNI',
    'Pentecostal', 'Evangelical', 'Baptist', 'Methodist',
    'Seventh Day Adventist', 'Anglican', 'Nadar Christian',
    'Dalit Christian', 'SC/ST Christian', 'Other',
  ],
  Sikh: [
    'Jat Sikh', 'Khatri Sikh', 'Arora Sikh', 'Ramgarhia',
    'Saini Sikh', 'Labana', 'Ahluwalia', 'Bhatra',
    'Ramdasia', 'Ravidasia', 'Mazhabhi', 'Tarkhan',
    'Chhimba', 'Nai Sikh', 'Other',
  ],
  Jain: [
    'Digambar', 'Shwetambar', 'Agarwal Jain', 'Oswal',
    'Porwal', 'Khandelwal', 'Humad', 'Parwar',
    'Golalare', 'Saitwal', 'Pancham', 'Other',
  ],
  Buddhist: [
    'Mahar Buddhist', 'Neo Buddhist', 'Theravada', 'Mahayana',
    'Vajrayana', 'Ambedkarite', 'Sakkya', 'Other',
  ],
  Other: [
    'Other',
  ],
}

export const SUB_CASTES: Record<string, string[]> = {
  // Hindu - Brahmin sub-castes
  Brahmin: [
    'Deshastha Brahmin', 'Kokanastha Brahmin', 'Karhade Brahmin',
    'Saraswat Brahmin', 'Chitpavan Brahmin', 'Gaur Brahmin',
    'Maithil Brahmin', 'Kulin Brahmin', 'Saryupareen Brahmin',
    'Kanyakubj Brahmin', 'Nagar Brahmin', 'Audichya Brahmin',
    'Havyaka Brahmin', 'Smartha Brahmin', 'Vaishnav Brahmin',
    'Iyer', 'Iyengar', 'Namboothiri', 'Mohyal', 'Tyagi',
    'Bhumihar Brahmin', 'Pushkarna Brahmin', 'Shukla',
    'Trivedi', 'Chaturvedi', 'Dwivedi', 'Pandey', 'Mishra',
    'Other',
  ],
  Rajput: [
    'Chauhan', 'Rathore', 'Sisodia', 'Parmar', 'Solanki',
    'Tomar', 'Chandel', 'Gahlot', 'Kachwaha', 'Bundela',
    'Bhati', 'Shekhawat', 'Panwar', 'Nikumbh', 'Bais',
    'Jadeja', 'Jhala', 'Gohil', 'Chavda', 'Vaghela',
    'Other',
  ],
  Maratha: [
    '96 Kuli Maratha', 'Maratha Kunbi', 'CKP', 'Deshmukh',
    'Patil', 'Jadhav', 'Bhonsle', 'Shinde', 'Pawar',
    'Chavan', 'More', 'Nimbalkar', 'Ghorpade', 'Mahadik',
    'Other',
  ],
  Jat: [
    'Dahiya', 'Malik', 'Jakhar', 'Godara', 'Poonia',
    'Sindhu', 'Hooda', 'Sangwan', 'Sehrawat', 'Tanwar',
    'Ahlawat', 'Phogat', 'Beniwal', 'Sheoran', 'Dhankar',
    'Other',
  ],
  Patel: [
    'Leva Patel', 'Kadva Patel', 'Anjana Patel', 'Matiya Patel',
    'Charotar Patel', 'Leuva Patidar', 'Kadva Patidar',
    'Other',
  ],
  Yadav: [
    'Ahir', 'Gwala', 'Goala', 'Gop', 'Gadariya',
    'Ghosi', 'Sadgop', 'Kuruba', 'Other',
  ],
  Agarwal: [
    'Marwari Agarwal', 'Gupta Agarwal', 'Bansal', 'Garg',
    'Goyal', 'Jindal', 'Mittal', 'Singhal', 'Mangal', 'Kansal',
    'Tayal', 'Bindal', 'Other',
  ],
  Kayastha: [
    'Srivastava', 'Mathur', 'Saxena', 'Nigam', 'Bhatnagar',
    'Ambastha', 'Karnam', 'Prabhu', 'Other',
  ],
  Gupta: [
    'Vaish Gupta', 'Jaiswal', 'Agrahari', 'Kesarwani',
    'Rastogi', 'Mahuri', 'Other',
  ],
  Reddy: [
    'Deshmukh Reddy', 'Kapu Reddy', 'Panta Reddy', 'Golla Reddy',
    'Motati Reddy', 'Palle Reddy', 'Other',
  ],
  Naidu: [
    'Balija Naidu', 'Kamma Naidu', 'Kapu Naidu', 'Velama Naidu',
    'Golla Naidu', 'Telaga Naidu', 'Other',
  ],
  Nair: [
    'Menon', 'Kurup', 'Panicker', 'Pillai Nair', 'Unnithan',
    'Kartha', 'Thampi', 'Nambiar', 'Other',
  ],
  Khatri: [
    'Chopra', 'Kapoor', 'Khanna', 'Malhotra', 'Mehra',
    'Sehgal', 'Tandon', 'Bedi', 'Sahni', 'Other',
  ],
  Arora: [
    'Luthra', 'Chadha', 'Gulati', 'Anand', 'Bhatia',
    'Walia', 'Sethi', 'Vohra', 'Other',
  ],
  Lingayat: [
    'Panchamasali', 'Banajiga', 'Sadar', 'Ganiga',
    'Reddy Lingayat', 'Jangam', 'Other',
  ],
  Vokkaliga: [
    'Gangadikar', 'Morasu', 'Kunchitiga', 'Nonaba',
    'Namadhari', 'Other',
  ],
  Gowda: [
    'Vokkaliga Gowda', 'Bunts', 'Hegde', 'Shetty',
    'Billava', 'Other',
  ],

  // Muslim sub-castes
  Shaikh: [
    'Shaikh Siddiqui', 'Shaikh Usmani', 'Shaikh Faruqi',
    'Shaikh Abbasi', 'Shaikh Qadri', 'Other',
  ],
  Syed: [
    'Syed Rizvi', 'Syed Naqvi', 'Syed Zaidi', 'Syed Kazmi',
    'Syed Bukhari', 'Syed Jafri', 'Syed Alvi', 'Other',
  ],
  Pathan: [
    'Yusufzai', 'Afridi', 'Bangash', 'Khattak', 'Lodhi',
    'Niazi', 'Marwat', 'Durrani', 'Ghilzai', 'Other',
  ],
  Ansari: [
    'Momin Ansari', 'Julaha Ansari', 'Banarasi Ansari', 'Other',
  ],
  Qureshi: [
    'Qasai Qureshi', 'Husaini Qureshi', 'Suleimani Qureshi', 'Other',
  ],
  Khan: [
    'Pathan Khan', 'Mughal Khan', 'Rajput Khan', 'Yusufzai Khan', 'Other',
  ],
  Bohra: [
    'Dawoodi Bohra', 'Sulaimani Bohra', 'Alavi Bohra', 'Other',
  ],
  Memon: [
    'Halai Memon', 'Kutchi Memon', 'Sindhi Memon',
    'Kathiawadi Memon', 'Other',
  ],

  // Sikh sub-castes
  'Jat Sikh': [
    'Sandhu', 'Sidhu', 'Gill', 'Dhillon', 'Grewal',
    'Brar', 'Virk', 'Cheema', 'Bajwa', 'Mann',
    'Randhawa', 'Pannu', 'Chahal', 'Deol', 'Other',
  ],
  'Khatri Sikh': [
    'Chopra', 'Kapoor', 'Khanna', 'Malhotra', 'Mehra',
    'Sehgal', 'Tandon', 'Kohli', 'Anand', 'Other',
  ],
  'Arora Sikh': [
    'Luthra', 'Chadha', 'Gulati', 'Bhatia', 'Vohra',
    'Walia', 'Sethi', 'Other',
  ],
  Ramgarhia: [
    'Tarkhan', 'Lohar', 'Raj', 'Other',
  ],

  // Jain sub-castes
  Digambar: [
    'Agarwal Digambar', 'Khandelwal Digambar', 'Parwar Digambar',
    'Porwal Digambar', 'Other',
  ],
  Shwetambar: [
    'Oswal Shwetambar', 'Srimali Shwetambar', 'Palliwal Shwetambar',
    'Khandelwal Shwetambar', 'Other',
  ],
  'Oswal': [
    'Shwetambar Oswal', 'Digambar Oswal', 'Other',
  ],

  // Christian sub-castes
  'Roman Catholic': [
    'Goan Catholic', 'Mangalorean Catholic', 'East Indian Catholic',
    'Tamil Catholic', 'Kerala Catholic', 'Anglo-Indian', 'Other',
  ],
  'Syrian Christian': [
    'Knanaya', 'Malabar Nasrani', 'Southist', 'Northist', 'Other',
  ],
  'Protestant': [
    'CSI', 'CNI', 'Lutheran', 'Baptist', 'Methodist',
    'Pentecostal', 'Presbyterian', 'Other',
  ],
}

// Helper function to get castes for a religion
export function getCastesForReligion(religion: string): string[] {
  return CASTES_BY_RELIGION[religion] || []
}

// Helper function to get sub-castes for a caste
export function getSubCastesForCaste(caste: string): string[] {
  return SUB_CASTES[caste] || []
}
