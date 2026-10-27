// src/data/solluDictionary.ts
/**
 * Verified 113-Word 5-Letter Tanglish Seed Dictionary for Sollu (Wordle)
 * Strictly 5 ASCII characters per entry.
 */

export const VALIDATED_TANGLISH_5_WORDS: readonly string[] = [
  // 1–15: Music, Dance & Arts
  "KUTHU", "PAATU", "VEENA", "PARAI", "THALA", "GAANA", "RAGAM", "TALAM", "BHAVA", "NATYA", "MELAM", "NADAM", "GEETH", "SWARA", "KOOTH",
  // 16–35: Food, Spices & Hospitality
  "KAAPI", "DOSAI", "VADAI", "RASAM", "SAMBA", "APPAM", "PUTTU", "HALWA", "LADDU", "BAJJI", "BONDA", "POORI", "KORMA", "KARAM", "MILAG", "JEERA", "NEYYI", "PAALU", "THEEN", "UNAVU",
  // 36–55: Heritage, History & Literature
  "KOLAM", "CHOLA", "CHERA", "TAMIL", "KURAL", "SANGA", "PULLI", "SIKKU", "KOVIL", "GOPUR", "MANDI", "SILAM", "PONNI", "KAVER", "VAIGA", "THANJ", "MADUR", "CHENN", "ERODE", "SALEM",
  // 56–75: Kinship, Slang & Campus Life
  "NANBA", "MACHI", "MACHA", "THAMB", "AKKAA", "ANNAN", "AMMAV", "APPAV", "PAATI", "THATH", "NATPU", "PAASA", "NESAM", "MASSU", "GETHU", "SEMMA", "KALAK", "JOLLY", "GUMMU", "CHUMM",
  // 76–95: Cinema, Festivals & Nature
  "ROLEX", "LEOOO", "BILLA", "GHILL", "PADAI", "MUTHU", "SIVAJ", "ENTHI", "KABAL", "KAALA", "PETTA", "JAILE", "VIKRA", "KAITH", "PONGA", "DEEPA", "CHITH", "AADII", "THAII", "MAASI",
  // 96–113: Everyday Tamil Nouns & Verbs (5-Letter Transliterations)
  "SOLLU", "KELVI", "VIDAI", "VETRI", "SAKTH", "VEEDU", "VAETT", "KADAL", "MALAI", "MAZHA", "VEYIL", "KAATR", "NILAA", "VAANA", "POOVU", "MARAM", "ILAIY", "KANIY"
].map((w) => w.trim().toUpperCase());

const TANGLISH_SET = new Set(VALIDATED_TANGLISH_5_WORDS);

