"use client";

/**
 * Normalizes input string to valid departure board characters (PRD §6.2).
 * Normalizes NFKD, removes diacritics, converts to uppercase, replaces non-drum chars
 * with spaces, collapses whitespace, and trims.
 * (Note: Tamil script produces spaces, falling back to English boardText as required by PRD).
 */
export const toBoardText = (s: string): string => {
  if (!s) return "";
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^ A-Z0-9.,?!'\-&/:+()$]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Word-wraps text into fixed-width lines (PRD §6.2).
 * Handles word boundaries and splits words exceeding line width with a trailing '-'.
 */
export function wrapText(text: string, maxCols: number, maxLines: number): string[] {
  const normalized = toBoardText(text);
  if (!normalized) return [];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Word exceeds entire line width: hyphenate
    if (word.length > maxCols) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
        if (lines.length >= maxLines) break;
      }
      let remaining = word;
      while (remaining.length > maxCols && lines.length < maxLines) {
        lines.push(remaining.slice(0, maxCols - 1) + "-");
        remaining = remaining.slice(maxCols - 1);
      }
      if (remaining && lines.length < maxLines) {
        currentLine = remaining;
      }
      continue;
    }

    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCols) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
      if (lines.length >= maxLines) break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}

export interface BoardContentItem {
  no?: string | number;
  text: string;
  catCode?: string;
  statusText?: string;
}

/**
 * Formats a content item into a 1D grid character array for the given layout (PRD §6.3).
 */
export function layoutBoard(
  item: BoardContentItem,
  cols: number,
  rows: number
): string[] {
  const grid = new Array(cols * rows).fill(" ");
  const noStr = item.no !== undefined ? String(item.no).padStart(2, "0").slice(-2) : "";
  const catStr = toBoardText(item.catCode ?? "GENL");
  const statusStr = toBoardText(item.statusText ?? "ANSWERED  READ BELOW V");

  if (cols === 30 && rows === 5) {
    // -------------------------------------------------------------
    // Desktop: 30 cols x 5 rows
    // NO 2 cols (0-1) | gap (2) | text 22 cols (3-24) | gap (25) | CAT 4 cols (26-29)
    // Rows 0-2: Text
    // Row 3: Blank
    // Row 4: Status Line
    // -------------------------------------------------------------
    if (noStr) {
      for (let i = 0; i < Math.min(2, noStr.length); i++) {
        grid[0 * 30 + i] = noStr[i];
      }
    }
    if (catStr) {
      const code = catStr.padEnd(4, " ").slice(0, 4);
      for (let i = 0; i < 4; i++) {
        grid[0 * 30 + 26 + i] = code[i];
      }
    }

    const lines = wrapText(item.text, 22, 3);
    for (let r = 0; r < lines.length; r++) {
      const line = lines[r];
      for (let c = 0; c < line.length; c++) {
        grid[r * 30 + 3 + c] = line[c];
      }
    }

    // Row 4: Status line
    for (let i = 0; i < Math.min(26, statusStr.length); i++) {
      grid[4 * 30 + 3 + i] = statusStr[i];
    }
  } else if (cols === 24 && rows === 6) {
    // -------------------------------------------------------------
    // Tablet: 24 cols x 6 rows
    // NO 2 cols (0-1) | gap (2) | text 18 cols (3-20) | gap (21) | CAT 2 cols (22-23)
    // Rows 0-3: Text
    // Row 4: Blank
    // Row 5: Status Line
    // -------------------------------------------------------------
    if (noStr) {
      for (let i = 0; i < Math.min(2, noStr.length); i++) {
        grid[0 * 24 + i] = noStr[i];
      }
    }
    if (catStr) {
      const code = catStr.slice(0, 2);
      for (let i = 0; i < code.length; i++) {
        grid[0 * 24 + 22 + i] = code[i];
      }
    }

    const lines = wrapText(item.text, 18, 4);
    for (let r = 0; r < lines.length; r++) {
      const line = lines[r];
      for (let c = 0; c < line.length; c++) {
        grid[r * 24 + 3 + c] = line[c];
      }
    }

    // Row 5: Status line
    const shortStatus = toBoardText("READ BELOW V");
    for (let i = 0; i < Math.min(18, shortStatus.length); i++) {
      grid[5 * 24 + 3 + i] = shortStatus[i];
    }
  } else {
    // -------------------------------------------------------------
    // Phone: 14 cols x 9 rows
    // No NO / CAT columns.
    // Rows 0-6: Text (14 cols)
    // Row 7: Blank
    // Row 8: Status Line
    // -------------------------------------------------------------
    const lines = wrapText(item.text, 14, 7);
    for (let r = 0; r < lines.length; r++) {
      const line = lines[r];
      for (let c = 0; c < line.length; c++) {
        grid[r * 14 + c] = line[c];
      }
    }

    // Row 8: Status line
    const phoneStatus = toBoardText("READ BELOW V");
    for (let i = 0; i < Math.min(14, phoneStatus.length); i++) {
      grid[8 * 14 + i] = phoneStatus[i];
    }
  }

  return grid;
}
