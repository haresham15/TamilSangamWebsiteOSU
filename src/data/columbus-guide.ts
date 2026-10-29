export interface GuideSpot {
  id: string;
  name: string;
  tamilName: string;
  category: "Theaters & Kollywood" | "Food & Groceries" | "Campus Shortcuts & Resources";
  address: string;
  distanceFromCampus: string;
  descriptionEn: string;
  descriptionTa: string;
  recommendationEn: string;
  recommendationTa: string;
  mapsUrl: string;
  actionLabel?: string;
  actionUrl?: string;
  isCarpoolAction?: boolean;
}

export const COLUMBUS_GUIDE: GuideSpot[] = [
  // ==========================================
  // 1. Kollywood FDFS Theaters & Carpools
  // ==========================================
  {
    id: "cinemark-carriage-place",
    name: "Cinemark Carriage Place (Bethel Rd)",
    tamilName: "சினிமார்க் திரையரங்கம் (பெத்தேல் சாலை)",
    category: "Theaters & Kollywood",
    address: "2570 Bethel Rd, Columbus, OH 43220",
    distanceFromCampus: "12 mins drive from campus",
    descriptionEn: "The undisputed epicenter for South Indian First-Day-First-Show (FDFS) releases in Central Ohio. Screens all major Tamil festival blockbusters (Rajinikanth, Vijay, Ajith, Kamal Haasan, Suriya) with English subtitles.",
    descriptionTa: "மத்திய ஓஹியோவின் பிரதான தமிழ் திரைப்பட அரங்கம். ரஜினி, விஜய், அஜித், கமல் ஆகியோரின் புதிய திரைப்படங்கள் முதல் நாளிலேயே இங்கு திரையிடப்படுகின்றன.",
    recommendationEn: "FDFS weekend shows sell out days in advance. Coordinate rides with fellow Buckeyes through our movie-carpool chat!",
    recommendationTa: "முதல் நாள் காட்சிகளுக்கு முன்கூட்டியே டிக்கெட் முன்பதிவு செய்வது அவசியம்.",
    mapsUrl: "https://maps.google.com/?q=Cinemark+Carriage+Place+Bethel+Rd+Columbus",
    actionLabel: "Join Movie-Carpool GroupMe",
    actionUrl: "https://web.groupme.com/join_group/83424812/BeBIRg7f",
    isCarpoolAction: true,
  },
  {
    id: "amc-lennox-24",
    name: "AMC Lennox Town Center 24",
    tamilName: "ஏ.எம்.சி லெனாக்ஸ் திரையரங்கம்",
    category: "Theaters & Kollywood",
    address: "777 Kinnear Rd, Columbus, OH 43212",
    distanceFromCampus: "Adjacent to campus · CABS West Campus line",
    descriptionEn: "Located right on the West Campus transit loop. Regularly features prime South Indian and Tamil festival releases within walking distance or a short CABS bus ride from the RPAC.",
    descriptionTa: "பல்கலைக்கழகத்திற்கு மிக அருகில் அமைந்துள்ள அரங்கம்; மேற்கு வளாக பேருந்து வழித்தடத்தில் எளிதில் செல்லலாம்.",
    recommendationEn: "Take the free CABS West Campus bus or carpool from Lincoln/Morrill dorms in under 5 minutes.",
    recommendationTa: "இலவச CABS பேருந்து மூலம் சில நிமிடங்களில் சென்றடையலாம்.",
    mapsUrl: "https://maps.google.com/?q=AMC+Lennox+Town+Center+24+Columbus",
    actionLabel: "View AMC Lennox Showtimes",
    actionUrl: "https://www.amctheatres.com/movie-theatres/columbus/amc-lennox-town-center-24",
  },
  {
    id: "amc-easton-30",
    name: "AMC Easton Town Center 30",
    tamilName: "ஏ.எம்.சி ஈஸ்டன் திரையரங்கம்",
    category: "Theaters & Kollywood",
    address: "275 Easton Station, Columbus, OH 43219",
    distanceFromCampus: "20 mins drive from campus",
    descriptionEn: "Massive 30-screen flagship multiplex with IMAX and Dolby Cinema auditoriums playing major pan-Indian festival releases and premier opening-night screenings.",
    descriptionTa: "ஐமேக்ஸ் மற்றும் டால்பி வசதியுடன் கூடிய பிரம்மாண்ட திரையரங்கம்; வார இறுதி திரைப்படக் கொண்டாட்டத்திற்கு ஏற்ற இடம்.",
    recommendationEn: "Combine your evening movie outing with shopping and dinner at Easton Town Center.",
    recommendationTa: "திரைப்படத்துடன் ஈஸ்டன் வணிக வளாகத்தில் உணவருந்த சிறந்த தெரிவு.",
    mapsUrl: "https://maps.google.com/?q=AMC+Easton+Town+Center+30+Columbus",
    actionLabel: "View AMC Easton Showtimes",
    actionUrl: "https://www.amctheatres.com/movie-theatres/columbus/amc-dine-in-easton-town-center-30",
  },

  // ==========================================
  // 2. Food & Groceries
  // ==========================================
  {
    id: "dosa-corner",
    name: "Dosa Corner",
    tamilName: "தோசா கார்னர் உணவகம்",
    category: "Food & Groceries",
    address: "1077 Old Henderson Rd, Columbus, OH 43220",
    distanceFromCampus: "12 mins drive from campus",
    descriptionEn: "Beloved local casual diner famous for crispy paper roast dosas, piping hot medu vadas, authentic gun-powder (podi) idlis, and frothy degree filter coffee.",
    descriptionTa: "மொறுமொறு நெய் ரோஸ்ட், மெது வடை, பொடி இட்லி மற்றும் மணமணக்கும் டிகிரி ஃபில்டர் காபிக்கு பெயர் பெற்ற உணவகம்.",
    recommendationEn: "Order the Ghee Mysore Masala Dosa, onion uttapam, and a piping hot Madras Filter Coffee.",
    recommendationTa: "நெய் மைசூர் மசாலா தோசையுடன் ஒரு ஸ்ட்ராங் ஃபில்டர் காபி சிறந்த தேர்வு!",
    mapsUrl: "https://maps.google.com/?q=Dosa+Corner+Columbus+OH",
    actionLabel: "Open Google Maps Pin",
    actionUrl: "https://maps.google.com/?q=Dosa+Corner+Columbus+OH",
  },
  {
    id: "neehees",
    name: "Neehee's Indian Vegetarian Street Food",
    tamilName: "நீஹீஸ் தெருவோர சைவ உணவகம்",
    category: "Food & Groceries",
    address: "6080 Sawmill Rd, Dublin, OH 43017",
    distanceFromCampus: "20 mins drive from campus",
    descriptionEn: "Vibrant fast-casual Indian street food hall. Offers over 150 items including crispy Mumbai pav bhaji, live dosa counter, dahi puri, samosa chaats, and freshly pressed sugarcane juice.",
    descriptionTa: "பல்வேறு வகையான பானிபூரி, சாட் வகைகள், சமோசா, தோசை மற்றும் புதிய கரும்புச் சாறு கிடைக்கும் பிரம்மாண்ட உணவகம்.",
    recommendationEn: "Best spot for late-night weekend study fuel and quick bites with large friend groups.",
    recommendationTa: "நண்பர்களோடு சேர்ந்து பலவிதமான சாட் உணவுகளை சுவைக்க ஏற்ற இடம்.",
    mapsUrl: "https://maps.google.com/?q=Neehees+Indian+Vegetarian+Dublin+OH",
    actionLabel: "Open Google Maps Pin",
    actionUrl: "https://maps.google.com/?q=Neehees+Indian+Vegetarian+Dublin+OH",
  },
  {
    id: "aab-india",
    name: "Aab India Restaurant (Grandview)",
    tamilName: "ஆப் இந்தியா உணவகம் (கிராண்ட்வியூ)",
    category: "Food & Groceries",
    address: "1470 Grandview Ave, Columbus, OH 43212",
    distanceFromCampus: "7 mins drive · 2.5 miles from South Oval",
    descriptionEn: "The closest authentic Indian dining destination to campus. High-value daily lunch buffets, hot garlic naan, rich vegetable curries, and student-friendly takeout.",
    descriptionTa: "வளாகத்திற்கு மிக அருகில் உள்ள இந்திய உணவகம்; மதிய உணவு பஃபே மற்றும் சுவையான உணவுகளுக்கு பெயர் பெற்றது.",
    recommendationEn: "Show your Buckeye BuckID card for student-friendly specials during lunch hours.",
    recommendationTa: "மாணவர் அடையாள அட்டை மூலம் சிறப்பு சலுகைகள் பெறலாம்.",
    mapsUrl: "https://maps.google.com/?q=Aab+India+Grandview+Columbus+OH",
    actionLabel: "Open Google Maps Pin",
    actionUrl: "https://maps.google.com/?q=Aab+India+Grandview+Columbus+OH",
  },
  {
    id: "patel-brothers",
    name: "Patel Brothers Grocery",
    tamilName: "பட்டேல் பிரதர்ஸ் மளிகை",
    category: "Food & Groceries",
    address: "7178 Sawmill Rd, Dublin, OH 43016",
    distanceFromCampus: "20 mins drive from campus",
    descriptionEn: "Top spot in Northwest Columbus for lentils (toor dal, urad dal), whole spices, filter coffee powders (Narasu's, Cothas), ready-to-make idli batter, and fresh pooja supplies.",
    descriptionTa: "துவரம்பருப்பு, உளுந்து, நரசுஸ்/கோதாஸ் ஃபில்டர் காபித் தூள், இட்லி மாவு மற்றும் பூஜை சாமான்கள் வாங்க ஏற்ற அங்காடி.",
    recommendationEn: "Pick up fresh Cothas filter coffee powder, Haldiram snacks, and Mysore Pak on Friday delivery drops.",
    recommendationTa: "வெள்ளிக்கிழமைகளில் புதிய ஃபில்டர் காபித் தூளும் இனிப்புகளும் வாங்கலாம்.",
    mapsUrl: "https://maps.google.com/?q=Patel+Brothers+Sawmill+Rd+Columbus",
    actionLabel: "Open Google Maps Pin",
    actionUrl: "https://maps.google.com/?q=Patel+Brothers+Sawmill+Rd+Columbus",
  },
  {
    id: "saraga-intl",
    name: "Saraga International Grocery",
    tamilName: "சரகா பன்னாட்டு மளிகைக் கூடம்",
    category: "Food & Groceries",
    address: "1265 Morse Rd, Columbus, OH 43229",
    distanceFromCampus: "15 mins drive from campus",
    descriptionEn: "Massive international supermarket carrying South Indian essentials: fresh curry leaves, bulk idli rice, parboiled ponni, cold-pressed sesame oil, fresh drumsticks, and South Asian snack brands.",
    descriptionTa: "கருவேப்பிலை, இட்லி அரிசி, பொன்னி அரிசி, நல்லெண்ணெய், முருங்கைக்காய் என அத்தியாவசிய தென் இந்திய மளிகைப் பொருட்கள் கிடைக்கும் பிரம்மாண்ட அங்காடி.",
    recommendationEn: "Best place to buy bulk 20lb idli rice and fresh seasonal mangoes at wholesale prices.",
    recommendationTa: "மொத்தமாக இட்லி அரிசியும் மாங்காயும் வாங்க சிறந்த இடம்!",
    mapsUrl: "https://maps.google.com/?q=Saraga+International+Grocery+Morse+Rd+Columbus",
    actionLabel: "Open Google Maps Pin",
    actionUrl: "https://maps.google.com/?q=Saraga+International+Grocery+Morse+Rd+Columbus",
  },

  // ==========================================
  // 3. Campus Shortcuts & Hacks
  // ==========================================
  {
    id: "thompson-18th-study-rooms",
    name: "Booking Study Rooms (Thompson & 18th Ave)",
    tamilName: "நூலக படிப்பறை முன்பதிவு (தாம்சன் & 18வது அவென்யூ)",
    category: "Campus Shortcuts & Resources",
    address: "Thompson Library / 18th Ave Library",
    distanceFromCampus: "Heart of Campus",
    descriptionEn: "Reserve private group study rooms with whiteboards and monitors up to 2 weeks ahead via library.osu.edu. Thompson 11th floor offers whisper-quiet panoramic views of Columbus skyline. 18th Ave Library is open 24/7.",
    descriptionTa: "தாம்சன் மற்றும் 18வது அவென்யூ நூலகங்களில் குழுவாகப் படிக்க அறைகளை இணையவழியில் இலவசமாக முன்பதிவு செய்யலாம்.",
    recommendationEn: "Book 2-hour slots paired with a friend's name.# to secure 4 continuous hours of quiet study during midterm weeks.",
    recommendationTa: "தேர்வு காலங்களில் முன்கூட்டியே படிப்பறைகளை முன்பதிவு செய்வது நலம்.",
    mapsUrl: "https://maps.google.com/?q=Thompson+Library+OSU+Columbus",
    actionLabel: "Open OSU Library Booking Portal",
    actionUrl: "https://library.osu.edu",
  },
  {
    id: "cabs-transit-hacks",
    name: "CABS Bus Hacks & TransLoc Real-Time GPS",
    tamilName: "இலவச CABS பேருந்து வழித்தடங்கள் & வழிகாட்டி",
    category: "Campus Shortcuts & Resources",
    address: "Campus-Wide Transit Hubs",
    distanceFromCampus: "100% Free · Zero Fare · No BuckID Required",
    descriptionEn: "Campus Area Bus Service (CABS) runs year-round. Campus Loop South (CLS) and Campus Loop North (CLN) link North & South dorms, Ohio Union, RPAC, and West Campus parking.",
    descriptionTa: "வளாகம் முழுவதும் இயங்கும் இலவச CABS பேருந்துகள்; ஓஹியோ யூனியன், உடற்பயிற்சிக் கூடம் மற்றும் தங்கும் விடுதிகளை இணைக்கிறது.",
    recommendationEn: "Use the Ohio State App or TransLoc for real-time live GPS tracking so you never freeze at a winter bus stop.",
    recommendationTa: "பேருந்து வரும் நேரத்தை மொபைல் ஆப் மூலம் நேரடியாகக் கண்டறியலாம்.",
    mapsUrl: "https://maps.google.com/?q=Ohio+Union+Bus+Loop+Columbus",
    actionLabel: "View Live CABS Bus Routes",
    actionUrl: "https://ttm.osu.edu/cabs",
  },
  {
    id: "student-mental-health-ccs",
    name: "Mental Health Support & CCS (Younkin Center)",
    tamilName: "மாணவர் மனநல ஆலோசனை & வழிகாட்டல் மையம் (CCS)",
    category: "Campus Shortcuts & Resources",
    address: "Younkin Success Center, 1640 Neil Ave",
    distanceFromCampus: "South Campus · 3 mins walk from Union",
    descriptionEn: "Counseling and Consultation Service (CCS) provides free, confidential mental health counseling, stress relief workshops, and culturally sensitive care for Buckeyes navigating college transitions.",
    descriptionTa: "மாணவர்களுக்கான இலவச மற்றும் ரகசிய மனநல ஆலோசனை, மன அழுத்த மேலாண்மை மற்றும் வழிகாட்டல் மையம்.",
    recommendationEn: "Use 'Let's Talk' drop-in hours for informal, zero-paperwork 15-minute consultations with staff clinicians.",
    recommendationTa: "எளிய முறையில் முன்பதிவின்றி ஆலோசனை பெற 'Let's Talk' நேரத்தைப் பயன்படுத்தலாம்.",
    mapsUrl: "https://maps.google.com/?q=Younkin+Success+Center+Columbus+OH",
    actionLabel: "Visit OSU CCS Mental Health Portal",
    actionUrl: "https://ccs.osu.edu",
  },
  {
    id: "dennis-learning-center",
    name: "Dennis Learning Center (Free Academic Coaching)",
    tamilName: "டென்னிஸ் கற்றல் மையம் (இலவச கல்வி வழிகாட்டல்)",
    category: "Campus Shortcuts & Resources",
    address: "Younkin Success Center, 2nd Floor",
    distanceFromCampus: "South Campus",
    descriptionEn: "Free one-on-one academic coaching to master college exams, time management, lecture note-taking, and overcoming imposter syndrome in rigorous STEM and business curricula.",
    descriptionTa: "நேர மேலாண்மை, தேர்வுத் தயாரிப்பு மற்றும் கடினமான பாடங்களில் தேர்ச்சி பெற இலவச தனிநபர் கல்வி வழிகாட்டல்.",
    recommendationEn: "Schedule a 45-minute session in week 3 of the semester to build a study schedule before first midterms hit.",
    recommendationTa: "பருவத்தின் தொடக்கத்திலேயே இச்சேவையைப் பெற்று படிப்புத் திட்டத்தை வகுப்பது சிறந்தது.",
    mapsUrl: "https://maps.google.com/?q=Younkin+Success+Center+Columbus+OH",
    actionLabel: "Book Free Academic Coaching",
    actionUrl: "https://dennislearningcenter.osu.edu",
  },
];
