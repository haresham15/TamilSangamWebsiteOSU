export interface FaqItem {
  id: string;
  category: "General" | "Membership" | "Performances" | "Events" | "Governance";
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
      "OSU Tamil Sangam is a casual, student-run cultural organization at The Ohio State University. We are a campus hub for Tamil students and friends of all backgrounds to hang out, eat delicious South Indian food, listen to music, play games, and celebrate festivals like Diwali. No matter what language you speak or what your major is, you have a home with us!",
    answerTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் என்பது மாணவர்கள் அனைவரும் ஒன்றிணைந்து தமிழ் பண்பாட்டை ரசிக்கவும், நல்ல உணவை ருசிக்கவும், மற்றும் நட்பை வளர்க்கவும் வழிகாட்டும் ஒரு மாணவர் அமைப்பாகும். மொழி பேதமின்றி அனைவரும் எங்கள் குடும்பத்தில் இணையலாம்!",
  },
  {
    id: "faq-02",
    category: "Membership",
    questionEn: "Do I have to speak Tamil or be Tamil to join?",
    questionTa: "நான் தமிழனாக இருக்க வேண்டுமா அல்லது தமிழ் பேச வேண்டுமா?",
    answerEn:
      "Definitely not! We are completely open to students of all languages, backgrounds, and majors. Many of our active members do not speak Tamil and simply love the friendly community, the delicious food, the music, and the fun social events. As the Tamil proverb goes: 'யாதும் ஊரே யாவரும் கேளீர்' (To us, everyone is kin)!",
    answerTa:
      "கட்டாயமாகத் தேவையில்லை! எந்தவொரு மொழி பேசும் மாணவர்களும் எங்கள் சங்கத்தில் மகிழ்ச்சியுடன் இணையலாம். நல்ல உணவு, இசை மற்றும் தோழமையை விரும்பும் எவருக்கும் இங்கு இடமுண்டு.",
  },
  {
    id: "faq-03",
    category: "Membership",
    questionEn: "Are there any membership fees or dues?",
    questionTa: "உறுப்பினர் கட்டணம் ஏதேனும் உண்டா?",
    answerEn:
      "General membership is 100% free! Anyone can attend our bi-weekly general body meetings, study nights, and open workshops without paying a cent. For ticketed flagship celebrations, subsidized student-tier tickets are offered to BuckID holders.",
    answerTa:
      "பொது உறுப்பினராக இணைய எந்தக் கட்டணமும் இல்லை! பொதுக் கூட்டங்கள், படிப்பு மாலைகள் மற்றும் பட்டறைகள் முற்றிலும் இலவசம். பெரிய விழாக்களுக்கு மட்டும் குறைந்த கட்டணத்தில் மாணவர் நுழைவுச்சீட்டுகள் வழங்கப்படுகின்றன.",
  },
  {
    id: "faq-04",
    category: "Governance",
    questionEn: "How do members qualify for voting rights and Executive Board shadowing?",
    questionTa: "வாக்குரிமை மற்றும் நிர்வாகக் குழு வழிகாட்டல் (shadowing) பெறுவதற்கான தகுதிகள் யாவை?",
    answerEn:
      "Under our official constitution, to obtain voting rights, present formal ideas, or qualify for Executive Board shadowing, members must attend at least two meetings and two events per academic semester. Additionally, at least 90% of active voting members must be current OSU students.",
    answerTa:
      "சங்கத்தின் அரசியல் சாசனத்தின்படி, வாக்களிக்கும் உரிமை, அதிகாரப்பூர்வ யோசனைகளை முன்வைக்கும் தகுதி, அல்லது நிர்வாகக் குழு வழிகாட்டல் பெற, உறுப்பினர்கள் ஒரு பருவத்தில் குறைந்தது 2 கூட்டங்களிலும் 2 நிகழ்வுகளிலும் கலந்துகொள்ள வேண்டும். மேலும் 90% உறுப்பினர்கள் நடப்பு மாணவர்களாக இருத்தல் வேண்டும்.",
  },
  {
    id: "faq-05",
    category: "Membership",
    questionEn: "Can non-student community members participate in Sangam activities?",
    questionTa: "மாணவர் அல்லாத சமூகத்தினரும் சங்க நிகழ்வுகளில் கலந்துகொள்ளலாமா?",
    answerEn:
      "Yes! Non-student community members and families across Columbus and Ohio are warmly welcomed to attend our public cultural festivals, community seminars, and celebrations. However, under university student organization rules, non-student community members do not hold voting rights or creative directorship privileges.",
    answerTa:
      "நிச்சயமாக! கொலம்பஸ் மற்றும் ஓஹியோ வாழ் தமிழ் குடும்பங்களும் சமூகத்தினரும் எங்கள் கலாச்சார விழாக்கள் மற்றும் கருத்தரங்குகளில் பங்கேற்க எப்போதும் வரவேற்கப்படுகிறார்கள். எனினும், அவர்களுக்கு வாக்குரிமையோ நிர்வாக முடிவெடுக்கும் உரிமையோ கிடையாது.",
  },
  {
    id: "faq-06",
    category: "Governance",
    questionEn: "What are the organization's policies regarding non-discrimination and safety?",
    questionTa: "பாகுபாடின்மை மற்றும் பாதுகாப்பு தொடர்பான சங்கத்தின் கொள்கைகள் என்ன?",
    answerEn:
      "OSU Tamil Sangam strictly complies with university non-discrimination guidelines and University Policy 1.15 regarding sexual misconduct. We maintain an unconditional zero-tolerance policy against discrimination, harassment, assault, and retaliation, guaranteeing a safe, dignified, and inclusive environment for all.",
    answerTa:
      "ஓஹியோ பல்கலைக்கழகத்தின் பாகுபாடின்மை வழிகாட்டுதல்கள் மற்றும் பல்கலைக்கழக விதி 1.15 (பாலியல் முறைகேடு தடுப்பு) ஆகியவற்றை சங்கம் மிகக் கண்டிப்புடன் பின்பற்றுகிறது. அனைவருக்கும் பாதுகாப்பான மற்றும் சமத்துவமான சூழல் உறுதி செய்யப்படுகிறது.",
  },
  {
    id: "faq-07",
    category: "Performances",
    questionEn: "How do I get involved with dance (Aatam) or music (Paatam)?",
    questionTa: "நடனம் அல்லது இசைப் பிரிவுகளில் எவ்வாறு பங்கேற்பது?",
    answerEn:
      "At the start of each semester, we hold open interest workshops and casual showcases. Whether you love dancing (energetic cinematic Kuthu, fusion, or classical), singing, or playing an instrument, all skill levels are welcome. You can fill out the Performer Interest Form on our Join page at any time!",
    answerTa:
      "ஒவ்வொரு பருவத்தின் தொடக்கத்திலும் விருப்பமுள்ளவர்களுக்கான எளிய அறிமுகப் பட்டறைகள் நடைபெறும். சினிமா குத்து, பாட்டு, வாத்தியங்கள் வாசித்தல் என ஆர்வம் உள்ள அனைவரும் பங்கேற்கலாம்.",
  },
  {
    id: "faq-08",
    category: "Events",
    questionEn: "Where do Sangam events take place on campus?",
    questionTa: "நிகழ்ச்சிகள் வளாகத்தில் எங்கு நடைபெறும்?",
    answerEn:
      "Our annual collaborative Diwali celebration is hosted in the Ohio Union (Archie Griffin Ballroom). Our casual gatherings, street food nights, chai socials, and lawn game kickbacks take place on the South Oval, in the RPAC, or in student campus spaces.",
    answerTa:
      "தீபாவளிப் பெருவிழா ஓஹியோ யூனியன் அரங்கில் நடைபெறும். எளிய பிக்னிக், தெருவோர உணவு மற்றும் சந்திப்புகள் ஓவல் புல்வெளி அல்லது மாணவர் வளாக அரங்குகளில் நடைபெறும்.",
  },
  {
    id: "faq-09",
    category: "General",
    questionEn: "How does this website preserve my photo privacy?",
    questionTa: "புகைப்படங்களில் எனது தனியுரிமை எவ்வாறு பாதுகாக்கப்படுகிறது?",
    answerEn:
      "We adhere to strict privacy practices. We do not run facial recognition or name-tagging. Every photo in our gallery has a visible 'Request Removal' option that alerts the executive board to swiftly unpublish or blur any photo within 48 hours upon request.",
    answerTa:
      "நாங்கள் முக அங்கீகார தொழில்நுட்பங்களைப் பயன்படுத்துவதில்லை. புகைப்படத் தொகுப்பில் உள்ள ஒவ்வொரு படத்திலும் 'நீக்கக் கோருதல்' பட்டன் உள்ளது. கோரிக்கை வரப்பெற்ற 48 மணி நேரத்திற்குள் அப் படம் நீக்கப்படும்.",
  },
];
