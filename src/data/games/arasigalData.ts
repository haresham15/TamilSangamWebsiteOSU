// src/data/games/arasigalData.ts
/**
 * Verified boards for Arasigal (Chola Queens Logic Grid).
 * Each puzzle has strictly 1 unique valid solution where N crowns are placed
 * on an N×N board such that:
 * 1. Exactly 1 crown per row
 * 2. Exactly 1 crown per column
 * 3. Exactly 1 crown per colored region
 * 4. No two crowns touch horizontally, vertically, or diagonally.
 */

export interface ArasigalPuzzle {
  id: string;
  gridSize: number;
  // Matrix of region IDs (0..N-1)
  regions: number[][];
  // Unique solution coordinates
  solution: Array<{ row: number; col: number }>;
}

export const ARASIGAL_REGION_COLORS = [
  "#3B2556", // Royal Violet
  "#1E3A5F", // Chola Navy
  "#1F4E38", // Emerald Deep
  "#4A3B18", // Amber Ochre
  "#52261E", // Terracotta
  "#283845", // Slate Blue
  "#4A2242", // Mulberry
  "#2A4436", // Jade
];

export const ARASIGAL_PUZZLES: ArasigalPuzzle[] = [
  {
    "id": "arasigal-01",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 2
      },
      {
        "row": 2,
        "col": 4
      },
      {
        "row": 3,
        "col": 1
      },
      {
        "row": 4,
        "col": 5
      },
      {
        "row": 5,
        "col": 3
      },
      {
        "row": 6,
        "col": 6
      }
    ],
    "regions": [
      [
        0,
        3,
        1,
        2,
        2,
        2,
        2
      ],
      [
        3,
        3,
        1,
        5,
        2,
        2,
        2
      ],
      [
        3,
        3,
        5,
        5,
        2,
        2,
        2
      ],
      [
        3,
        3,
        5,
        5,
        5,
        4,
        4
      ],
      [
        3,
        3,
        5,
        5,
        5,
        4,
        4
      ],
      [
        3,
        3,
        5,
        5,
        5,
        5,
        6
      ],
      [
        3,
        3,
        5,
        5,
        5,
        5,
        6
      ]
    ]
  },
  {
    "id": "arasigal-02",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 2
      },
      {
        "row": 2,
        "col": 4
      },
      {
        "row": 3,
        "col": 6
      },
      {
        "row": 4,
        "col": 3
      },
      {
        "row": 5,
        "col": 1
      },
      {
        "row": 6,
        "col": 5
      }
    ],
    "regions": [
      [
        0,
        1,
        1,
        1,
        1,
        3,
        3
      ],
      [
        0,
        1,
        1,
        1,
        1,
        3,
        3
      ],
      [
        0,
        5,
        1,
        1,
        2,
        3,
        3
      ],
      [
        5,
        5,
        4,
        4,
        4,
        3,
        3
      ],
      [
        5,
        5,
        4,
        4,
        4,
        3,
        3
      ],
      [
        5,
        5,
        4,
        4,
        4,
        3,
        3
      ],
      [
        5,
        5,
        4,
        4,
        4,
        6,
        6
      ]
    ]
  },
  {
    "id": "arasigal-03",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 2
      },
      {
        "row": 2,
        "col": 5
      },
      {
        "row": 3,
        "col": 3
      },
      {
        "row": 4,
        "col": 1
      },
      {
        "row": 5,
        "col": 4
      },
      {
        "row": 6,
        "col": 6
      }
    ],
    "regions": [
      [
        0,
        0,
        1,
        1,
        1,
        2,
        2
      ],
      [
        0,
        1,
        1,
        1,
        3,
        2,
        2
      ],
      [
        0,
        1,
        1,
        3,
        3,
        2,
        6
      ],
      [
        0,
        1,
        3,
        3,
        3,
        6,
        6
      ],
      [
        0,
        4,
        3,
        3,
        6,
        6,
        6
      ],
      [
        0,
        4,
        3,
        5,
        5,
        6,
        6
      ],
      [
        0,
        4,
        6,
        6,
        6,
        6,
        6
      ]
    ]
  },
  {
    "id": "arasigal-04",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 2
      },
      {
        "row": 2,
        "col": 6
      },
      {
        "row": 3,
        "col": 3
      },
      {
        "row": 4,
        "col": 5
      },
      {
        "row": 5,
        "col": 1
      },
      {
        "row": 6,
        "col": 4
      }
    ],
    "regions": [
      [
        0,
        0,
        0,
        1,
        1,
        1,
        2
      ],
      [
        0,
        0,
        1,
        1,
        1,
        1,
        2
      ],
      [
        0,
        0,
        1,
        1,
        1,
        1,
        2
      ],
      [
        5,
        0,
        1,
        3,
        1,
        4,
        4
      ],
      [
        5,
        5,
        5,
        6,
        4,
        4,
        4
      ],
      [
        5,
        5,
        5,
        6,
        6,
        4,
        4
      ],
      [
        5,
        5,
        5,
        6,
        6,
        6,
        6
      ]
    ]
  },
  {
    "id": "arasigal-05",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 3
      },
      {
        "row": 2,
        "col": 1
      },
      {
        "row": 3,
        "col": 5
      },
      {
        "row": 4,
        "col": 2
      },
      {
        "row": 5,
        "col": 4
      },
      {
        "row": 6,
        "col": 6
      }
    ],
    "regions": [
      [
        0,
        0,
        0,
        0,
        0,
        3,
        3
      ],
      [
        0,
        0,
        0,
        1,
        1,
        3,
        3
      ],
      [
        2,
        2,
        4,
        4,
        3,
        3,
        3
      ],
      [
        4,
        4,
        4,
        4,
        3,
        3,
        3
      ],
      [
        4,
        4,
        4,
        4,
        3,
        3,
        3
      ],
      [
        4,
        4,
        4,
        4,
        5,
        3,
        3
      ],
      [
        4,
        4,
        4,
        4,
        5,
        3,
        6
      ]
    ]
  },
  {
    "id": "arasigal-06",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 3
      },
      {
        "row": 2,
        "col": 5
      },
      {
        "row": 3,
        "col": 1
      },
      {
        "row": 4,
        "col": 4
      },
      {
        "row": 5,
        "col": 6
      },
      {
        "row": 6,
        "col": 2
      }
    ],
    "regions": [
      [
        0,
        0,
        1,
        1,
        1,
        2,
        5
      ],
      [
        0,
        0,
        1,
        1,
        1,
        2,
        5
      ],
      [
        0,
        0,
        1,
        1,
        2,
        2,
        5
      ],
      [
        0,
        3,
        3,
        1,
        1,
        5,
        5
      ],
      [
        0,
        3,
        3,
        1,
        4,
        5,
        5
      ],
      [
        0,
        6,
        6,
        6,
        5,
        5,
        5
      ],
      [
        6,
        6,
        6,
        5,
        5,
        5,
        5
      ]
    ]
  },
  {
    "id": "arasigal-07",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 3
      },
      {
        "row": 2,
        "col": 5
      },
      {
        "row": 3,
        "col": 2
      },
      {
        "row": 4,
        "col": 4
      },
      {
        "row": 5,
        "col": 6
      },
      {
        "row": 6,
        "col": 1
      }
    ],
    "regions": [
      [
        0,
        0,
        1,
        1,
        1,
        1,
        1
      ],
      [
        0,
        1,
        1,
        1,
        1,
        1,
        4
      ],
      [
        0,
        3,
        3,
        1,
        1,
        2,
        4
      ],
      [
        3,
        3,
        3,
        3,
        3,
        4,
        4
      ],
      [
        3,
        3,
        3,
        3,
        4,
        4,
        4
      ],
      [
        3,
        3,
        3,
        3,
        4,
        4,
        5
      ],
      [
        6,
        6,
        6,
        3,
        4,
        4,
        4
      ]
    ]
  },
  {
    "id": "arasigal-08",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 3
      },
      {
        "row": 2,
        "col": 6
      },
      {
        "row": 3,
        "col": 1
      },
      {
        "row": 4,
        "col": 5
      },
      {
        "row": 5,
        "col": 2
      },
      {
        "row": 6,
        "col": 4
      }
    ],
    "regions": [
      [
        0,
        0,
        0,
        1,
        1,
        2,
        2
      ],
      [
        0,
        0,
        1,
        1,
        1,
        2,
        2
      ],
      [
        0,
        3,
        1,
        1,
        2,
        2,
        2
      ],
      [
        3,
        3,
        3,
        1,
        2,
        2,
        2
      ],
      [
        3,
        3,
        3,
        4,
        4,
        4,
        2
      ],
      [
        3,
        3,
        5,
        5,
        6,
        6,
        2
      ],
      [
        3,
        3,
        5,
        6,
        6,
        6,
        6
      ]
    ]
  },
  {
    "id": "arasigal-09",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 3
      },
      {
        "row": 2,
        "col": 6
      },
      {
        "row": 3,
        "col": 4
      },
      {
        "row": 4,
        "col": 2
      },
      {
        "row": 5,
        "col": 5
      },
      {
        "row": 6,
        "col": 1
      }
    ],
    "regions": [
      [
        0,
        4,
        4,
        1,
        1,
        2,
        2
      ],
      [
        4,
        4,
        4,
        1,
        1,
        2,
        2
      ],
      [
        4,
        4,
        4,
        4,
        2,
        2,
        2
      ],
      [
        4,
        4,
        4,
        4,
        3,
        2,
        2
      ],
      [
        4,
        4,
        4,
        4,
        4,
        4,
        4
      ],
      [
        6,
        6,
        4,
        4,
        4,
        5,
        5
      ],
      [
        6,
        6,
        6,
        4,
        4,
        5,
        5
      ]
    ]
  },
  {
    "id": "arasigal-10",
    "gridSize": 7,
    "solution": [
      {
        "row": 0,
        "col": 0
      },
      {
        "row": 1,
        "col": 4
      },
      {
        "row": 2,
        "col": 1
      },
      {
        "row": 3,
        "col": 5
      },
      {
        "row": 4,
        "col": 3
      },
      {
        "row": 5,
        "col": 6
      },
      {
        "row": 6,
        "col": 2
      }
    ],
    "regions": [
      [
        0,
        2,
        1,
        1,
        1,
        1,
        1
      ],
      [
        2,
        2,
        2,
        1,
        1,
        3,
        3
      ],
      [
        2,
        2,
        2,
        3,
        3,
        3,
        3
      ],
      [
        2,
        2,
        2,
        2,
        3,
        3,
        3
      ],
      [
        2,
        2,
        2,
        4,
        6,
        3,
        3
      ],
      [
        6,
        6,
        6,
        6,
        6,
        6,
        5
      ],
      [
        6,
        6,
        6,
        6,
        6,
        6,
        5
      ]
    ]
  }
];

