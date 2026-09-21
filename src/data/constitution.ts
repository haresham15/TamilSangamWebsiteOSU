export interface GovernanceRule {
  id: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  category: "purpose" | "activities" | "membership" | "safety";
}

export const CLUB_PURPOSE: GovernanceRule[] = [
  {
    id: "purpose-diaspora",
    titleEn: "Uniting the Tamil Diaspora",
    titleTa: "புலம்பெயர் தமிழர்களை ஒன்றிணைத்தல்",
    descriptionEn:
      "Unites students, scholars, and community members of the Tamil diaspora across The Ohio State University and Central Ohio, creating an enduring cultural home away from home.",
    descriptionTa:
      "ஓஹியோ பல்கலைக்கழகம் மற்றும் மத்திய ஓஹியோவில் உள்ள புலம்பெயர் தமிழ் மாணவர்கள், அறிஞர்கள் மற்றும் சமூகத்தினரை ஒன்றிணைத்து கலாச்சார இல்லத்தை உருவாக்குதல்.",
    category: "purpose",
  },
  {
    id: "purpose-language",
    titleEn: "Tamil Language Acquisition & Literacy",
    titleTa: "தமிழ் மொழி கற்றல் & இலக்கிய விழிப்புணர்வு",
    descriptionEn:
      "Encourages Tamil language acquisition, conversational fluency, and classical Sangam literary appreciation among heritage speakers, new learners, and allies.",
    descriptionTa:
      "புதிதாகக் கற்போர் மற்றும் மாணவர்களிடையே தமிழ் மொழிப் பேச்சு, எழுத்து, மற்றும் சங்க இலக்கிய வாசிப்பை ஊக்குவித்தல்.",
    category: "purpose",
  },
  {
    id: "purpose-culture",
    titleEn: "Promoting Cultural Integration",
    titleTa: "கலாச்சார ஒருமைப்பாடு & விழிப்புணர்வு",
    descriptionEn:
      "Promotes inter-cultural integration on campus by sharing Tamil music, dance, cuisine, philosophy, and history with the broader Buckeye collegiate community.",
    descriptionTa:
      "தமிழ் இசை, நடனம், பாரம்பரிய உணவு மற்றும் வரலாற்று உன்னதங்களை அனைத்து மாணவர்களுடனும் பகிர்ந்து கலாச்சார பாலத்தை அமைத்தல்.",
    category: "purpose",
  },
  {
    id: "purpose-philanthropy",
    titleEn: "Awareness & Philanthropic Fundraising",
    titleTa: "விழிப்புணர்வு & சமூக அறப்பணிகள்",
    descriptionEn:
      "Raises awareness and funds for humanitarian causes, disaster relief, and educational initiatives centered in both Tamil-speaking regions globally and local communities across the United States.",
    descriptionTa:
      "உலகளாவிய தமிழ்ப் பகுதிகள் மற்றும் அமெரிக்காவில் உள்ள மனிதநேய உதவிகள், கல்வி உதவித்தொகைகள் மற்றும் சமூக நலப்பணிகளுக்கு நிதி திரட்டுதல்.",
    category: "purpose",
  },
];

