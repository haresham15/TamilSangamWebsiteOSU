export interface FaqItem {
  id: string;
  category: "General" | "Membership" | "Performances" | "Events";
  questionEn: string;
  questionTa: string;
  answerEn: string;
  answerTa: string;
}

export const FAQS: FaqItem[] = [
  {
    id: "faq-01",
    category: "General",
    questionEn: "What is OSU Tamil Sangam?",
    questionTa: "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் என்றால் என்ன?",
    answerEn:
      "OSU Tamil Sangam is the premier undergraduate and graduate cultural organization at The Ohio State University dedicated to celebrating Tamil heritage, literature, art forms, and community. We organize flagship campus festivals, dance ensembles, music sessions, and social mixers throughout the academic year.",
    answerTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் என்பது தமிழ்ப் பண்பாடு, இலக்கியம், கலைகள் மற்றும் மாணவர் நட்பை வளர்க்கும் ஓஹியோ பல்கலைக்கழகத்தின் முதன்மை அமைப்பாகும். நாங்கள் பொங்கல், தீபாவளி, நடன நிகழ்ச்சிகள் மற்றும் பல்வேறு விழாக்களை வளாகத்தில் நடத்துகிறோம்.",
  },
  {
    id: "faq-02",
    category: "Membership",
    questionEn: "Do I have to speak Tamil or be Tamil to join?",
    questionTa: "நான் தமிழனாக இருக்க வேண்டுமா அல்லது தமிழ் பேச வேண்டுமா?",
    answerEn:
      "Absolutely not! Our Sangam proudly embodies the ancient Sangam motto: 'யாதும் ஊரே யாவரும் கேளீர்' (To us all towns are our own, everyone our kin). We wholeheartedly welcome students of all ethnicities, linguistic backgrounds, and academic majors. Many of our active performers and general members are learning about Tamil culture for the very first time!",
    answerTa:
      "கட்டாயமாகத் தேவையில்லை! 'யாதும் ஊரே யாவரும் கேளீர்' என்ற தத்துவத்தின்படி, எந்தவொரு கலாச்சாரப் பின்புலம் கொண்ட மாணவர்களும் எங்கள் சங்கத்தில் மகிழ்ச்சியுடன் இணையலாம். பலர் எங்களோடு இணைந்து தமிழ் கலாச்சாரத்தை முதன்முறையாகக் கற்று மகிழ்கின்றனர்.",
  },
  {
    id: "faq-03",
    category: "Membership",
    questionEn: "Are there any membership fees or dues?",
    questionTa: "உறுப்பினர் கட்டணம் ஏதேனும் உண்டா?",
    answerEn:
      "General membership is 100% free! Anyone can attend our bi-weekly general body meetings, study nights, and open workshops without paying a cent. For ticketed flagship festivals (such as Powerhouse Pongal or Pattas Tappas), subsidized student-tier tickets are offered to BuckID holders.",
    answerTa:
      "பொது உறுப்பினராக இணைய எந்தக் கட்டணமும் இல்லை! பொதுக் கூட்டங்கள், படிப்பு மாலைகள் மற்றும் பட்டறைகள் முற்றிலும் இலவசம். பெரிய விழாக்களுக்கு மட்டும் குறைந்த கட்டணத்தில் மாணவர் நுழைவுச்சீட்டுகள் வழங்கப்படுகின்றன.",
  },
  {
    id: "faq-04",
    category: "Performances",
    questionEn: "How do I audition for dance (Aatam) or music (Paatam)?",
    questionTa: "நடனம் அல்லது இசைப் பிரிவுகளில் எவ்வாறு தேர்வாகி பங்கேற்பது?",
    answerEn:
      "At the beginning of each Autumn and Spring semester, we hold open interest workshops and casual auditions. We welcome dancers from classical Bharatanatyam to freestyle Kuthu, as well as vocalists and instrumentalists. You can fill out the Performer Interest Form on our Join page at any time!",
    answerTa:
      "ஒவ்வொரு பருவத்தின் தொடக்கத்திலும் விருப்பமுள்ளவர்களுக்கான அறிமுகப் பட்டறைகள் நடைபெறும். பரதநாட்டியம் முதல் குத்து நடனம் வரை, பாட்டு முதல் இசைக்கருவி வாசிப்பு வரை அனைவரும் பங்கேற்கலாம். எங்கள் இணையதளத்தின் 'இணையுங்கள்' பக்கத்தில் விண்ணப்பிக்கலாம்.",
  },
  {
    id: "faq-05",
    category: "Events",
    questionEn: "Where do Sangam events take place on campus?",
    questionTa: "நிகழ்ச்சிகள் வளாகத்தில் எங்கு நடைபெறும்?",
    answerEn:
      "Major events like Powerhouse Pongal and Pattas Tappas are hosted in the Ohio Union (Archie Griffin Ballroom and Performance Hall). General meetings and chai socials take place in Hagerty Hall, the RPAC, or the South Oval during pleasant weather.",
    answerTa:
      "பெரிய திருவிழாக்கள் ஓஹியோ யூனியன் அரங்குகளில் நடைபெறும். சிறிய கூட்டங்களும் சந்திப்புகளும் ஹாகெர்ட்டி ஹால், RPAC அல்லது ஓவல் மைதானத்தில் நடைபெறும்.",
  },
  {
    id: "faq-06",
    category: "General",
    questionEn: "How does this website preserve my photo privacy?",
    questionTa: "புகைப்படங்களில் எனது தனியுரிமை எவ்வாறு பாதுகாக்கப்படுகிறது?",
    answerEn:
      "We adhere to strict privacy practices. We do not run facial recognition or name-tagging. Every photo in our gallery has a visible 'Request Removal' option that alerts the executive board to swiftly unpublish or blur any photo within 48 hours upon request.",
    answerTa:
      "நாங்கள் முக அங்கீகார தொழில்நுட்பங்களைப் பயன்படுத்துவதில்லை. புகைப்படத் தொகுப்பில் உள்ள ஒவ்வொரு படத்திலும் 'நீக்கக் கோருதல்' பட்டன் உள்ளது. கோரிக்கை வரப்பெற்ற 48 மணி நேரத்திற்குள் அப் படம் நீக்கப்படும்.",
  },
];
