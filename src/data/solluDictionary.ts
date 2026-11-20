// src/data/solluDictionary.ts
/**
 * Expansive Multi-Length Tanglish & English Wordle Dictionary for Sollu
 * Spanning everyday Tamil heritage, culinary delights, kinship, emotions,
 * nature, campus slang, and cultural geography across lengths 3 to 6+ letters.
 */

export const VALIDATED_TANGLISH_WORDS: readonly string[] = [
  // ==========================================================================
  // 1. CULINARY, TIFFIN, MEALS, SWEETS, DRINKS & SPICES
  // ==========================================================================
  // 3-Letter
  "TEA", "VAD", "PAL", "NEY", "KUL", "MOR", "RAS", "CHI",
  // 4-Letter
  "DOSA", "VADA", "IDLI", "ROTI", "SOOR", "PAAL", "THEN", "PURI", "ADAI", "KULZ",
  "MITH", "GHEE", "CURD", "CHAI", "KARI", "MEEN", "SODA", "KOZH", "KOOR", "KUZH",
  "ALVA", "HALV", "AVAL", "PAVN", "KEER", "UPMA", "PODA", "APPV",
  // 5-Letter
  "KAAPI", "DOSAI", "VADAI", "RASAM", "SAMBA", "APPAM", "PUTTU", "HALWA", "LADDU",
  "BAJJI", "BONDA", "POORI", "KORMA", "KARAM", "MILAG", "JEERA", "NEYYI", "PAALU",
  "THEEN", "UNAVU", "IDLYS", "THAYI", "KUZHU", "KADAI", "PAROT", "VATHA", "UPMAA",
  "SEVAI", "PAYAS", "BIRYA", "CHUKK", "SUKKA", "KOOZK", "PARPU", "THUVL", "THOVI",
  "PACHA", "KAAYA", "KULFI", "MASAL", "MURUK", "BOOND", "MYSOO", "BADAM", "ELACH",
  "SOMBU", "INJIY", "POOND", "VENGA", "THAKA", "KEERA", "VATHL", "APPAL",
  // 6-Letter
  "DEEPAM", "PONGAL", "SAMBAR", "PAROTA", "MURUKK", "BIRYANI", "IDLIYS", "PAYASA",
  "KUZHAM", "BAJJIS", "BONDAS", "LADDUS", "VADAIS", "DOSAIS", "APPAMS", "PUTTUS",
  "PORIYA", "KOOTTU", "THAYIR", "PARUPP", "CHUTNY", "RASAMS", "AVIYAL", "KICHDI",
  "SEVAIY", "KOOZHZ", "UPPUMA", "ELANIR", "PANAKK", "SUKKUU", "INJIYY", "POONDU",
  "VENKAY", "THAKAL", "KEERAI", "MILAGU", "SEERAG", "SOAMBU", "PERUNG", "KOTHAM",
  "KARUVE", "MANJAL", "MOLAGA", "JIGARU", "HALWAA", "ATHIRA", "MASALA",

  // ==========================================================================
  // 2. SLANG, YOUTH CULTURE, CAMPUS BANTER & CASUAL CHIT-CHAT
  // ==========================================================================
  // 3-Letter
  "DEI", "DAA", "VAA", "POO", "AHA", "CHI", "OHO", "YOV", "PAA", "MAA", "BEY",
  "ADA", "DOW", "YEY", "LEI", "EYY", "POM", "POR", "AAY", "AIY", "VOI",
  // 4-Letter
  "THAL", "GUMM", "MASS", "GETH", "SEMM", "MACH", "PULL", "ALAP", "LAKK", "JORA",
  "THOO", "GULP", "TATA", "AAMA", "ILLY", "ILLI", "KUDU", "PODU", "PARU", "KELU",
  "BABE", "DOOP", "SENA", "MOKK", "SOKK", "KICK", "MAAV", "ROTT", "BAKU", "BEJA",
  "LOOS", "KADU", "PETH", "AATH", "VITI", "VITT", "JUMP", "SCEN", "SUDU", "JALD",
  "NAST", "BEAT", "KUTH", "AADA",
  // 5-Letter
  "NANBA", "MACHI", "MACHA", "THAMB", "MASSU", "GETHU", "SEMMA", "KALAK", "JOLLY",
  "GUMMU", "CHUMM", "APROO", "ENNDA", "ENADI", "AAMAM", "ILLAI", "PINDI", "SOLLA",
  "PAKKU", "VERUP", "GALAT", "MOKKA", "KADUP", "VEVVR", "LOOSU", "SCENE", "BAKRA",
  "JALSA", "ALAPU", "KOOTH", "AATHO", "APADI", "IPADI", "EPADI", "AVANA", "IVALO",
  "ENNAA", "ENGEY", "ANGEA", "IPPOD", "APPOD", "EAPOD", "ORUTH", "ETHUK", "EDHUK",
  "THAGU", "KATTA", "PUDHU", "PAZHA", "PERIA", "CHINN", "DHANX", "SUPER", "KIDDU",
  // 6-Letter
  "NANBAN", "MACHAA", "MACHII", "KALAKK", "CHUMMA", "THAMBI", "KADUPP", "ALAPAR",
  "VERUPP", "LOOSUU", "MORATT", "ARATTA", "KOOTHU", "POYIDU", "VANTHU", "SEIYAR",
  "MOKKAI", "APRAME", "ENNAYA", "AAMAMU", "ILLAIE", "KUDUTH", "PODANM", "PAARRA",
  "KELUGA", "JALSAA", "THAVIL", "KOLLAI", "SCENUU", "ALPARA", "VADAAC", "BABAAS",
  "THOMMA", "NALLAV", "KETTAA", "PERIYV", "CHINNA", "VAVVAL", "POLAPU", "THAPPU",
  "SARIYA", "ILAIYA", "APPADI", "IPPADI", "EPPADI",

  // ==========================================================================
  // 3. KINSHIP, RELATIONSHIPS, COMMUNITY & PEOPLE
  // ==========================================================================
  // 3-Letter
  "THA", "AKK", "ANN", "NAT", "VEY",
  // 4-Letter
  "AMMA", "APPA", "ANNA", "AKKA", "MAMA", "MAMI", "CHIT", "PERI", "MAAP", "THOL",
  "TAAT", "PAAT", "AAYA", "THAI", "ANBU", "GURU", "DADA", "KOOT", "URAV",
  // 5-Letter
  "AMMAV", "APPAV", "PAATI", "THATH", "AKKAA", "ANNAN", "ATHAI", "THANG", "CHITH",
  "PERIY", "MACHU", "NATPU", "PAASA", "NESAM", "MAAMI", "MAAMA", "THOZH", "NANBU",
  "KUDUM", "PILLA", "KUZHA", "AASAN", "MANID", "PENNE", "AANEA", "THALA", "VAYAS",
  // 6-Letter
  "AMMAAA", "APPAAA", "PAATTI", "THAATH", "THANGA", "ANBUDA", "KUDUMB", "THOZHA",
  "THOZHI", "MAAPLE", "ATHAII", "CHITHI", "PERIYA", "KULAND", "PILLAI", "PENKAL",
  "AANKAL", "MAANAV", "GURUVU", "PAASAM", "NESAME", "URAVUG", "BANDHA", "SANGAM",

  // ==========================================================================
  // 4. EVERYDAY VERBS, ACTIONS, DAILY LIFE & HOUSING
  // ==========================================================================
  // 3-Letter
  "TAA", "THO", "POE", "AAZ", "OAD", "PAR", "POD", "KUD",
  // 4-Letter
  "VADI", "PODI", "KUDU", "EDUU", "PODU", "NILU", "ODUU", "AADU", "PADU", "ELUU",
  "PAAR", "KELU", "KUDI", "THIN", "PESU", "EELU", "VAZH", "VEED", "KOOR", "THOON",
  "KATA", "SATT", "PANI", "VELI", "ULLA", "NADU",
  // 5-Letter
  "SOLLU", "KELVI", "VIDAI", "VETRI", "SAKTH", "VEEDU", "VAETT", "PAARU", "PESUU",
  "THINU", "KUDIK", "OADUU", "AADAL", "PAADU", "EZHUT", "PADIK", "THUNR", "NILAV",
  "MUTTR", "THINN", "VAASL", "JALDR", "PANIL", "VELAI", "POZHU", "AAYUL", "NENJU",
  "ULLAM", "KAYIL", "KAALU", "KANNU", "MOOKU", "VAAII", "PALLU", "KURAL",
  // 6-Letter
  "VANTHU", "POYIDU", "PAARGA", "PESUTH", "ELUTHU", "KUDIPU", "AATTAM", "PAATAL",
  "VETTRI", "THUNIV", "MUTRAM", "THINNA", "VAASAL", "JANNAL", "POOMID", "VELAIE",
  "PADIPU", "AASIRI", "SITHIR", "VILASU", "VEETIL", "KUDISI", "MADAMU",

  // ==========================================================================
  // 5. NATURE, WEATHER, FLORA, FAUNA & ELEMENTS
  // ==========================================================================
  // 3-Letter
  "TEE", "MAN", "VIN", "KAL", "AAR", "KAA", "VIL", "PUL",
  // 4-Letter
  "ALAI", "MANI", "KAAT", "NEER", "THEE", "MANN", "VINN", "VAAN", "POOV", "MARA",
  "KADL", "AARU", "KERY", "NERL", "SOOR", "MALA", "VALI", "VILI", "ELAI", "KANI",
  "KAAI", "VITH", "KILU", "MAAD", "AATU", "NAAI", "PUNA", "KILI", "KAAK",
  // 5-Letter
  "KADAL", "MALAI", "MAZHA", "VEYIL", "KAATR", "NILAA", "VAANA", "POOVU", "MARAM",
  "ILAIY", "KANIY", "THANI", "SURIA", "NERUP", "AALAM", "POOMI", "ARUVI", "KULAM",
  "VAYAL", "KAADU", "THOTT", "CHEDI", "KODIY", "KILAI", "VERUG", "PULIY", "SINGA",
  "YAANA", "KUDHI", "AATUK", "PASUV", "MAYIL", "KOYIL",
  // 6-Letter
  "KADALU", "MALAIY", "MAZHAI", "KAATRU", "NILAVU", "SOORIY", "NERUPP", "THALIR",
  "POOKAL", "VANAME", "MEGHAM", "VELICH", "ARUVIY", "KULAMU", "VAYALU", "THOTTA",
  "CHEDIG", "KAADUG", "SINGAM", "PULIYU", "YAANAI", "KUTHIR", "PASUMA", "MAYILU",
  "KOKKUU",

  // ==========================================================================
  // 6. HERITAGE, CULTURE, LITERATURE, ARTS & FESTIVALS
  // ==========================================================================
  // 3-Letter
  "ISY", "EED", "KOL", "OOR",
  // 4-Letter
  "ISAI", "KOLL", "THAL", "URUM", "NADA", "KALA", "VEEN", "PANN", "EZHU", "SANG",
  "THIR", "CHOL", "CHER", "PAND", "PALL", "VAIG", "KAVE", "MADU", "THAN", "CHEN",
  "NELL", "KONG",
  // 5-Letter
  "KOLAM", "CHOLA", "CHERA", "TAMIL", "KURAL", "SANGA", "PULLI", "SIKKU", "KOVIL",
  "GOPUR", "MANDI", "SILAM", "PONNI", "KAVER", "VAIGA", "THANJ", "MADUR", "CHENN",
  "ERODE", "SALEM", "KUTHU", "PAATU", "VEENA", "PARAI", "THALA", "GAANA", "RAGAM",
  "TALAM", "BHAVA", "NATYA", "MELAM", "NADAM", "GEETH", "SWARA", "KOOTH", "DEEPA",
  "PONGA", "CHITH", "AADII", "THAII", "MAASI", "PANGU", "AAVAN", "PURAT", "AIPAS",
  "KARTH", "MARGA", "KAVYA", "NADAK", "THIRU", "VALLU", "ILANG", "KAMBA", "AVVAI",
  "BHARA", "POETR",
  // 6-Letter
  "CHOLAN", "CHERAN", "PANDYA", "PALLAV", "KOLAMS", "KOPURA", "AALAYA", "SILAMB",
  "KAVERI", "VAIGAI", "CHITHI", "AAVANI", "KARTHI", "PANGUN", "MARGAZ", "THAIYE",
  "POOMPU", "MADURA", "THANJA", "NELLAI", "KONGUU", "KUMARI", "KORKAI", "MUTHUU",
  "THIRUK", "SILAPP", "MANIME", "KAMBAN", "AVVAIY", "BHARAT", "NATYAM", "VEENAI",
  "MRIDAN", "GHATAM",

  // ==========================================================================
  // 7. EMOTIONS, VIRTUES, PHILOSOPHY & ABSTRACT THOUGHT
  // ==========================================================================
  // 3-Letter
  "BAY", "KOB", "AAS", "ARU", "VAL", "NIL",
  // 4-Letter
  "ARAM", "AASA", "AASI", "MANA", "BAYM", "KOBM", "NAND", "SIRP", "ALUG", "MOKS",
  "MEIK", "POIK", "UNMA", "VEER", "ACHM", "NAAN", "PAYP",
  // 5-Letter
  "ANBUU", "ARAME", "AASAI", "PAASO", "KOBAM", "BAYAM", "SIRIP", "AZHUG", "MAGIL",
  "NIMMI", "DHAIY", "UNMAI", "POYYI", "VEERM", "ACHAM", "NAANM", "PAAYP", "DHARMA",
  "GNANA", "MOKSH", "SANTH", "AMITH", "THIYAG", "VAAZH",
  // 6-Letter
  "ANBODU", "ARANER", "MAGIZH", "SIRIAP", "SANTHO", "MANAME", "UNMAIE", "VEERAM",
  "ACHAMM", "NAANAM", "PAAYPU", "GNANAM", "KARUNA", "PORUMY",

  // ==========================================================================
  // 8. CINEMA, ICONS & POPULAR LORE
  // ==========================================================================
  // 4-Letter
  "ALEX", "BOSS", "RAJA", "ANIR", "DEVX",
  // 5-Letter
  "ROLEX", "LEOOO", "BILLA", "GHILL", "PADAI", "MUTHU", "SIVAJ", "ENTHI", "KABAL",
  "KAALA", "PETTA", "JAILE", "VIKRA", "KAITH", "ANIRU", "ILAYA", "DEVAA", "YUVAAN",
  "HARRIS",
  // 6-Letter
  "BAASHA", "VIKRAM", "GILLII", "PETTAI", "BILLAA", "ANIRUD", "RAHMNN", "ILAYAR"
].map((w) => w.trim().toUpperCase());

