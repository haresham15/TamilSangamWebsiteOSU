// src/data/games/strandsData.ts
/**
 * Daily 6×8 Grid Bank for Sol Vettai (Tamil Strands).
 * Every letter belongs to either a theme word or the golden Spangram.
 * 8-directional drag to trace words.
 * 100% verified complete 48-cell partitioning with continuous adjacent coordinate paths.
 */

export interface StrandsWord {
  word: string;
  isSpangram?: boolean;
  cells: Array<{ r: number; c: number }>; // exact coordinates in the 6x8 grid
}

export interface StrandsPuzzle {
  id: string;
  theme: string;
  tamilTheme: string;
  themeClue: string;
  spangramWord: string;
  rows: number; // 8
  cols: number; // 6
  grid: string[][]; // 8 rows of 6 letters
  words: StrandsWord[];
}

export const STRANDS_PUZZLES: StrandsPuzzle[] = [
  {
    "id": "strands-01",
    "theme": "Morning Courtyard Feast",
    "tamilTheme": "காலை டிபன் விருந்து",
    "themeClue": "Traditional tiffin favorites served on a fresh banana leaf",
    "spangramWord": "TIFFIN",
    "rows": 8,
    "cols": 6,
    "grid": [
      [
        "T",
        "I",
        "F",
        "F",
        "I",
        "N"
      ],
      [
        "O",
        "D",
        "I",
        "L",
        "D",
        "I"
      ],
      [
        "S",
        "A",
        "V",
        "A",
        "D",
        "A"
      ],
      [
        "A",
        "G",
        "N",
        "O",
        "P",
        "I"
      ],
      [
        "L",
        "C",
        "H",
        "U",
        "T",
        "N"
      ],
      [
        "P",
        "A",
        "A",
        "K",
        "Y",
        "E"
      ],
      [
        "I",
        "S",
        "A",
        "M",
        "B",
        "A"
      ],
      [
        "A",
        "W",
        "L",
        "A",
        "H",
        "R"
      ]
    ],
    "words": [
      {
        "word": "TIFFIN",
        "isSpangram": true,
        "cells": [
          {
            "r": 0,
            "c": 0
          },
          {
            "r": 0,
            "c": 1
          },
          {
            "r": 0,
            "c": 2
          },
          {
            "r": 0,
            "c": 3
          },
          {
            "r": 0,
            "c": 4
          },
          {
            "r": 0,
            "c": 5
          }
        ]
      },
      {
        "word": "IDLI",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 5
          },
          {
            "r": 1,
            "c": 4
          },
          {
            "r": 1,
            "c": 3
          },
          {
            "r": 1,
            "c": 2
          }
        ]
      },
      {
        "word": "DOSA",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 1
          },
          {
            "r": 1,
            "c": 0
          },
          {
            "r": 2,
            "c": 0
          },
          {
            "r": 2,
            "c": 1
          }
        ]
      },
      {
        "word": "VADAI",
        "isSpangram": false,
        "cells": [
          {
            "r": 2,
            "c": 2
          },
          {
            "r": 2,
            "c": 3
          },
          {
            "r": 2,
            "c": 4
          },
          {
            "r": 2,
            "c": 5
          },
          {
            "r": 3,
            "c": 5
          }
        ]
      },
      {
        "word": "PONGAL",
        "isSpangram": false,
        "cells": [
          {
            "r": 3,
            "c": 4
          },
          {
            "r": 3,
            "c": 3
          },
          {
            "r": 3,
            "c": 2
          },
          {
            "r": 3,
            "c": 1
          },
          {
            "r": 3,
            "c": 0
          },
          {
            "r": 4,
            "c": 0
          }
        ]
      },
      {
        "word": "CHUTNEY",
        "isSpangram": false,
        "cells": [
          {
            "r": 4,
            "c": 1
          },
          {
            "r": 4,
            "c": 2
          },
          {
            "r": 4,
            "c": 3
          },
          {
            "r": 4,
            "c": 4
          },
          {
            "r": 4,
            "c": 5
          },
          {
            "r": 5,
            "c": 5
          },
          {
            "r": 5,
            "c": 4
          }
        ]
      },
      {
        "word": "KAAPI",
        "isSpangram": false,
        "cells": [
          {
            "r": 5,
            "c": 3
          },
          {
            "r": 5,
            "c": 2
          },
          {
            "r": 5,
            "c": 1
          },
          {
            "r": 5,
            "c": 0
          },
          {
            "r": 6,
            "c": 0
          }
        ]
      },
      {
        "word": "SAMBAR",
        "isSpangram": false,
        "cells": [
          {
            "r": 6,
            "c": 1
          },
          {
            "r": 6,
            "c": 2
          },
          {
            "r": 6,
            "c": 3
          },
          {
            "r": 6,
            "c": 4
          },
          {
            "r": 6,
            "c": 5
          },
          {
            "r": 7,
            "c": 5
          }
        ]
      },
      {
        "word": "HALWA",
        "isSpangram": false,
        "cells": [
          {
            "r": 7,
            "c": 4
          },
          {
            "r": 7,
            "c": 3
          },
          {
            "r": 7,
            "c": 2
          },
          {
            "r": 7,
            "c": 1
          },
          {
            "r": 7,
            "c": 0
          }
        ]
      }
    ]
  },
  {
    "id": "strands-02",
    "theme": "Chola Imperial Glory",
    "tamilTheme": "சோழர் பேரரசு",
    "themeClue": "The architecture, rulers, and capital of the Cholas",
    "spangramWord": "DYNASTY",
    "rows": 8,
    "cols": 6,
    "grid": [
      [
        "D",
        "Y",
        "N",
        "A",
        "S",
        "T"
      ],
      [
        "A",
        "L",
        "O",
        "H",
        "C",
        "Y"
      ],
      [
        "S",
        "T",
        "H",
        "A",
        "N",
        "J"
      ],
      [
        "O",
        "K",
        "R",
        "U",
        "V",
        "A"
      ],
      [
        "V",
        "I",
        "L",
        "G",
        "A",
        "N"
      ],
      [
        "T",
        "A",
        "P",
        "I",
        "A",
        "G"
      ],
      [
        "T",
        "U",
        "E",
        "M",
        "P",
        "I"
      ],
      [
        "A",
        "J",
        "A",
        "R",
        "E",
        "R"
      ]
    ],
    "words": [
      {
        "word": "DYNASTY",
        "isSpangram": true,
        "cells": [
          {
            "r": 0,
            "c": 0
          },
          {
            "r": 0,
            "c": 1
          },
          {
            "r": 0,
            "c": 2
          },
          {
            "r": 0,
            "c": 3
          },
          {
            "r": 0,
            "c": 4
          },
          {
            "r": 0,
            "c": 5
          },
          {
            "r": 1,
            "c": 5
          }
        ]
      },
      {
        "word": "CHOLAS",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 4
          },
          {
            "r": 1,
            "c": 3
          },
          {
            "r": 1,
            "c": 2
          },
          {
            "r": 1,
            "c": 1
          },
          {
            "r": 1,
            "c": 0
          },
          {
            "r": 2,
            "c": 0
          }
        ]
      },
      {
        "word": "THANJAVUR",
        "isSpangram": false,
        "cells": [
          {
            "r": 2,
            "c": 1
          },
          {
            "r": 2,
            "c": 2
          },
          {
            "r": 2,
            "c": 3
          },
          {
            "r": 2,
            "c": 4
          },
          {
            "r": 2,
            "c": 5
          },
          {
            "r": 3,
            "c": 5
          },
          {
            "r": 3,
            "c": 4
          },
          {
            "r": 3,
            "c": 3
          },
          {
            "r": 3,
            "c": 2
          }
        ]
      },
      {
        "word": "KOVIL",
        "isSpangram": false,
        "cells": [
          {
            "r": 3,
            "c": 1
          },
          {
            "r": 3,
            "c": 0
          },
          {
            "r": 4,
            "c": 0
          },
          {
            "r": 4,
            "c": 1
          },
          {
            "r": 4,
            "c": 2
          }
        ]
      },
      {
        "word": "GANGAI",
        "isSpangram": false,
        "cells": [
          {
            "r": 4,
            "c": 3
          },
          {
            "r": 4,
            "c": 4
          },
          {
            "r": 4,
            "c": 5
          },
          {
            "r": 5,
            "c": 5
          },
          {
            "r": 5,
            "c": 4
          },
          {
            "r": 5,
            "c": 3
          }
        ]
      },
      {
        "word": "PATTU",
        "isSpangram": false,
        "cells": [
          {
            "r": 5,
            "c": 2
          },
          {
            "r": 5,
            "c": 1
          },
          {
            "r": 5,
            "c": 0
          },
          {
            "r": 6,
            "c": 0
          },
          {
            "r": 6,
            "c": 1
          }
        ]
      },
      {
        "word": "EMPIRE",
        "isSpangram": false,
        "cells": [
          {
            "r": 6,
            "c": 2
          },
          {
            "r": 6,
            "c": 3
          },
          {
            "r": 6,
            "c": 4
          },
          {
            "r": 6,
            "c": 5
          },
          {
            "r": 7,
            "c": 5
          },
          {
            "r": 7,
            "c": 4
          }
        ]
      },
      {
        "word": "RAJA",
        "isSpangram": false,
        "cells": [
          {
            "r": 7,
            "c": 3
          },
          {
            "r": 7,
            "c": 2
          },
          {
            "r": 7,
            "c": 1
          },
          {
            "r": 7,
            "c": 0
          }
        ]
      }
    ]
  },
  {
    "id": "strands-03",
    "theme": "Carnatic Kutcheri",
    "tamilTheme": "கர்நாடக இசை கச்சேரி",
    "themeClue": "Classical vocal and instrumental traditions of the Margazhi season",
    "spangramWord": "CARNATIC",
    "rows": 8,
    "cols": 6,
    "grid": [
      [
        "C",
        "A",
        "R",
        "N",
        "A",
        "T"
      ],
      [
        "N",
        "E",
        "E",
        "V",
        "C",
        "I"
      ],
      [
        "A",
        "G",
        "H",
        "A",
        "T",
        "A"
      ],
      [
        "T",
        "A",
        "G",
        "A",
        "R",
        "M"
      ],
      [
        "A",
        "L",
        "A",
        "S",
        "H",
        "R"
      ],
      [
        "M",
        "A",
        "T",
        "I",
        "T",
        "U"
      ],
      [
        "B",
        "U",
        "R",
        "A",
        "S",
        "K"
      ],
      [
        "A",
        "R",
        "I",
        "J",
        "N",
        "A"
      ]
    ],
    "words": [
      {
        "word": "CARNATIC",
        "isSpangram": true,
        "cells": [
          {
            "r": 0,
            "c": 0
          },
          {
            "r": 0,
            "c": 1
          },
          {
            "r": 0,
            "c": 2
          },
          {
            "r": 0,
            "c": 3
          },
          {
            "r": 0,
            "c": 4
          },
          {
            "r": 0,
            "c": 5
          },
          {
            "r": 1,
            "c": 5
          },
          {
            "r": 1,
            "c": 4
          }
        ]
      },
      {
        "word": "VEENA",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 3
          },
          {
            "r": 1,
            "c": 2
          },
          {
            "r": 1,
            "c": 1
          },
          {
            "r": 1,
            "c": 0
          },
          {
            "r": 2,
            "c": 0
          }
        ]
      },
      {
        "word": "GHATAM",
        "isSpangram": false,
        "cells": [
          {
            "r": 2,
            "c": 1
          },
          {
            "r": 2,
            "c": 2
          },
          {
            "r": 2,
            "c": 3
          },
          {
            "r": 2,
            "c": 4
          },
          {
            "r": 2,
            "c": 5
          },
          {
            "r": 3,
            "c": 5
          }
        ]
      },
      {
        "word": "RAGA",
        "isSpangram": false,
        "cells": [
          {
            "r": 3,
            "c": 4
          },
          {
            "r": 3,
            "c": 3
          },
          {
            "r": 3,
            "c": 2
          },
          {
            "r": 3,
            "c": 1
          }
        ]
      },
      {
        "word": "TALA",
        "isSpangram": false,
        "cells": [
          {
            "r": 3,
            "c": 0
          },
          {
            "r": 4,
            "c": 0
          },
          {
            "r": 4,
            "c": 1
          },
          {
            "r": 4,
            "c": 2
          }
        ]
      },
      {
        "word": "SHRUTI",
        "isSpangram": false,
        "cells": [
          {
            "r": 4,
            "c": 3
          },
          {
            "r": 4,
            "c": 4
          },
          {
            "r": 4,
            "c": 5
          },
          {
            "r": 5,
            "c": 5
          },
          {
            "r": 5,
            "c": 4
          },
          {
            "r": 5,
            "c": 3
          }
        ]
      },
      {
        "word": "TAMBURAS",
        "isSpangram": false,
        "cells": [
          {
            "r": 5,
            "c": 2
          },
          {
            "r": 5,
            "c": 1
          },
          {
            "r": 5,
            "c": 0
          },
          {
            "r": 6,
            "c": 0
          },
          {
            "r": 6,
            "c": 1
          },
          {
            "r": 6,
            "c": 2
          },
          {
            "r": 6,
            "c": 3
          },
          {
            "r": 6,
            "c": 4
          }
        ]
      },
      {
        "word": "KANJIRA",
        "isSpangram": false,
        "cells": [
          {
            "r": 6,
            "c": 5
          },
          {
            "r": 7,
            "c": 5
          },
          {
            "r": 7,
            "c": 4
          },
          {
            "r": 7,
            "c": 3
          },
          {
            "r": 7,
            "c": 2
          },
          {
            "r": 7,
            "c": 1
          },
          {
            "r": 7,
            "c": 0
          }
        ]
      }
    ]
  },
  {
    "id": "strands-04",
    "theme": "Festive Sweet Shop",
    "tamilTheme": "தித்திக்கும் பலகாரங்கள்",
    "themeClue": "Traditional ghee sweets and festive treats",
    "spangramWord": "SWEETS",
    "rows": 8,
    "cols": 6,
    "grid": [
      [
        "S",
        "W",
        "E",
        "E",
        "T",
        "S"
      ],
      [
        "L",
        "A",
        "W",
        "L",
        "A",
        "H"
      ],
      [
        "A",
        "D",
        "D",
        "U",
        "J",
        "A"
      ],
      [
        "E",
        "K",
        "I",
        "R",
        "G",
        "N"
      ],
      [
        "S",
        "A",
        "R",
        "I",
        "P",
        "A"
      ],
      [
        "M",
        "M",
        "A",
        "S",
        "A",
        "Y"
      ],
      [
        "Y",
        "S",
        "O",
        "R",
        "E",
        "P"
      ],
      [
        "I",
        "L",
        "O",
        "P",
        "K",
        "A"
      ]
    ],
    "words": [
      {
        "word": "SWEETS",
        "isSpangram": true,
        "cells": [
          {
            "r": 0,
            "c": 0
          },
          {
            "r": 0,
            "c": 1
          },
          {
            "r": 0,
            "c": 2
          },
          {
            "r": 0,
            "c": 3
          },
          {
            "r": 0,
            "c": 4
          },
          {
            "r": 0,
            "c": 5
          }
        ]
      },
      {
        "word": "HALWA",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 5
          },
          {
            "r": 1,
            "c": 4
          },
          {
            "r": 1,
            "c": 3
          },
          {
            "r": 1,
            "c": 2
          },
          {
            "r": 1,
            "c": 1
          }
        ]
      },
      {
        "word": "LADDU",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 0
          },
          {
            "r": 2,
            "c": 0
          },
          {
            "r": 2,
            "c": 1
          },
          {
            "r": 2,
            "c": 2
          },
          {
            "r": 2,
            "c": 3
          }
        ]
      },
      {
        "word": "JANGRI",
        "isSpangram": false,
        "cells": [
          {
            "r": 2,
            "c": 4
          },
          {
            "r": 2,
            "c": 5
          },
          {
            "r": 3,
            "c": 5
          },
          {
            "r": 3,
            "c": 4
          },
          {
            "r": 3,
            "c": 3
          },
          {
            "r": 3,
            "c": 2
          }
        ]
      },
      {
        "word": "KESARI",
        "isSpangram": false,
        "cells": [
          {
            "r": 3,
            "c": 1
          },
          {
            "r": 3,
            "c": 0
          },
          {
            "r": 4,
            "c": 0
          },
          {
            "r": 4,
            "c": 1
          },
          {
            "r": 4,
            "c": 2
          },
          {
            "r": 4,
            "c": 3
          }
        ]
      },
      {
        "word": "PAYASAM",
        "isSpangram": false,
        "cells": [
          {
            "r": 4,
            "c": 4
          },
          {
            "r": 4,
            "c": 5
          },
          {
            "r": 5,
            "c": 5
          },
          {
            "r": 5,
            "c": 4
          },
          {
            "r": 5,
            "c": 3
          },
          {
            "r": 5,
            "c": 2
          },
          {
            "r": 5,
            "c": 1
          }
        ]
      },
      {
        "word": "MYSOREPAK",
        "isSpangram": false,
        "cells": [
          {
            "r": 5,
            "c": 0
          },
          {
            "r": 6,
            "c": 0
          },
          {
            "r": 6,
            "c": 1
          },
          {
            "r": 6,
            "c": 2
          },
          {
            "r": 6,
            "c": 3
          },
          {
            "r": 6,
            "c": 4
          },
          {
            "r": 6,
            "c": 5
          },
          {
            "r": 7,
            "c": 5
          },
          {
            "r": 7,
            "c": 4
          }
        ]
      },
      {
        "word": "POLI",
        "isSpangram": false,
        "cells": [
          {
            "r": 7,
            "c": 3
          },
          {
            "r": 7,
            "c": 2
          },
          {
            "r": 7,
            "c": 1
          },
          {
            "r": 7,
            "c": 0
          }
        ]
      }
    ]
  },
  {
    "id": "strands-05",
    "theme": "Sangam Five Landscapes",
    "tamilTheme": "ஐந்திணை நிலங்கள்",
    "themeClue": "Ancient Tamil Tolkappiyam poetics of nature and emotion",
    "spangramWord": "THINAIGAL",
    "rows": 8,
    "cols": 6,
    "grid": [
      [
        "T",
        "H",
        "I",
        "N",
        "A",
        "I"
      ],
      [
        "R",
        "U",
        "K",
        "L",
        "A",
        "G"
      ],
      [
        "I",
        "N",
        "J",
        "I",
        "M",
        "U"
      ],
      [
        "A",
        "M",
        "I",
        "A",
        "L",
        "L"
      ],
      [
        "R",
        "U",
        "T",
        "H",
        "A",
        "M"
      ],
      [
        "A",
        "H",
        "T",
        "I",
        "E",
        "N"
      ],
      [
        "L",
        "P",
        "A",
        "A",
        "L",
        "A"
      ],
      [
        "L",
        "I",
        "M",
        "A",
        "T",
        "I"
      ]
    ],
    "words": [
      {
        "word": "THINAIGAL",
        "isSpangram": true,
        "cells": [
          {
            "r": 0,
            "c": 0
          },
          {
            "r": 0,
            "c": 1
          },
          {
            "r": 0,
            "c": 2
          },
          {
            "r": 0,
            "c": 3
          },
          {
            "r": 0,
            "c": 4
          },
          {
            "r": 0,
            "c": 5
          },
          {
            "r": 1,
            "c": 5
          },
          {
            "r": 1,
            "c": 4
          },
          {
            "r": 1,
            "c": 3
          }
        ]
      },
      {
        "word": "KURINJI",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 2
          },
          {
            "r": 1,
            "c": 1
          },
          {
            "r": 1,
            "c": 0
          },
          {
            "r": 2,
            "c": 0
          },
          {
            "r": 2,
            "c": 1
          },
          {
            "r": 2,
            "c": 2
          },
          {
            "r": 2,
            "c": 3
          }
        ]
      },
      {
        "word": "MULLAI",
        "isSpangram": false,
        "cells": [
          {
            "r": 2,
            "c": 4
          },
          {
            "r": 2,
            "c": 5
          },
          {
            "r": 3,
            "c": 5
          },
          {
            "r": 3,
            "c": 4
          },
          {
            "r": 3,
            "c": 3
          },
          {
            "r": 3,
            "c": 2
          }
        ]
      },
      {
        "word": "MARUTHAM",
        "isSpangram": false,
        "cells": [
          {
            "r": 3,
            "c": 1
          },
          {
            "r": 3,
            "c": 0
          },
          {
            "r": 4,
            "c": 0
          },
          {
            "r": 4,
            "c": 1
          },
          {
            "r": 4,
            "c": 2
          },
          {
            "r": 4,
            "c": 3
          },
          {
            "r": 4,
            "c": 4
          },
          {
            "r": 4,
            "c": 5
          }
        ]
      },
      {
        "word": "NEITHAL",
        "isSpangram": false,
        "cells": [
          {
            "r": 5,
            "c": 5
          },
          {
            "r": 5,
            "c": 4
          },
          {
            "r": 5,
            "c": 3
          },
          {
            "r": 5,
            "c": 2
          },
          {
            "r": 5,
            "c": 1
          },
          {
            "r": 5,
            "c": 0
          },
          {
            "r": 6,
            "c": 0
          }
        ]
      },
      {
        "word": "PAALAI",
        "isSpangram": false,
        "cells": [
          {
            "r": 6,
            "c": 1
          },
          {
            "r": 6,
            "c": 2
          },
          {
            "r": 6,
            "c": 3
          },
          {
            "r": 6,
            "c": 4
          },
          {
            "r": 6,
            "c": 5
          },
          {
            "r": 7,
            "c": 5
          }
        ]
      },
      {
        "word": "TAMIL",
        "isSpangram": false,
        "cells": [
          {
            "r": 7,
            "c": 4
          },
          {
            "r": 7,
            "c": 3
          },
          {
            "r": 7,
            "c": 2
          },
          {
            "r": 7,
            "c": 1
          },
          {
            "r": 7,
            "c": 0
          }
        ]
      }
    ]
  },
  {
    "id": "strands-06",
    "theme": "Harvest Pongal Splendor",
    "tamilTheme": "தைப்பொங்கல் திருநாள்",
    "themeClue": "Four-day celebration of agriculture, cattle, and the sun",
    "spangramWord": "HARVEST",
    "rows": 8,
    "cols": 6,
    "grid": [
      [
        "H",
        "A",
        "R",
        "V",
        "E",
        "S"
      ],
      [
        "A",
        "G",
        "N",
        "O",
        "P",
        "T"
      ],
      [
        "L",
        "K",
        "A",
        "R",
        "U",
        "M"
      ],
      [
        "T",
        "A",
        "A",
        "M",
        "U",
        "B"
      ],
      [
        "U",
        "B",
        "H",
        "O",
        "G",
        "I"
      ],
      [
        "T",
        "A",
        "Y",
        "R",
        "U",
        "S"
      ],
      [
        "U",
        "R",
        "M",
        "E",
        "R",
        "I"
      ],
      [
        "U",
        "K",
        "N",
        "A",
        "P",
        "C"
      ]
    ],
    "words": [
      {
        "word": "HARVEST",
        "isSpangram": true,
        "cells": [
          {
            "r": 0,
            "c": 0
          },
          {
            "r": 0,
            "c": 1
          },
          {
            "r": 0,
            "c": 2
          },
          {
            "r": 0,
            "c": 3
          },
          {
            "r": 0,
            "c": 4
          },
          {
            "r": 0,
            "c": 5
          },
          {
            "r": 1,
            "c": 5
          }
        ]
      },
      {
        "word": "PONGAL",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 4
          },
          {
            "r": 1,
            "c": 3
          },
          {
            "r": 1,
            "c": 2
          },
          {
            "r": 1,
            "c": 1
          },
          {
            "r": 1,
            "c": 0
          },
          {
            "r": 2,
            "c": 0
          }
        ]
      },
      {
        "word": "KARUMBU",
        "isSpangram": false,
        "cells": [
          {
            "r": 2,
            "c": 1
          },
          {
            "r": 2,
            "c": 2
          },
          {
            "r": 2,
            "c": 3
          },
          {
            "r": 2,
            "c": 4
          },
          {
            "r": 2,
            "c": 5
          },
          {
            "r": 3,
            "c": 5
          },
          {
            "r": 3,
            "c": 4
          }
        ]
      },
      {
        "word": "MAATU",
        "isSpangram": false,
        "cells": [
          {
            "r": 3,
            "c": 3
          },
          {
            "r": 3,
            "c": 2
          },
          {
            "r": 3,
            "c": 1
          },
          {
            "r": 3,
            "c": 0
          },
          {
            "r": 4,
            "c": 0
          }
        ]
      },
      {
        "word": "BHOGI",
        "isSpangram": false,
        "cells": [
          {
            "r": 4,
            "c": 1
          },
          {
            "r": 4,
            "c": 2
          },
          {
            "r": 4,
            "c": 3
          },
          {
            "r": 4,
            "c": 4
          },
          {
            "r": 4,
            "c": 5
          }
        ]
      },
      {
        "word": "SURYA",
        "isSpangram": false,
        "cells": [
          {
            "r": 5,
            "c": 5
          },
          {
            "r": 5,
            "c": 4
          },
          {
            "r": 5,
            "c": 3
          },
          {
            "r": 5,
            "c": 2
          },
          {
            "r": 5,
            "c": 1
          }
        ]
      },
      {
        "word": "TURMERIC",
        "isSpangram": false,
        "cells": [
          {
            "r": 5,
            "c": 0
          },
          {
            "r": 6,
            "c": 0
          },
          {
            "r": 6,
            "c": 1
          },
          {
            "r": 6,
            "c": 2
          },
          {
            "r": 6,
            "c": 3
          },
          {
            "r": 6,
            "c": 4
          },
          {
            "r": 6,
            "c": 5
          },
          {
            "r": 7,
            "c": 5
          }
        ]
      },
      {
        "word": "PANKU",
        "isSpangram": false,
        "cells": [
          {
            "r": 7,
            "c": 4
          },
          {
            "r": 7,
            "c": 3
          },
          {
            "r": 7,
            "c": 2
          },
          {
            "r": 7,
            "c": 1
          },
          {
            "r": 7,
            "c": 0
          }
        ]
      }
    ]
  },
  {
    "id": "strands-07",
    "theme": "Ancient Tamil Capitals",
    "tamilTheme": "பண்டைய தமிழ் தலைநகரங்கள்",
    "themeClue": "Historic royal seats of the Cheras, Cholas, and Pandyas",
    "spangramWord": "CAPITALS",
    "rows": 8,
    "cols": 6,
    "grid": [
      [
        "C",
        "A",
        "P",
        "I",
        "T",
        "A"
      ],
      [
        "U",
        "D",
        "A",
        "M",
        "S",
        "L"
      ],
      [
        "R",
        "A",
        "I",
        "T",
        "H",
        "A"
      ],
      [
        "R",
        "U",
        "V",
        "A",
        "J",
        "N"
      ],
      [
        "K",
        "A",
        "N",
        "C",
        "H",
        "I"
      ],
      [
        "I",
        "A",
        "K",
        "R",
        "O",
        "K"
      ],
      [
        "P",
        "A",
        "N",
        "D",
        "Y",
        "A"
      ],
      [
        "S",
        "A",
        "L",
        "O",
        "H",
        "C"
      ]
    ],
    "words": [
      {
        "word": "CAPITALS",
        "isSpangram": true,
        "cells": [
          {
            "r": 0,
            "c": 0
          },
          {
            "r": 0,
            "c": 1
          },
          {
            "r": 0,
            "c": 2
          },
          {
            "r": 0,
            "c": 3
          },
          {
            "r": 0,
            "c": 4
          },
          {
            "r": 0,
            "c": 5
          },
          {
            "r": 1,
            "c": 5
          },
          {
            "r": 1,
            "c": 4
          }
        ]
      },
      {
        "word": "MADURAI",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 3
          },
          {
            "r": 1,
            "c": 2
          },
          {
            "r": 1,
            "c": 1
          },
          {
            "r": 1,
            "c": 0
          },
          {
            "r": 2,
            "c": 0
          },
          {
            "r": 2,
            "c": 1
          },
          {
            "r": 2,
            "c": 2
          }
        ]
      },
      {
        "word": "THANJAVUR",
        "isSpangram": false,
        "cells": [
          {
            "r": 2,
            "c": 3
          },
          {
            "r": 2,
            "c": 4
          },
          {
            "r": 2,
            "c": 5
          },
          {
            "r": 3,
            "c": 5
          },
          {
            "r": 3,
            "c": 4
          },
          {
            "r": 3,
            "c": 3
          },
          {
            "r": 3,
            "c": 2
          },
          {
            "r": 3,
            "c": 1
          },
          {
            "r": 3,
            "c": 0
          }
        ]
      },
      {
        "word": "KANCHI",
        "isSpangram": false,
        "cells": [
          {
            "r": 4,
            "c": 0
          },
          {
            "r": 4,
            "c": 1
          },
          {
            "r": 4,
            "c": 2
          },
          {
            "r": 4,
            "c": 3
          },
          {
            "r": 4,
            "c": 4
          },
          {
            "r": 4,
            "c": 5
          }
        ]
      },
      {
        "word": "KORKAI",
        "isSpangram": false,
        "cells": [
          {
            "r": 5,
            "c": 5
          },
          {
            "r": 5,
            "c": 4
          },
          {
            "r": 5,
            "c": 3
          },
          {
            "r": 5,
            "c": 2
          },
          {
            "r": 5,
            "c": 1
          },
          {
            "r": 5,
            "c": 0
          }
        ]
      },
      {
        "word": "PANDYA",
        "isSpangram": false,
        "cells": [
          {
            "r": 6,
            "c": 0
          },
          {
            "r": 6,
            "c": 1
          },
          {
            "r": 6,
            "c": 2
          },
          {
            "r": 6,
            "c": 3
          },
          {
            "r": 6,
            "c": 4
          },
          {
            "r": 6,
            "c": 5
          }
        ]
      },
      {
        "word": "CHOLAS",
        "isSpangram": false,
        "cells": [
          {
            "r": 7,
            "c": 5
          },
          {
            "r": 7,
            "c": 4
          },
          {
            "r": 7,
            "c": 3
          },
          {
            "r": 7,
            "c": 2
          },
          {
            "r": 7,
            "c": 1
          },
          {
            "r": 7,
            "c": 0
          }
        ]
      }
    ]
  },
  {
    "id": "strands-08",
    "theme": "Kollywood Superstars",
    "tamilTheme": "தமிழ் திரையுலக நாயகர்கள்",
    "themeClue": "Celebrated icons and directors of Tamil cinema",
    "spangramWord": "CINEMA",
    "rows": 8,
    "cols": 6,
    "grid": [
      [
        "C",
        "I",
        "N",
        "E",
        "M",
        "A"
      ],
      [
        "I",
        "N",
        "I",
        "J",
        "A",
        "R"
      ],
      [
        "K",
        "A",
        "N",
        "T",
        "H",
        "K"
      ],
      [
        "A",
        "H",
        "L",
        "A",
        "M",
        "A"
      ],
      [
        "A",
        "S",
        "A",
        "N",
        "V",
        "I"
      ],
      [
        "I",
        "J",
        "A",
        "Y",
        "A",
        "J"
      ],
      [
        "T",
        "H",
        "S",
        "U",
        "R",
        "I"
      ],
      [
        "O",
        "R",
        "E",
        "H",
        "A",
        "Y"
      ]
    ],
    "words": [
      {
        "word": "CINEMA",
        "isSpangram": true,
        "cells": [
          {
            "r": 0,
            "c": 0
          },
          {
            "r": 0,
            "c": 1
          },
          {
            "r": 0,
            "c": 2
          },
          {
            "r": 0,
            "c": 3
          },
          {
            "r": 0,
            "c": 4
          },
          {
            "r": 0,
            "c": 5
          }
        ]
      },
      {
        "word": "RAJINIKANTH",
        "isSpangram": false,
        "cells": [
          {
            "r": 1,
            "c": 5
          },
          {
            "r": 1,
            "c": 4
          },
          {
            "r": 1,
            "c": 3
          },
          {
            "r": 1,
            "c": 2
          },
          {
            "r": 1,
            "c": 1
          },
          {
            "r": 1,
            "c": 0
          },
          {
            "r": 2,
            "c": 0
          },
          {
            "r": 2,
            "c": 1
          },
          {
            "r": 2,
            "c": 2
          },
          {
            "r": 2,
            "c": 3
          },
          {
            "r": 2,
            "c": 4
          }
        ]
      },
      {
        "word": "KAMALHAASAN",
        "isSpangram": false,
        "cells": [
          {
            "r": 2,
            "c": 5
          },
          {
            "r": 3,
            "c": 5
          },
          {
            "r": 3,
            "c": 4
          },
          {
            "r": 3,
            "c": 3
          },
          {
            "r": 3,
            "c": 2
          },
          {
            "r": 3,
            "c": 1
          },
          {
            "r": 3,
            "c": 0
          },
          {
            "r": 4,
            "c": 0
          },
          {
            "r": 4,
            "c": 1
          },
          {
            "r": 4,
            "c": 2
          },
          {
            "r": 4,
            "c": 3
          }
        ]
      },
      {
        "word": "VIJAY",
        "isSpangram": false,
        "cells": [
          {
            "r": 4,
            "c": 4
          },
          {
            "r": 4,
            "c": 5
          },
          {
            "r": 5,
            "c": 5
          },
          {
            "r": 5,
            "c": 4
          },
          {
            "r": 5,
            "c": 3
          }
        ]
      },
      {
        "word": "AJITH",
        "isSpangram": false,
        "cells": [
          {
            "r": 5,
            "c": 2
          },
          {
            "r": 5,
            "c": 1
          },
          {
            "r": 5,
            "c": 0
          },
          {
            "r": 6,
            "c": 0
          },
          {
            "r": 6,
            "c": 1
          }
        ]
      },
      {
        "word": "SURIYA",
        "isSpangram": false,
        "cells": [
          {
            "r": 6,
            "c": 2
          },
          {
            "r": 6,
            "c": 3
          },
          {
            "r": 6,
            "c": 4
          },
          {
            "r": 6,
            "c": 5
          },
          {
            "r": 7,
            "c": 5
          },
          {
            "r": 7,
            "c": 4
          }
        ]
      },
      {
        "word": "HERO",
        "isSpangram": false,
        "cells": [
          {
            "r": 7,
            "c": 3
          },
          {
            "r": 7,
            "c": 2
          },
          {
            "r": 7,
            "c": 1
          },
          {
            "r": 7,
            "c": 0
          }
        ]
      }
    ]
  }
];

export function getDailyStrands(seedStr: string): StrandsPuzzle {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % STRANDS_PUZZLES.length;
  return STRANDS_PUZZLES[idx];
}