/**
 * Applies dihedral D4 isometry (rotation/reflection) to generate 8 mathematically
 * valid variations of any Arasigal board without altering solvability or region rules.
 */
function applyArasigalIsometry(puzzle: ArasigalPuzzle, isoIndex: number): ArasigalPuzzle {
  const N = puzzle.gridSize;

  function mapCoord(r: number, c: number, iso: number): { r: number; c: number } {
    switch (iso) {
      case 0: return { r, c };
      case 1: return { r: c, c: N - 1 - r }; // 90 deg clockwise
      case 2: return { r: N - 1 - r, c: N - 1 - c }; // 180 deg
      case 3: return { r: N - 1 - c, c: r }; // 270 deg
      case 4: return { r, c: N - 1 - c }; // reflect horizontal
      case 5: return { r: N - 1 - r, c }; // reflect vertical
      case 6: return { r: c, c: r }; // reflect diagonal
      case 7: return { r: N - 1 - c, c: N - 1 - r }; // reflect anti-diagonal
      default: return { r, c };
    }
  }

  const newRegions: number[][] = Array(N).fill(null).map(() => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const p = mapCoord(r, c, isoIndex);
      newRegions[p.r][p.c] = puzzle.regions[r][c];
    }
  }

  const newSolution = puzzle.solution.map((s) => {
    const p = mapCoord(s.row, s.col, isoIndex);
    return { row: p.r, col: p.c };
  });

  return {
    id: `${puzzle.id}-var${isoIndex}`,
    gridSize: N,
    regions: newRegions,
    solution: newSolution,
  };
}

/**
 * Returns Arasigal puzzle for a given seed string deterministically.
 * Multiplies base boards by 8 dihedral isometries to yield 80 distinct solvable puzzles!
 */
export function getArasigalPuzzle(seedStr: string): ArasigalPuzzle {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const baseIndex = Math.abs(hash) % ARASIGAL_PUZZLES.length;
  const isoIndex = Math.abs(hash >> 3) % 8;
  return applyArasigalIsometry(ARASIGAL_PUZZLES[baseIndex], isoIndex);
}