// Backward-compatible export strictly filtering 5-letter words
export const VALIDATED_TANGLISH_5_WORDS: readonly string[] = VALIDATED_TANGLISH_WORDS.filter(
  (w) => w.length === 5
);

const TANGLISH_SET = new Set(VALIDATED_TANGLISH_WORDS);

// Multi-length common English words accepted alongside Tanglish words (3–6 letters)
const COMMON_ENGLISH_WORDS: readonly string[] = [
  // 3-Letter Common English
  "THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL", "ANY", "CAN", "HAD", "HER", "WAS", "ONE", "OUR",
  "OUT", "DAY", "GET", "HAS", "HIM", "HIS", "HOW", "MAN", "NEW", "NOW", "OLD", "SEE", "TWO", "WAY", "WHO",
  "BOY", "DID", "ITS", "LET", "PUT", "SAY", "SHE", "TOO", "USE", "CAT", "DOG", "RED", "SUN", "AIR", "TEA",
  "CUP", "BOX", "BED", "CAR", "EAT", "RUN", "WIN", "TOP", "BIG", "HOT", "WAR", "SET", "END", "FAR", "FLY",
  "KEY", "LAW", "LOW", "PAY", "SEA", "SIX", "TEN", "YES", "YET", "BAG", "BAR", "BIT", "CAP", "CRY", "DRY",
  "EAR", "EYE", "FIT", "GAS", "GOD", "GUN", "HIT", "ICE", "JOB", "LEG", "LIP", "MAP", "NET", "OIL", "PEN",
  "PIG", "POT", "RAW", "ROW", "SKY", "TIE", "TOE", "VAN", "WET", "AGE", "ARM", "ART", "BAD", "BAT", "BUS",

  // 4-Letter Common English
  "THAT", "WITH", "HAVE", "THIS", "WILL", "YOUR", "FROM", "THEY", "KNOW", "WANT", "BEEN", "GOOD", "MUCH", "SOME",
  "TIME", "VERY", "WHEN", "COME", "HERE", "JUST", "LIKE", "LONG", "MAKE", "MANY", "MORE", "ONLY", "OVER", "SUCH",
  "TAKE", "THAN", "THEM", "WELL", "WERE", "WHAT", "YEAR", "BACK", "BOOK", "CALL", "CITY", "DOWN", "EACH", "FIND",
  "GIRL", "HAND", "HEAD", "HOME", "LAST", "LIFE", "LINE", "LOOK", "MADE", "MOST", "MOVE", "NAME", "NEXT", "OPEN",
  "PART", "PLAY", "READ", "SAID", "SAME", "SEEM", "SIDE", "TELL", "TOOK", "WALK", "WORK", "WORD", "AWAY", "BABY",
  "BALL", "BASE", "BEAR", "BEAT", "BEST", "BILL", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BORN", "BOTH", "BUSY",
  "CARE", "CASE", "COLD", "DARK", "DATE", "DAWN", "DEEP", "DESK", "DOOR", "DROP", "DUTY", "EAST", "EASY", "EDGE",
  "EVEN", "FACE", "FACT", "FAIR", "FALL", "FAST", "FEAR", "FEEL", "FEET", "FELL", "FILL", "FILM", "FINE", "FIRE",
  "FISH", "FIVE", "FLAT", "FLOW", "FOOD", "FOOT", "FREE", "FULL", "GAME", "GAVE", "GIFT", "GLAD", "GOLD", "GONE",
  "GROW", "HALF", "HARD", "HEAR", "HEAT", "HELD", "HELP", "HIGH", "HILL", "HOLD", "HOLE", "HOPE", "HOUR", "HUGE",
  "HURT", "IDEA", "INCH", "IRON", "ITEM", "JOIN", "JUMP", "KEEP", "KEPT", "KILL", "KIND", "KING", "KNEE", "KNEW",
  "LADY", "LAID", "LAKE", "LAND", "LATE", "LEAD", "LEFT", "LESS", "LION", "LIST", "LIVE", "LOAD", "LOCK", "LONE",
  "LORD", "LOSE", "LOSS", "LOST", "LOVE", "LUCK", "MAIN", "MARK", "MEAL", "MEAN", "MEET", "MILE", "MILK", "MIND",
  "MINE", "MISS", "MOON", "NEAR", "NECK", "NEED", "NEWS", "NICE", "NINE", "NOON", "NOSE", "NOTE", "OKAY", "ONCE",
  "ONES", "ONTO", "PAGE", "PAIN", "PAIR", "PALE", "PARK", "PASS", "PAST", "PATH", "PEAK", "PICK", "PILE", "PINK",
  "PLAN", "POEM", "POET", "POOL", "POOR", "PORT", "POST", "PRAY", "PULL", "PURE", "PUSH", "RACE", "RAIN", "RANK",
  "RARE", "RATE", "REST", "RICE", "RICH", "RIDE", "RING", "RISE", "RISK", "ROAD", "ROCK", "ROOF", "ROOM", "ROOT",
  "ROSE", "RULE", "RUSH", "SAFE", "SAIL", "SALT", "SAND", "SAVE", "SEAT", "SEED", "SEEK", "SEEN", "SELF", "SEND",
  "SENT", "SHIP", "SHOE", "SHOP", "SHOT", "SHOW", "SHUT", "SICK", "SING", "SINK", "SITE", "SIZE", "SKIN", "SLOW",
  "SNOW", "SOIL", "SOLD", "SOLE", "SONG", "SOON", "SORE", "SOUL", "SPOT", "STAR", "STAY", "STEP", "STOP", "SUIT",
  "SURE", "SWIM", "TALL", "TANK", "TAPE", "TASK", "TEAM", "TEAR", "TERM", "TEST", "TIDE", "TIED", "TIRE", "TOLD",
  "TONE", "TOOL", "TOUR", "TOWN", "TREE", "TRIP", "TRUE", "TUBE", "TUNE", "TURN", "UNIT", "UPON", "VAST", "VIEW",
  "VOTE", "WAGE", "WAIT", "WAKE", "WALL", "WARM", "WARN", "WASH", "WAVE", "WEAK", "WEAR", "WEEK", "WEST", "WIFE",
  "WIND", "WINE", "WING", "WISH", "WOOD", "WOOL", "YARD", "ZERO", "ZONE",

  // 5-Letter Common English (from original validated set)
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
  "WOUND", "WRITE", "WRONG", "YOUTH",

  // 6-Letter Common English
  "ACCEPT", "ACTION", "ACTIVE", "ACTUAL", "ADVICE", "AFRAID", "AGENCY", "AGENDA", "AGREED", "ALMOST",
  "ALWAYS", "AMOUNT", "ANIMAL", "ANNUAL", "ANSWER", "ANYONE", "APPEAL", "APPEAR", "AROUND", "ARRIVE",
  "ARTIST", "ASPECT", "ASSIST", "ASSUME", "ATTACK", "ATTEND", "AUGUST", "AUTHOR", "AVENUE", "BACKED",
  "BARELY", "BATTLE", "BEAUTY", "BECOME", "BEFORE", "BEHIND", "BELIEF", "BELONG", "BESIDE", "BETTER",
  "BEYOND", "BISHOP", "BORDER", "BORROW", "BOTTLE", "BOTTOM", "BOUGHT", "BRANCH", "BREATH", "BRIDGE",
  "BRIGHT", "BROKEN", "BUDGET", "BURDEN", "BUREAU", "BUTTON", "CAMERA", "CAMPUS", "CANCER", "CANDLE",
  "CARBON", "CAREER", "CASTLE", "CASUAL", "CAUGHT", "CENTER", "CENTRE", "CHANCE", "CHANGE", "CHARGE",
  "CHOICE", "CHOOSE", "CHURCH", "CIRCLE", "CLIENT", "CLOSED", "CLOSER", "COFFEE", "COLUMN", "COMBAT",
  "COMING", "COMMON", "COMPLY", "COPPER", "CORNER", "COSTLY", "COUNTY", "COUPLE", "COURSE", "COUSIN",
  "COVERS", "CREATE", "CREDIT", "CRISIS", "CRITIC", "CRUCIAL", "CUSTOM", "DAMAGE", "DANGER", "DEALER",
  "DEBATE", "DECADE", "DECIDE", "DEFEAT", "DEFEND", "DEFINE", "DEGREE", "DEMAND", "DEPEND", "DEPUTY",
  "DESERT", "DESIGN", "DESIRE", "DETAIL", "DETECT", "DEVICE", "DIFFER", "DINNER", "DIRECT", "DOCTOR",
  "DOMAIN", "DOUBLE", "DRIVEN", "DRIVER", "DURING", "EASILY", "EATING", "EDITOR", "EFFECT", "EFFORT",
  "EIGHTH", "EITHER", "ELEVEN", "EMERGE", "EMPIRE", "EMPLOY", "ENABLE", "ENDING", "ENERGY", "ENGAGE",
  "ENGINE", "ENOUGH", "ENSURE", "ENTIRE", "ENTITY", "EQUITY", "ESCAPE", "ESTATE", "ETHNIC", "EXCEED",
  "EXCEPT", "EXCUSE", "EXPAND", "EXPECT", "EXPERT", "EXPORT", "EXTEND", "EXTENT", "FABRIC", "FACING",
  "FACTOR", "FAILED", "FAIRLY", "FALLEN", "FAMILY", "FAMOUS", "FATHER", "FELLOW", "FEMALE", "FIBRE",
  "FIERCE", "FIGURE", "FILING", "FINGER", "FINISH", "FISCAL", "FLIGHT", "FLOWER", "FLYING", "FOLLOW",
  "FORCED", "FOREST", "FORGET", "FORMAL", "FORMAT", "FORMER", "FOSTER", "FOUGHT", "FOURTH", "FREEZE",
  "FRENCH", "FRIEND", "FROZEN", "FUTURE", "GALAXY", "GARDEN", "GATHER", "GENDER", "GENTLE", "GERMAN",
  "GLOBAL", "GOLDEN", "GOVERN", "GROWTH", "GUILTY", "HANDED", "HANDLE", "HAPPEN", "HARDLY", "HEADED",
  "HEALTH", "HEARING", "HEAVEN", "HEIGHT", "HIDDEN", "HOLDER", "HONEST", "HONOUR", "HOPING", "HORROR",
  "HUNGRY", "IMPACT", "IMPORT", "INCOME", "INDEED", "INFANT", "INFORM", "INJURY", "INSIDE", "INTEND",
  "INTENT", "INVEST", "INVITE", "ISLAND", "ITSELF", "JACKET", "JERSEY", "JOCKEY", "JUNIOR", "KILLED",
  "KILLER", "KNIGHT", "LABOUR", "LADDER", "LATEST", "LATTER", "LAUNCH", "LAWYER", "LEADER", "LEAGUE",
  "LEAVES", "LEGACY", "LEGEND", "LENGTH", "LESSON", "LETTER", "LIGHTS", "LIKELY", "LINKED", "LIQUID",
  "LISTEN", "LITTLE", "LIVING", "LOCATE", "LONELY", "LOSING", "LOVELY", "LUXURY", "MAINLY", "MAKING",
  "MANAGE", "MANNER", "MANUAL", "MARGIN", "MARINE", "MARKED", "MARKET", "MARRY", "MARTIN", "MASTER",
  "MATTER", "MATURE", "MEDIUM", "MEMBER", "MEMORY", "MENTAL", "MERELY", "MERGER", "METHOD", "MIDDLE",
  "MINING", "MINUTE", "MIRROR", "MOBILE", "MODERN", "MODEST", "MODIFY", "MODULE", "MOMENT", "MORTAL",
  "MOSTLY", "MOTHER", "MOTION", "MOVING", "MURDER", "MUSEUM", "MUTUAL", "MYSELF", "NATION", "NATIVE",
  "NATURE", "NEARBY", "NEARLY", "NEEDLE", "NIGHTS", "NOBODY", "NORMAL", "NOTICE", "NOTION", "NUMBER",
  "OBJECT", "OBTAIN", "OFFICE", "OFFSET", "ONLINE", "OPENED", "OPPOSE", "OPTION", "ORANGE", "ORIGIN",
  "OUTPUT", "PACKET", "PALACE", "PARENT", "PARISH", "PARTLY", "PATENT", "PATIENT", "PAYING", "PEOPLE",
  "PERIOD", "PERMIT", "PERSON", "PHRASE", "PICKED", "PLANET", "PLAYER", "PLEASE", "PLENTY", "POCKET",
  "POLICE", "POLICY", "POSTAL", "POTATO", "POWDER", "PRAISE", "PRAYER", "PREFER", "PRINCE", "PRISON",
  "PROFIT", "PROMPT", "PROPER", "PROVE", "PUBLIC", "PULLED", "PUPIL", "PURPLE", "PURSUE", "PUZZLE",
  "RACING", "RAISED", "RANDOM", "RARELY", "RATHER", "RATING", "READER", "REALLY", "REASON", "RECALL",
  "RECENT", "RECORD", "REDUCE", "REFORM", "REGARD", "REGIME", "REGION", "RELATE", "RELIEF", "REMAIN",
  "REMOTE", "REMOVE", "REPAIR", "REPEAT", "REPLACE", "REPORT", "RESCUE", "RESIGN", "RESIST", "RESORT",
  "RESULT", "RETAIL", "RETAIN", "RETURN", "REVEAL", "REVIEW", "REWARD", "RIDING", "RISING", "ROBUST",
  "ROLLER", "ROMAN", "RUBBER", "RULING", "RUNNER", "SACRED", "SAFETY", "SALARY", "SAMPLE", "SAVING",
  "SCHEME", "SCHOOL", "SCREEN", "SEARCH", "SEASON", "SECOND", "SECRET", "SECTOR", "SECURE", "SEEING",
  "SELDOM", "SELECT", "SENIOR", "SERIES", "SERVER", "SETTLE", "SEVERE", "SHADOW", "SHARED", "SHIELD",
  "SHRINK", "SIGNAL", "SILENT", "SILVER", "SIMPLE", "SIMPLY", "SINGLE", "SISTER", "SKETCH", "SLIGHT",
  "SLOWLY", "SMOOTH", "SOCIAL", "SOLELY", "SOUGHT", "SOURCE", "SOVIET", "SPEECH", "SPIRIT", "SPOKEN",
  "SPREAD", "SPRING", "SQUARE", "STABLE", "STATUS", "STEADY", "STOLEN", "STRAIN", "STREAM", "STREET",
  "STRESS", "STRICT", "STRIKE", "STRING", "STRONG", "STRUCK", "STUDIO", "SUBMIT", "SUDDEN", "SUFFER",
  "SUMMER", "SUMMIT", "SUPPLY", "SURELY", "SURVEY", "SWITCH", "SYMBOL", "SYSTEM", "TACTIC", "TAKING",
  "TALENT", "TARGET", "TEMPLE", "TENANT", "TENDER", "TENNIS", "THANKS", "THEORY", "THIRTY", "THREAT",
  "THRIVE", "THRUST", "TICKET", "TIMBER", "TIMING", "TISSUE", "TITLED", "TOILET", "TOMATO", "TONGUE",
  "TOWARD", "TRADED", "TRADER", "TRAVEL", "TREATY", "TRENDS", "TRIBAL", "TROPHY", "TUNNEL", "TWELVE",
  "TWENTY", "UNABLE", "UNIQUE", "UNITED", "UNLESS", "UNLIKE", "UPDATE", "UPON", "URGENT", "USEFUL",
  "VALLEY", "VALUED", "VESSEL", "VICTIM", "VICTOR", "VIEWER", "VIRGIN", "VIRTUE", "VISION", "VISUAL",
  "VOLUME", "WALKER", "WANTED", "WARNER", "WARREN", "WASTED", "WEALTH", "WEAPON", "WEEKLY", "WEIGHT",
  "WINDOW", "WINNER", "WINTER", "WISDOM", "WONDER", "WOODEN", "WORKED", "WORKER", "WRITER", "YELLOW"
];

const ENGLISH_SET = new Set(COMMON_ENGLISH_WORDS);

export function isValidSolluGuess(word: string): boolean {
  if (!word) return false;
  const upper = word.trim().toUpperCase();
  if (upper.length < 3 || upper.length > 7) return false;
  return TANGLISH_SET.has(upper) || ENGLISH_SET.has(upper);
}
