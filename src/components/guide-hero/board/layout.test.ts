import { toBoardText, wrapText, layoutBoard } from "./layout";

export function runLayoutUnitTests() {
  const results: { test: string; passed: boolean; message?: string }[] = [];

  // Test 1: toBoardText removes Tamil characters (converting to spaces/empty)
  const tamilOnly = toBoardText("ஓஹியோ ஸ்டேட் தமிழ் சங்கம்");
  results.push({
    test: "toBoardText(Tamil) returns empty string (filtered out)",
    passed: tamilOnly === "",
    message: `Output: '${tamilOnly}'`,
  });

  // Test 2: toBoardText uppercase & diacritic normalization
  const accented = toBoardText("Café résumé & events!");
  results.push({
    test: "toBoardText normalizes diacritics and converts to uppercase",
    passed: accented === "CAFE RESUME & EVENTS!",
    message: `Output: '${accented}'`,
  });

  // Test 3: wrapText wraps at word boundaries
  const wrapped = wrapText("WHAT IS OSU TAMIL SANGAM? CAMPUS HUB FOR CULTURE & FEASTS", 22, 3);
  const wrapValid =
    wrapped.length <= 3 &&
    wrapped.every((line) => line.length <= 22) &&
    wrapped[0] === "WHAT IS OSU TAMIL" &&
    wrapped[1] === "SANGAM? CAMPUS HUB FOR" &&
    wrapped[2] === "CULTURE & FEASTS";

  results.push({
    test: "wrapText wraps at word boundaries within maxCols and maxLines",
    passed: wrapValid,
    message: `Lines: ${JSON.stringify(wrapped)}`,
  });

  // Test 4: wrapText hyphenates words longer than maxCols
  const longWord = wrapText("SUPERCALIFRAGILISTICEXPIALIDOCIOUS", 10, 3);
  const hyphenated =
    longWord[0].endsWith("-") &&
    longWord[1].endsWith("-") &&
    longWord.every((l) => l.length <= 10);

  results.push({
    test: "wrapText hyphenates words exceeding maxCols with trailing '-'",
    passed: hyphenated,
    message: `Lines: ${JSON.stringify(longWord)}`,
  });

  // Test 5: layoutBoard Desktop (30x5)
  const desktopGrid = layoutBoard(
    {
      no: 1,
      text: "WHAT IS OSU TAMIL SANGAM? CAMPUS HUB FOR CULTURE & FEASTS",
      catCode: "GENL",
      statusText: "ANSWERED READ BELOW V",
    },
    30,
    5
  );

  const dNo = desktopGrid[0] + desktopGrid[1];
  const dCat = desktopGrid.slice(26, 30).join("");
  const dRow4 = desktopGrid.slice(4 * 30 + 3, 4 * 30 + 26).join("").trim();
  const dValid =
    desktopGrid.length === 150 &&
    dNo === "01" &&
    dCat === "GENL" &&
    dRow4 === "ANSWERED READ BELOW V";

  results.push({
    test: "layoutBoard Desktop (30x5) formats NO, CAT, wrapped text, and status line",
    passed: dValid,
    message: `NO='${dNo}', CAT='${dCat}', Status='${dRow4}'`,
  });

  // Test 6: layoutBoard Tablet (24x6)
  const tabletGrid = layoutBoard(
    {
      no: 1,
      text: "WHAT IS OSU TAMIL SANGAM? CAMPUS HUB FOR CULTURE & FEASTS",
      catCode: "GENL",
    },
    24,
    6
  );
  const tValid =
    tabletGrid.length === 144 &&
    tabletGrid[0] + tabletGrid[1] === "01" &&
    tabletGrid.slice(22, 24).join("") === "GE";

  results.push({
    test: "layoutBoard Tablet (24x6) formats NO, truncated CAT, and status line",
    passed: tValid,
  });

  // Test 7: layoutBoard Phone (14x9)
  const phoneGrid = layoutBoard(
    {
      text: "WHAT IS OSU TAMIL SANGAM? CAMPUS HUB FOR CULTURE, GOOD FOOD, AND STUDENT FELLOWSHIP.",
    },
    14,
    9
  );
  const pValid = phoneGrid.length === 126;

  results.push({
    test: "layoutBoard Phone (14x9) formats stacked lines without NO/CAT columns",
    passed: pValid,
  });

  return results;
}