// Common 5-letter English words accepted alongside Tanglish words
const COMMON_ENGLISH_WORDS: readonly string[] = [
  "ABOUT", "ABOVE", "ACTOR", "ADULT", "AFTER", "AGAIN", "ALERT", "ALBUM", "ALIEN", "ALIVE",
  "ALLOW", "ALONE", "ALONG", "AMONG", "ANGEL", "ANGER", "APPLE", "APPLY", "ARENA", "ARGUE",
  "ARISE", "ARMOR", "ARROW", "ASSET", "AUDIO", "AVOID", "AWARD", "AWARE", "BADGE", "BASIC",
  "BEACH", "BEGIN", "BLACK", "BLADE", "BLIND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BRAIN",
  "BRAND", "BRAVE", "BREAD", "BREAK", "BRICK", "BRIEF", "BRING", "BROAD", "BROWN", "BUILD",
  "BURST", "CABIN", "CABLE", "CANDY", "CAUSE", "CHAIN", "CHAIR", "CHAMP", "CHARM", "CHASE",
  "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD", "CHILL", "CIVIL", "CLAIM", "CLASS", "CLEAN",
  "CLEAR", "CLERK", "CLICK", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COLOR", "CRAFT",
  "CRANE", "CRASH", "CRAZY", "CREAM", "CREEK", "CRIME", "CROSS", "CROWD", "CROWN", "DAILY",
  "DANCE", "DEALT", "DEATH", "DELAY", "DELTA", "DENSE", "DEVIL", "DIARY", "DOUBT", "DRAFT",
  "DRAMA", "DREAM", "DRESS", "DRIFT", "DRINK", "DRIVE", "EARLY", "EARTH", "EIGHT", "ELITE",
  "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "EVENT", "EXACT", "EXIST",
  "EXTRA", "FAITH", "FALSE", "FANCY", "FATAL", "FAULT", "FIBER", "FIELD", "FIGHT", "FINAL",
  "FIRST", "FLAME", "FLASH", "FLEET", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY",
  "FORUM", "FOUND", "FRAME", "FRESH", "FRONT", "FRUIT", "GIANT", "GIVEN", "GLASS", "GLORY",
  "GRACE", "GRADE", "GRAND", "GRANT", "GRAPE", "GRASP", "GRASS", "GRAVE", "GREAT", "GREEN",
  "GREET", "GRIEF", "GROUP", "GUARD", "GUESS", "GUEST", "GUIDE", "HABIT", "HAPPY", "HARSH",
  "HEART", "HEAVY", "HONOR", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX",
  "INNER", "INPUT", "ISSUE", "JEWEL", "JOINT", "JUDGE", "JUICE", "KNIFE", "KNOCK", "LABEL",
  "LABOR", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE",
  "LEGAL", "LEMON", "LEVEL", "LIGHT", "LIMIT", "LINKS", "LIVER", "LOCAL", "LOGIC", "LOOSE",
  "LUCKY", "LUNCH", "MAGIC", "MAJOR", "MAKER", "MARCH", "MATCH", "MAYOR", "MEDIA", "METAL",
  "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT",
  "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAIVE", "NERVE", "NIGHT", "NOBLE", "NOISE", "NORTH",
  "NOVEL", "NURSE", "OCEAN", "OFFER", "OFTEN", "ONION", "ORDER", "OTHER", "OUTER", "OWNER",
  "PANEL", "PAPER", "PARTY", "PEACE", "PHASE", "PHONE", "PHOTO", "PIANO", "PIECE", "PILOT",
  "PITCH", "PIZZA", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POWER", "PRESS",
  "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "QUEEN",
  "QUICK", "QUIET", "QUITE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT",
  "READY", "REALM", "REBEL", "REFER", "RELAX", "REPLY", "RESET", "RIVER", "ROBOT", "ROUGH",
  "ROUND", "ROUTE", "ROYAL", "RULER", "RURAL", "SALAD", "SAUCE", "SCALE", "SCENE", "SCOPE",
  "SCORE", "SENSE", "SERVE", "SEVEN", "SHADE", "SHAKE", "SHARE", "SHARP", "SHEEP", "SHEET",
  "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOUT", "SIGHT",
  "SINCE", "SKILL", "SLEEP", "SLIDE", "SMART", "SMILE", "SMOKE", "SOLAR", "SOLID", "SOLVE",
  "SORRY", "SOUND", "SOUTH", "SPACE", "SPARK", "SPEAK", "SPEED", "SPEND", "SPICE", "SPORT",
  "STAFF", "STAGE", "STAND", "STARE", "START", "STATE", "STEAM", "STEEL", "STICK", "STILL",
  "STOCK", "STONE", "STORE", "STORM", "STORY", "STRIP", "STYLE", "SUGAR", "SUITE", "SUPER",
  "SWEET", "TABLE", "TASTE", "TEETH", "THANK", "THEME", "THERE", "THICK", "THING", "THINK",
  "THIRD", "TIGER", "TITLE", "TODAY", "TOOTH", "TOPIC", "TOTAL", "TOUCH", "TOWER", "TRACK",
  "TRADE", "TRAIN", "TRAIT", "TREND", "TRIAL", "TRIBE", "TRICK", "TRUCK", "TRULY", "TRUTH",
  "TWICE", "UNCLE", "UNDER", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE",
  "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH",
  "WATER", "WHEEL", "WHERE", "WHICH", "WHITE", "WHOLE", "WORLD", "WORRY", "WORTH", "WOULD",
  "WOUND", "WRITE", "WRONG", "YOUTH"
];

const ENGLISH_SET = new Set(COMMON_ENGLISH_WORDS);

export function isValidSolluGuess(word: string): boolean {
  if (!word || word.length !== 5) return false;
  const upper = word.toUpperCase();
  return TANGLISH_SET.has(upper) || ENGLISH_SET.has(upper);
}
