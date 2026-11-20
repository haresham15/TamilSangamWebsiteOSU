// src/lib/games/share.ts
/**
 * Universal Emoji Share Generator for The Sangam Arcade.
 * Generates crisp, spoiler-free copy cards formatted for GroupMe, WhatsApp, and iMessage.
 */

export interface ShareCardPayload {
  gameSlug: string;
  titleEn: string;
  puzzleNumber: number;
  timeFormatted?: string;
  movesOrGuesses?: string | number;
  scoreOrMax?: string;
  gridVisual?: string;
  customLine?: string;
}

export function generateShareCard(payload: ShareCardPayload): string {
  const {
    gameSlug,
    titleEn,
    puzzleNumber,
    timeFormatted,
    movesOrGuesses,
    scoreOrMax,
    gridVisual,
    customLine,
  } = payload;

  const lines: string[] = [];

  // Line 1: Header with symbol and puzzle #
  let header = `✦ ${titleEn} #${puzzleNumber}`;
  if (timeFormatted) {
    header += ` · ${timeFormatted}`;
  }
  lines.push(header);

  // Line 2: Details / metrics
  const detailParts: string[] = [];
  if (movesOrGuesses !== undefined) {
    detailParts.push(`${movesOrGuesses}`);
  }
  if (scoreOrMax) {
    detailParts.push(scoreOrMax);
  }
  if (customLine) {
    detailParts.push(customLine);
  }
  if (detailParts.length > 0) {
    lines.push(detailParts.join(" · "));
  }

  // Visual grid emoji representation if available
  if (gridVisual) {
    lines.push("");
    lines.push(gridVisual);
  }

  // Deep link back to game
  lines.push("");
  lines.push(`tamil-sangam-website-osu.vercel.app/games/${gameSlug}`);

  return lines.join("\n");
}

/**
 * Copies text to user's clipboard and returns true if succeeded.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