export const CLUB_ACTIVITIES: GovernanceRule[] = [
  {
    id: "act-cultural",
    titleEn: "Flagship Cultural Festivals",
    titleTa: "முக்கிய கலாச்சார விழாக்கள்",
    descriptionEn:
      "Hosts large-scale flagship cultural productions including Powerhouse Pongal, Diwali celebrations, live music concerts, and cinematic showcases.",
    descriptionTa:
      "பொங்கல், தீபாவளி, நேரடி இசை நிகழ்ச்சிகள் மற்றும் கலாச்சார மேடை நிகழ்வுகளை பிரம்மாண்டமாக நடத்துதல்.",
    category: "activities",
  },
  {
    id: "act-meetings",
    titleEn: "Educational & Informational Meetings",
    titleTa: "கல்வி & தகவல் பகிர்வு சந்திப்புகள்",
    descriptionEn:
      "Conducts recurring educational gatherings, research presentations, historical lectures, and general body informational sessions throughout the semester.",
    descriptionTa:
      "கல்விசார் விவாதங்கள், வரலாற்று உரைகள், மற்றும் சங்கத்தின் பொதுக்குழு தகவல் பகிர்வு சந்திப்புகளை நடத்துதல்.",
    category: "activities",
  },
  {
    id: "act-language",
    titleEn: "Language-Learning Sessions & Workshops",
    titleTa: "மொழிப் பயிற்சி & பட்டறைகள்",
    descriptionEn:
      "Organizes interactive conversational Tamil workshops, pronunciation guides, and peer language exchange programs for all skill levels.",
    descriptionTa:
      "அனைத்து நிலை மாணவர்களுக்கும் உரையாடல் தமிழ் பயிற்சி, உச்சரிப்பு வழிகாட்டல் மற்றும் மொழிக் கூர்ந்தாய்வு பட்டறைகள் அமைத்தல்.",
    category: "activities",
  },
  {
    id: "act-seminars",
    titleEn: "Community-Oriented Seminars & Panels",
    titleTa: "சமூக கருத்தரங்குகள் & கலந்துரையாடல்கள்",
    descriptionEn:
      "Curates panel discussions on diaspora identity, mental health, career networking, alumni mentorship, and civic engagement.",
    descriptionTa:
      "புலம்பெயர் வாழ்வியல், மனநலம், தொழில் வழிகாட்டல் மற்றும் முன்னாள் மாணவர் சந்திப்புகளை ஒருங்கிணைத்தல்.",
    category: "activities",
  },
];

export const MEMBERSHIP_GOVERNANCE = {
  openStatusEn: "Membership is open year-round to all interested individuals.",
  openStatusTa: "ஆண்டு முழுவதும் எந்த நேரத்திலும் உறுப்பினராக இணையலாம்.",
  studentQuotaEn: "At least 90% of members must be current OSU students.",
  studentQuotaTa: "சங்கத்தின் உறுப்பினர்களில் குறைந்தது 90% பேர் நடப்பு ஓஹியோ பல்கலைக்கழக மாணவர்களாக இருத்தல் வேண்டும்.",
  votingRequirementEn:
    "To obtain voting rights, present official ideas, or qualify for Executive Board shadowing, members must attend at least two meetings and two events per academic semester.",
  votingRequirementTa:
    "வாக்களிக்கும் உரிமை, உத்தியோகபூர்வ யோசனைகளை முன்வைக்கும் உரிமை, அல்லது நிர்வாகக் குழு வழிகாட்டல் (shadowing) பெற, உறுப்பினர்கள் ஒரு பருவத்தில் குறைந்தது இரண்டு கூட்டங்களிலும் இரண்டு நிகழ்வுகளிலும் கலந்துகொள்ள வேண்டும்.",
  communityPolicyEn:
    "Non-student community members are warmly welcomed to attend meetings, celebrations, and workshops, but do not hold voting or creative privileges.",
  communityPolicyTa:
    "மாணவர் அல்லாத உள்ளூர் சமூகத்தினர் நிகழ்வுகள் மற்றும் கூட்டங்களில் பங்கேற்க எப்போதும் அன்புடன் வரவேற்கப்படுகிறார்கள்; ஆனால் அவர்களுக்கு வாக்குரிமையோ நிர்வாக முடிவெடுக்கும் உரிமையோ கிடையாது.",
  nonDiscriminationPolicy:
    "The Ohio State University Tamil Sangam adheres strictly to university non-discrimination guidelines and University Policy 1.15 regarding sexual misconduct. The organization does not discriminate on the basis of age, ancestry, color, disability, gender identity or expression, genetic information, HIV/AIDS status, military status, national origin, race, religion, sex, sexual orientation, protected veteran status, or any other bases under the law.",
  policy115ComplianceEn:
    "Strict adherence to Ohio State University Policy 1.15 guarantees a safe, respectful, and zero-tolerance environment against sexual misconduct, harassment, and retaliation.",
  policy115ComplianceTa:
    "ஓஹியோ பல்கலைக்கழக விதி 1.15-ன் படி, பாலியல் முறைகேடுகள், துன்புறுத்தல்கள் மற்றும் பழிவாங்கும் செயல்களுக்கு எதிராக சங்கம் பூஜ்ஜிய சகிப்புத்தன்மையுடன் (zero tolerance) பாதுகாப்பான சூழலை உறுதி செய்கிறது.",
};
