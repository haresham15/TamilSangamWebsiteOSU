export interface GuideSpot {
  id: string;
  name: string;
  tamilName: string;
  category: "Grocery" | "Restaurant" | "Temple / Cultural" | "Community";
  address: string;
  distanceFromCampus: string;
  descriptionEn: string;
  descriptionTa: string;
  recommendationEn: string;
  recommendationTa: string;
  mapsUrl: string;
}

export const COLUMBUS_GUIDE: GuideSpot[] = [
  {
    id: "saraga-intl",
    name: "Saraga International Grocery",
    tamilName: "சரகா பன்னாட்டு மளிகைக் கூடம்",
    category: "Grocery",
    address: "1265 Morse Rd, Columbus, OH 43229",
    distanceFromCampus: "15 mins drive",
    descriptionEn: "Massive international supermarket carrying South Indian essentials: fresh curry leaves, idli rice, parboiled ponni, cold-pressed sesame oil, fresh drumsticks, and South Asian snack brands.",
    descriptionTa: "கருவேப்பிலை, இட்லி அரிசி, பொன்னி அரிசி, நல்லெண்ணெய், முருங்கைக்காய் என அத்தியாவசிய தென் இந்திய மளிகைப் பொருட்கள் கிடைக்கும் பிரம்மாண்ட அங்காடி.",
    recommendationEn: "Best place to buy bulk idli rice and fresh seasonal mangoes!",
    recommendationTa: "மொத்தமாக இட்லி அரிசியும் மாங்காயும் வாங்க சிறந்த இடம்!",
    mapsUrl: "https://maps.google.com/?q=Saraga+International+Grocery+Morse+Rd+Columbus",
  },
  {
    id: "patel-brothers",
    name: "Patel Brothers",
    tamilName: "பட்டேல் பிரதர்ஸ் மளிகை",
    category: "Grocery",
    address: "7178 Sawmill Rd, Dublin, OH 43016",
    distanceFromCampus: "20 mins drive",
    descriptionEn: "Top spot in Northwest Columbus for lentils (toor dal, urad dal), whole spices, filter coffee powders (Narasu's, Cothas), and fresh pooja supplies.",
    descriptionTa: "துவரம்பருப்பு, உளுந்து, நரசுஸ்/கோதாஸ் ஃபில்டர் காபித் தூள் மற்றும் பூஜை சாமான்கள் வாங்க ஏற்ற இடம்.",
    recommendationEn: "Pick up fresh Cothas filter coffee powder and Mysore Pak on Fridays.",
    recommendationTa: "வெள்ளிக்கிழமைகளில் ஃபில்டர் காபித் தூளும் மைசூர் பாக்கும் சுவைக்க மறக்காதீர்கள்.",
    mapsUrl: "https://maps.google.com/?q=Patel+Brothers+Sawmill+Rd+Columbus",
  },
  {
    id: "dosa-corner",
    name: "Dosa Corner",
    tamilName: "தோசா கார்னர் உணவகம்",
    category: "Restaurant",
    address: "1077 Old Henderson Rd, Columbus, OH 43220",
    distanceFromCampus: "12 mins drive",
    descriptionEn: "Beloved local casual diner famous for crispy paper roast dosas, piping hot medu vadas, authentic gun-powder (podi) idlis, and frothy degree filter coffee.",
    descriptionTa: "மொறுமொறு நெய் ரோஸ்ட், மெது வடை, பொடி இட்லி மற்றும் மணமணக்கும் டிகிரி ஃபில்டர் காபிக்கு பெயர் பெற்ற உணவகம்.",
    recommendationEn: "Order the Ghee Mysore Masala Dosa and a hot Madras Filter Coffee.",
    recommendationTa: "நெய் மைசூர் மசாலா தோசையுடன் ஒரு ஸ்ட்ராங் ஃபில்டர் காபி சிறந்த தேர்வு!",
    mapsUrl: "https://maps.google.com/?q=Dosa+Corner+Columbus+OH",
  },
  {
    id: "bawarchi-columbus",
    name: "Bawarchi Biryanis & South Indian",
    tamilName: "பவர்ச்சி பிரியாணி உணவகம்",
    category: "Restaurant",
    address: "7106 Sawmill Rd, Dublin, OH 43016",
    distanceFromCampus: "20 mins drive",
    descriptionEn: "Popular for spicy Chettinad chicken curries, Thalappakatti-style mutton biryani, paneer 65, and weekend student buffets.",
    descriptionTa: "காரசாரமான செட்டிநாடு சிக்கன், மட்டன் பிரியாணி மற்றும் பன்னீர் 65 உணவுகள்.",
    recommendationEn: "Chettinad Pepper Fry and Vijayawada Special Biryani.",
    recommendationTa: "செட்டிநாடு பெப்பர் ஃப்ரை மற்றும் ஸ்பெஷல் பிரியாணி.",
    mapsUrl: "https://maps.google.com/?q=Bawarchi+Biryanis+Dublin+OH",
  },
  {
    id: "sri-venkateswara-temple",
    name: "Sri Venkateswara Temple (SV Temple)",
    tamilName: "ஸ்ரீ வெங்கடேஸ்வரா ஆலயம் (டெலாவேர்)",
    category: "Temple / Cultural",
    address: "7615 Graphics Way, Lewis Center, OH 43035",
    distanceFromCampus: "25 mins drive",
    descriptionEn: "Major architectural temple hub for the Central Ohio South Asian community. Celebrates major Tamil festivals like Thai Pongal, Panguni Uthiram, and Navaratri Golu with traditional prasadam.",
    descriptionTa: "மத்திய ஓஹியோவின் முதன்மை ஆலயம்; தைப்பொங்கல், பங்குனி உத்திரம், நவராத்திரி கொலு என அனைத்து தமிழ் விழாக்களும் விமரிசையாக நடைபெறும் இடம்.",
    recommendationEn: "Visit on festival Saturdays for temple puliyodharai (tamarind rice) and sweet pongal.",
    recommendationTa: "விழா நாட்களில் கோவில் புளியோதரையும் சர்க்கரைப் பொங்கலும் பிரசித்தி பெற்றது.",
    mapsUrl: "https://maps.google.com/?q=SV+Temple+Lewis+Center+OH",
  },
  {
    id: "central-ohio-tamil-sangam",
    name: "Central Ohio Tamil Sangam (COTS)",
    tamilName: "மத்திய ஓஹியோ தமிழ்ச் சங்கம் (COTS)",
    category: "Community",
    address: "Greater Columbus, OH",
    distanceFromCampus: "Community Network",
    descriptionEn: "The broader Columbus metropolitan non-profit Tamil organization. Collaborates with OSU Tamil Sangam on youth leadership, cultural festivals, and community service.",
    descriptionTa: "கொலம்பஸ் பெருநகர தமிழ்க் குடும்பங்களை இணைக்கும் சங்கம்; மாணவர் விழாக்கள் மற்றும் சமூக சேவைகளில் ஆதரவு அளிக்கிறது.",
    recommendationEn: "Great network for students seeking mentorship, host families, or summer internships in Ohio.",
    recommendationTa: "வழிகாட்டல் மற்றும் உள்ளூர் தமிழ் குடும்பங்களின் நட்பு பெற சிறந்த தளம்.",
    mapsUrl: "https://maps.google.com/?q=Columbus+OH",
  },
];
