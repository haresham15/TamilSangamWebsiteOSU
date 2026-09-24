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
    id: "purpose-community",
    titleEn: "Welcoming Campus Hub",
    titleTa: "மாணவர் பண்பாட்டு மையம்",
    descriptionEn:
      "Serves as an inclusive, open, and friendly cultural hub for Tamil Buckeyes and students of all linguistic and cultural backgrounds, creating a warm home away from home.",
    descriptionTa:
      "தமிழ் மாணவர்கள் மற்றும் அனைத்து கலாச்சார பின்புலம் கொண்ட மாணவர்களையும் ஒன்றிணைத்து, ஓஹியோ பல்கலைக்கழகத்தில் ஒரு குடும்ப உணர்வை உருவாக்குதல்.",
    category: "purpose",
  },
  {
    id: "purpose-exchange",
    titleEn: "Cultural & Linguistic Inclusivity",
    titleTa: "மொழி & கலாச்சார நல்லுறவு",
    descriptionEn:
      "Welcomes students of all languages to experience Tamil culture, music, phrases, and customs in a casual, supportive, and fun collegiate environment.",
    descriptionTa:
      "அனைத்து மொழி பேசும் மாணவர்களுக்கும் தமிழ் பண்பாடு, இசை, மற்றும் மரபுகளை எளிய மற்றும் உற்சாகமான முறையில் அறிமுகப்படுத்துதல்.",
    category: "purpose",
  },
  {
    id: "purpose-fellowship",
    titleEn: "Good Food, Music & Celebration",
    titleTa: "உணவு, இசை & கொண்டாட்டம்",
    descriptionEn:
      "Brings people together through casual lawn picnics, street food feasts, film music jams, dance, and annual celebrations like our collaborative Diwali party.",
    descriptionTa:
      "புல்வெளி பிக்னிக், தெருவோர உணவு திருவிழாக்கள், இசை மாலைகள் மற்றும் தீபாவளிக் கொண்டாட்டங்கள் மூலம் மாணவர் நட்பைப் பலப்படுத்துதல்.",
    category: "purpose",
  },
  {
    id: "purpose-philanthropy",
    titleEn: "Peer Support & Campus Giving",
    titleTa: "மாணவர் வழிகாட்டல் & சமூக சேவை",
    descriptionEn:
      "Fosters peer mentorship for incoming Buckeyes, study groups, community volunteering with Columbus food banks, and charitable initiatives.",
    descriptionTa:
      "புதிய மாணவர்களுக்கான வழிகாட்டல், படிப்பு வட்டங்கள், மற்றும் கொலம்பஸ் உள்ளூர் தொண்டு நிறுவனங்களுடன் இணைந்து சமூக சேவை ஆற்றுதல்.",
    category: "purpose",
  },
];

export const CLUB_ACTIVITIES: GovernanceRule[] = [
  {
    id: "act-cultural",
    titleEn: "Campus Festivals & Celebrations",
    titleTa: "வளாக விழாக்கள் & கொண்டாட்டங்கள்",
    descriptionEn:
      "Hosts fun campus celebrations including cultural showcases, outdoor lawn picnics, and festive street food nights.",
    descriptionTa:
      "கலாச்சார நிகழ்வுகள், ஓவல் புல்வெளி பிக்னிக், மற்றும் தெருவோர உணவு திருவிழாக்களை மகிழ்ச்சியுடன் நடத்துதல்.",
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
