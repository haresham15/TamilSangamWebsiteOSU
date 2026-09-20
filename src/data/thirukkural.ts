export interface Thirukkural {
  number: number;
  chapterNumber: number;
  chapterEn: string;
  chapterTa: string;
  sectionEn: string;
  sectionTa: string;
  line1: string;
  line2: string;
  transliteration1: string;
  transliteration2: string;
  translationEn: string;
  explanationEn: string;
  explanationTa: string;
}

export const THIRUKKURALS: Thirukkural[] = [
  {
    number: 1,
    chapterNumber: 1,
    chapterEn: "Praise of God",
    chapterTa: "கடவுள் வாழ்த்து",
    sectionEn: "Virtue (Aram)",
    sectionTa: "அறத்துப்பால்",
    line1: "அகர முதல எழுத்தெல்லாம் ஆதி",
    line2: "பகவன் முதற்றே உலகு.",
    transliteration1: "Agara Mudhala Ezhuththellaam Aadhi",
    transliteration2: "Bhagavan Mudhatre Ulagu.",
    translationEn: "As the letter 'A' is the first of all letters, so is the Primordial Being first in all the world.",
    explanationEn: "Just as the sound 'A' forms the primordial foundation of every alphabet in human speech, the divine spark is the foundation of all creation.",
    explanationTa: "எழுத்துக்கள் எல்லாம் 'அ' என்னும் எழுத்தை முதலாகக் கொண்டுள்ளன; அதுபோல உலகம் ஆதிபகவனை முதலாகக் கொண்டுள்ளது.",
  },
  {
    number: 391,
    chapterNumber: 40,
    chapterEn: "Learning",
    chapterTa: "கல்வி",
    sectionEn: "Wealth / Governance (Porul)",
    sectionTa: "பொருட்பால்",
    line1: "கற்க கசடறக் கற்பவை கற்றபின்",
    line2: "நிற்க அதற்குத் தக.",
    transliteration1: "Karka Kasadarak Karpavai Katrapin",
    transliteration2: "Nirka Adharkuth Thaga.",
    translationEn: "Learn thoroughly what is worth learning without flaw; and once learned, walk steadfastly in its light.",
    explanationEn: "Acquire sound, virtuous knowledge without doubts or errors; and let your daily actions and conduct genuinely reflect that learning.",
    explanationTa: "கற்கத் தகுந்த நூல்களைக் குற்றமறக் கற்க வேண்டும்; அவ்வாறு கற்ற பிறகு, கற்ற கல்விக்கு ஏற்றவாறு நெறியில் வாழ வேண்டும்.",
  },
  {
    number: 785,
    chapterNumber: 79,
    chapterEn: "Friendship",
    chapterTa: "நட்பு",
    sectionEn: "Wealth / Society (Porul)",
    sectionTa: "பொருட்பால்",
    line1: "உடுக்கை இழந்தவன் கைபோல ஆங்கே",
    line2: "இடுக்கண் களைவதாம் நட்பு.",
    transliteration1: "Udukkai Izhandhavan Kaipola Aange",
    transliteration2: "Idukkan Kalaivadhaam Natpu.",
    translationEn: "True friendship is like the reflexive hand that rushes without hesitation to catch a falling garment.",
    explanationEn: "Just as the hand instinctively moves without thinking to save a person from sudden embarrassment, a true friend immediately rushes to alleviate grief.",
    explanationTa: "ஆடை நழுவும்போது ஒருவனது கை உடனே சென்று அதைக் காப்பது போல, நண்பனுக்குத் துன்பம் வந்ததும் உடனே சென்று உதவுவதே உண்மை நட்பு.",
  },
  {
    number: 107,
    chapterNumber: 11,
    chapterEn: "Gratitude",
    chapterTa: "செய்ந்நன்றி அறிதல்",
    sectionEn: "Virtue (Aram)",
    sectionTa: "அறத்துப்பால்",
    line1: "எந்நன்றி கொன்றார்க்கும் உய்வுண்டாம் உய்வில்லை",
    line2: "செய்ந்நன்றி கொன்ற மகற்கு.",
    transliteration1: "Ennandri Kondraarkkum Uyvundaam Uyvillai",
    transliteration2: "Seynnandri Kondra Magarku.",
    translationEn: "Forgiveness may exist for those who have broken every other virtue, but there is no redemption for one who destroys gratitude.",
    explanationEn: "Every sin or mistake has a path of atonement, except for ungratefulness toward those who offered timely kindness.",
    explanationTa: "எந்த அறத்தை அழித்தவருக்கும் தப்பிப் பிழைக்க வழியுண்டு; ஆனால் ஒருவர் செய்த உதவியை மறந்தவருக்கு ஒருபோதும் உய்வில்லை.",
  },
  {
    number: 616,
    chapterNumber: 62,
    chapterEn: "Perseverance & Effort",
    chapterTa: "ஆள்வினை உடைமை",
    sectionEn: "Wealth / Action (Porul)",
    sectionTa: "பொருட்பால்",
    line1: "தெய்வத்தான் ஆகா தெனினும் முயற்சிதன்",
    line2: "மெய்வருத்தக் கூலி தரும்.",
    transliteration1: "Dheivathaan Aagaa Dheninum Muyarchithan",
    transliteration2: "Meivarithak Kooli Tharum.",
    translationEn: "Even if fate or circumstances decree failure, honest hard work yields the exact reward of the sweat poured into it.",
    explanationEn: "Unyielding labor never goes to waste; relentless effort guarantees growth and enduring fruit.",
    explanationTa: "விதியால் ஒரு காரியம் நிறைவேறாது போனாலும், உடலை வருத்திச் செய்யும் கடுமையான முயற்சி அதற்கான பலனைத் தந்தே தீரும்.",
  },
];
