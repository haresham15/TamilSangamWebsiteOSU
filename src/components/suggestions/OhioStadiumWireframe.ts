/**
 * Procedural Wireframe Line Model of Ohio Stadium ("The Shoe") at The Ohio State University.
 * 
 * Captures all signature architectural features:
 * 1. The iconic Horseshoe 'U' plan (open South end, rounded North end)
 * 2. Lower Deck (A & B Decks) stepped seating tiers & radial aisles
 * 3. Upper Deck (C-Deck) cantilevering outward with diagonal steel lattice trusses
 * 4. 84 Exterior double-tiered Romanesque arches with keystones & cornices
 * 5. Monumental North Rotunda entrance with triple concentric Roman arches, twin towers, & cupola
 * 6. West Press Box & Luxury Suites tower
 * 7. South Endzone open gap, low bleachers, goalposts, & South Videoboard steel lattice tower
 * 8. Football field with yard lines, end zones, and hash marks
 */

export interface StadiumGeometryData {
  positions: Float32Array;
  originalY: Float32Array;
  typeTags: Float32Array; // 0=field, 1=lower bowl, 2=upper deck/trusses, 3=outer arches, 4=north rotunda, 5=pressbox/scoreboard
  maxHeight: number;
}

export function buildOhioStadiumLines(): StadiumGeometryData {
  const linePairs: number[] = []; // [x1, y1, z1, x2, y2, z2, ...]
  const origY: number[] = [];     // [y1, y2, ...]
  const types: number[] = [];     // [tag1, tag2, ...]

  let maxY = 0;

  function addLine(
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
    tag: number
  ) {
    linePairs.push(x1, y1, z1, x2, y2, z2);
    origY.push(y1, y2);
    types.push(tag, tag);
    if (y1 > maxY) maxY = y1;
    if (y2 > maxY) maxY = y2;
  }

  function addBoxLines(
    minX: number, minY: number, minZ: number,
    maxX: number, maxYVal: number, maxZ: number,
    tag: number
  ) {
    // 12 edges of a box
    addLine(minX, minY, minZ, maxX, minY, minZ, tag);
    addLine(maxX, minY, minZ, maxX, minY, maxZ, tag);
    addLine(maxX, minY, maxZ, minX, minY, maxZ, tag);
    addLine(minX, minY, maxZ, minX, minY, minZ, tag);

    addLine(minX, maxYVal, minZ, maxX, maxYVal, minZ, tag);
    addLine(maxX, maxYVal, minZ, maxX, maxYVal, maxZ, tag);
    addLine(maxX, maxYVal, maxZ, minX, maxYVal, maxZ, tag);
    addLine(minX, maxYVal, maxZ, minX, maxYVal, minZ, tag);

    addLine(minX, minY, minZ, minX, maxYVal, minZ, tag);
    addLine(maxX, minY, minZ, maxX, maxYVal, minZ, tag);
    addLine(maxX, minY, maxZ, maxX, maxYVal, maxZ, tag);
    addLine(minX, minY, maxZ, minX, maxYVal, maxZ, tag);
  }

  // =========================================================================
  // 1. FOOTBALL FIELD & TRACK (y = 0.02)
  // Field spans X: [-1.8, 1.8], Z: [-4.2, 4.2]
  // =========================================================================
  const fieldW = 1.8;
  const fieldL = 4.2;
  const tagField = 0;

  // Perimeter boundary
  addLine(-fieldW, 0.02, -fieldL, fieldW, 0.02, -fieldL, tagField);
  addLine(fieldW, 0.02, -fieldL, fieldW, 0.02, fieldL, tagField);
  addLine(fieldW, 0.02, fieldL, -fieldW, 0.02, fieldL, tagField);
  addLine(-fieldW, 0.02, fieldL, -fieldW, 0.02, -fieldL, tagField);

  // Goal Lines
  const goalZ1 = -3.5;
  const goalZ2 = 3.5;
  addLine(-fieldW, 0.02, goalZ1, fieldW, 0.02, goalZ1, tagField);
  addLine(-fieldW, 0.02, goalZ2, fieldW, 0.02, goalZ2, tagField);

  // End Zone diagonal hatch lines (Block O / Sangam style)
  for (let z = -fieldL + 0.15; z < goalZ1; z += 0.25) {
    addLine(-fieldW, 0.02, z, fieldW, 0.02, z + 0.15, tagField);
  }
  for (let z = goalZ2 + 0.15; z < fieldL; z += 0.25) {
    addLine(-fieldW, 0.02, z, fieldW, 0.02, z + 0.15, tagField);
  }

  // 10-Yard lines between goal lines (total 70 yards = 7 segments)
  const yardStep = (goalZ2 - goalZ1) / 10;
  for (let i = 1; i < 10; i++) {
    const z = goalZ1 + i * yardStep;
    addLine(-fieldW, 0.02, z, fieldW, 0.02, z, tagField);

    // Hash marks along hashes (X = -0.5, +0.5)
    addLine(-0.55, 0.02, z, -0.45, 0.02, z, tagField);
    addLine(0.45, 0.02, z, 0.55, 0.02, z, tagField);
  }

  // 50-Yard line & Center-field emblem ring
  const centerSegments = 24;
  for (let i = 0; i < centerSegments; i++) {
    const a1 = (i / centerSegments) * Math.PI * 2;
    const a2 = ((i + 1) / centerSegments) * Math.PI * 2;
    addLine(
      Math.cos(a1) * 0.6, 0.02, Math.sin(a1) * 0.6,
      Math.cos(a2) * 0.6, 0.02, Math.sin(a2) * 0.6,
      tagField
    );
  }

  // Semicircular track curve at North end
  const trackSegments = 24;
  for (let i = 0; i < trackSegments; i++) {
    const a1 = Math.PI + (i / trackSegments) * Math.PI;
    const a2 = Math.PI + ((i + 1) / trackSegments) * Math.PI;
    addLine(
      Math.cos(a1) * fieldW, 0.02, goalZ1 + Math.sin(a1) * 0.7,
      Math.cos(a2) * fieldW, 0.02, goalZ1 + Math.sin(a2) * 0.7,
      tagField
    );
  }

  // =========================================================================
  // 2. LOWER SEATING BOWL (A-Deck & B-Deck)
  // Horseshoe shape: West sideline (X in [-2.2, -3.8]), East sideline (X in [2.2, 3.8])
  // Z extends from North curve center (-2.2) to South end (+4.8).
  // North curve sweeps from angle PI (West) to 2*PI (East).
  // Y rises from 0.15 to 1.6
  // =========================================================================
  const tagLowerBowl = 1;
  const lowerTiers = 8;
  const northCenterZ = -2.2;
  const southZ = 4.8;

  for (let t = 0; t <= lowerTiers; t++) {
    const frac = t / lowerTiers;
    const innerX = 2.2 + frac * 1.6;
    const tierY = 0.15 + frac * 1.45;

    // Straight West sideline tier
    addLine(-innerX, tierY, northCenterZ, -innerX, tierY, southZ, tagLowerBowl);
    // Straight East sideline tier
    addLine(innerX, tierY, northCenterZ, innerX, tierY, southZ, tagLowerBowl);

    // North Semicircular horseshoe curve tier
    const curveSegs = 32;
    for (let s = 0; s < curveSegs; s++) {
      const a1 = Math.PI + (s / curveSegs) * Math.PI;
      const a2 = Math.PI + ((s + 1) / curveSegs) * Math.PI;
      const x1 = Math.cos(a1) * innerX;
      const z1 = northCenterZ + Math.sin(a1) * innerX * 0.95;
      const x2 = Math.cos(a2) * innerX;
      const z2 = northCenterZ + Math.sin(a2) * innerX * 0.95;
      addLine(x1, tierY, z1, x2, tierY, z2, tagLowerBowl);
    }
  }

  // Radial aisles & vomitories (step lines going up the lower bowl)
  // Sideline vertical aisles every 0.8 units in Z
  for (let z = northCenterZ + 0.6; z < southZ; z += 0.9) {
    // West
    addLine(-2.2, 0.15, z, -3.8, 1.6, z, tagLowerBowl);
    // East
    addLine(2.2, 0.15, z, 3.8, 1.6, z, tagLowerBowl);

    // Vomitory entrance portals at mid-height (Y = 0.85)
    addLine(-3.1, 0.85, z - 0.15, -3.1, 1.25, z - 0.15, tagLowerBowl);
    addLine(-3.1, 1.25, z - 0.15, -3.1, 1.25, z + 0.15, tagLowerBowl);
    addLine(-3.1, 1.25, z + 0.15, -3.1, 0.85, z + 0.15, tagLowerBowl);

    addLine(3.1, 0.85, z - 0.15, 3.1, 1.25, z - 0.15, tagLowerBowl);
    addLine(3.1, 1.25, z - 0.15, 3.1, 1.25, z + 0.15, tagLowerBowl);
    addLine(3.1, 1.25, z + 0.15, 3.1, 0.85, z + 0.15, tagLowerBowl);
  }

  // North curve radial aisles (spokes)
  for (let i = 1; i < 7; i++) {
    const a = Math.PI + (i / 7) * Math.PI;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    addLine(
      cosA * 2.2, 0.15, northCenterZ + sinA * 2.2 * 0.95,
      cosA * 3.8, 1.6, northCenterZ + sinA * 3.8 * 0.95,
      tagLowerBowl
    );
  }

  // =========================================================================
  // 3. UPPER DECK (C-Deck) & CANTILEVER STEEL TRUSSES
  // C-Deck cantilevers out over B-Deck:
  // Starts at X = 3.2 (West: -3.2), extends out to X = 5.4 (West: -5.4)
  // Y rises from 2.0 to 3.8.
  // Diagonal cantilever steel lattice trusses underneath between Y=1.5 and Y=2.2!
  // =========================================================================
  const tagUpperDeck = 2;
  const upperTiers = 7;

  for (let t = 0; t <= upperTiers; t++) {
    const frac = t / upperTiers;
    const innerX = 3.2 + frac * 2.2;
    const tierY = 2.0 + frac * 1.8;

    // Straight West upper tier
    addLine(-innerX, tierY, northCenterZ, -innerX, tierY, southZ, tagUpperDeck);
    // Straight East upper tier
    addLine(innerX, tierY, northCenterZ, innerX, tierY, southZ, tagUpperDeck);

    // North Semicircular upper tier
    const curveSegs = 36;
    for (let s = 0; s < curveSegs; s++) {
      const a1 = Math.PI + (s / curveSegs) * Math.PI;
      const a2 = Math.PI + ((s + 1) / curveSegs) * Math.PI;
      const x1 = Math.cos(a1) * innerX;
      const z1 = northCenterZ + Math.sin(a1) * innerX * 0.95;
      const x2 = Math.cos(a2) * innerX;
      const z2 = northCenterZ + Math.sin(a2) * innerX * 0.95;
      addLine(x1, tierY, z1, x2, tierY, z2, tagUpperDeck);
    }
  }

  // Distinctive Under-Deck Cantilever Steel Lattice Trusses
  // In real Ohio Stadium, massive steel Warren trusses support C-deck from exterior columns
  for (let z = northCenterZ; z <= southZ; z += 0.8) {
    // West truss
    addLine(-5.5, 1.6, z, -3.2, 2.0, z, tagUpperDeck); // Bottom chord
    addLine(-5.5, 3.8, z, -3.2, 2.0, z, tagUpperDeck); // Top chord diagonal
    addLine(-4.4, 1.8, z, -4.4, 2.9, z, tagUpperDeck); // Vertical strut
    addLine(-5.5, 1.6, z, -4.4, 2.9, z, tagUpperDeck); // Diagonal cross brace
    addLine(-4.4, 1.8, z, -3.2, 2.0, z, tagUpperDeck);

    // East truss
    addLine(5.5, 1.6, z, 3.2, 2.0, z, tagUpperDeck);
    addLine(5.5, 3.8, z, 3.2, 2.0, z, tagUpperDeck);
    addLine(4.4, 1.8, z, 4.4, 2.9, z, tagUpperDeck);
    addLine(5.5, 1.6, z, 4.4, 2.9, z, tagUpperDeck);
    addLine(4.4, 1.8, z, 3.2, 2.0, z, tagUpperDeck);
  }

  // Upper deck radial aisles
  for (let z = northCenterZ + 0.4; z < southZ; z += 1.2) {
    addLine(-3.2, 2.0, z, -5.4, 3.8, z, tagUpperDeck);
    addLine(3.2, 2.0, z, 5.4, 3.8, z, tagUpperDeck);
  }
  for (let i = 1; i < 7; i++) {
    const a = Math.PI + (i / 7) * Math.PI;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    addLine(
      cosA * 3.2, 2.0, northCenterZ + sinA * 3.2 * 0.95,
      cosA * 5.4, 3.8, northCenterZ + sinA * 5.4 * 0.95,
      tagUpperDeck
    );
  }

  // =========================================================================
  // 4. THE 84 EXTERIOR DOUBLE-TIERED ROMAN ARCHES
  // The defining exterior aesthetic of Ohio Stadium!
  // Outer wall sits at X = +/- 5.6, and radius R = 5.6 around the north curve.
  // 2 tiers of arches:
  // Tier 1 (Ground): Piers Y: 0 to 1.1, Arch crown Y: 1.1 to 1.45
  // Intermediate Cornice: Y = 1.55
  // Tier 2 (Upper): Piers Y: 1.55 to 2.8, Arch crown Y: 2.8 to 3.25
  // Roof Parapet Cornice: Y = 3.65
  // =========================================================================
  const tagArches = 3;
  const outerX = 5.6;

  // Function to draw a single 2D Roman arch in X-Y or Z-Y plane
  function drawArch(
    p1: [number, number, number],
    p2: [number, number, number],
    springY: number,
    crownY: number,
    tag: number
  ) {
    // Pier 1
    addLine(p1[0], p1[1], p1[2], p1[0], springY, p1[2], tag);
    // Pier 2
    addLine(p2[0], p2[1], p2[2], p2[0], springY, p2[2], tag);

    // Semicircular arch curve (7 segments)
    const midX = (p1[0] + p2[0]) / 2;
    const midZ = (p1[2] + p2[2]) / 2;
    const archH = crownY - springY;

    const segs = 6;
    let prevX = p1[0];
    let prevY = springY;
    let prevZ = p1[2];

    for (let i = 1; i <= segs; i++) {
      const theta = (i / segs) * Math.PI; // 0 to PI
      const currX = p1[0] + (p2[0] - p1[0]) * (i / segs);
      const currZ = p1[2] + (p2[2] - p1[2]) * (i / segs);
      const currY = springY + Math.sin(theta) * archH;

      addLine(prevX, prevY, prevZ, currX, currY, currZ, tag);
      prevX = currX;
      prevY = currY;
      prevZ = currZ;
    }

    // Keystone line
    addLine(midX, crownY, midZ, midX, crownY + 0.12, midZ, tag);
  }

  // Continuous Horizontal Cornice Bands along outer walls
  // West Wall Cornices
  addLine(-outerX, 1.55, northCenterZ, -outerX, 1.55, southZ, tagArches);
  addLine(-outerX, 3.65, northCenterZ, -outerX, 3.65, southZ, tagArches);
  // East Wall Cornices
  addLine(outerX, 1.55, northCenterZ, outerX, 1.55, southZ, tagArches);
  addLine(outerX, 3.65, northCenterZ, outerX, 3.65, southZ, tagArches);

  // Arches along Straight West & East Sideline Walls
  const archSpan = 0.55;
  for (let z = northCenterZ; z + archSpan <= southZ; z += archSpan) {
    const z1 = z + 0.06;
    const z2 = z + archSpan - 0.06;

    // West Tier 1 (Lower)
    drawArch([-outerX, 0, z1], [-outerX, 0, z2], 1.05, 1.45, tagArches);
    // West Tier 2 (Upper)
    drawArch([-outerX, 1.55, z1], [-outerX, 1.55, z2], 2.7, 3.25, tagArches);

    // East Tier 1 (Lower)
    drawArch([outerX, 0, z1], [outerX, 0, z2], 1.05, 1.45, tagArches);
    // East Tier 2 (Upper)
    drawArch([outerX, 1.55, z1], [outerX, 1.55, z2], 2.7, 3.25, tagArches);
  }

  // Arches curving around the North Horseshoe Arc
  const rotundaArcBays = 14;
  for (let b = 0; b < rotundaArcBays; b++) {
    const a1 = Math.PI + (b / rotundaArcBays) * Math.PI;
    const a2 = Math.PI + ((b + 1) / rotundaArcBays) * Math.PI;

    // Intermediate and roof cornice arc lines
    const c1 = [Math.cos(a1) * outerX, 1.55, northCenterZ + Math.sin(a1) * outerX * 0.95];
    const c2 = [Math.cos(a2) * outerX, 1.55, northCenterZ + Math.sin(a2) * outerX * 0.95];
    addLine(c1[0], c1[1], c1[2], c2[0], c2[1], c2[2], tagArches);

    const r1 = [Math.cos(a1) * outerX, 3.65, northCenterZ + Math.sin(a1) * outerX * 0.95];
    const r2 = [Math.cos(a2) * outerX, 3.65, northCenterZ + Math.sin(a2) * outerX * 0.95];
    addLine(r1[0], r1[1], r1[2], r2[0], r2[1], r2[2], tagArches);

    // Draw radial curved arches
    const p1: [number, number, number] = [Math.cos(a1) * outerX, 0, northCenterZ + Math.sin(a1) * outerX * 0.95];
    const p2: [number, number, number] = [Math.cos(a2) * outerX, 0, northCenterZ + Math.sin(a2) * outerX * 0.95];
    drawArch(p1, p2, 1.05, 1.45, tagArches);

    const p1Up: [number, number, number] = [p1[0], 1.55, p1[2]];
    const p2Up: [number, number, number] = [p2[0], 1.55, p2[2]];
    drawArch(p1Up, p2Up, 2.7, 3.25, tagArches);
  }

  // =========================================================================
  // 5. THE NORTH ROTUNDA (The Jewel of Ohio Stadium)
  // Situated at the apex of the North curve (X = 0, Z = northCenterZ - outerX * 0.95 = -7.5)
  // Grand semicircular entrance with monumental triple arches, flanking twin stone pylons,
  // and ribbed dome cupola!
  // =========================================================================
  const tagRotunda = 4;
  const rotundaZ = northCenterZ - outerX * 0.95; // ~ -7.52
  const rotundaRadius = 1.6;

  // Semicircular footprint of the Rotunda portico
  const rotundaSteps = 20;
  for (let i = 0; i < rotundaSteps; i++) {
    const a1 = (i / rotundaSteps) * Math.PI;
    const a2 = ((i + 1) / rotundaSteps) * Math.PI;
    const rx1 = Math.cos(a1) * rotundaRadius;
    const rz1 = rotundaZ - Math.sin(a1) * rotundaRadius * 0.8;
    const rx2 = Math.cos(a2) * rotundaRadius;
    const rz2 = rotundaZ - Math.sin(a2) * rotundaRadius * 0.8;

    // Ground plinth curve
    addLine(rx1, 0, rz1, rx2, 0, rz2, tagRotunda);
    // Intermediate cornice curve
    addLine(rx1, 1.8, rz1, rx2, 1.8, rz2, tagRotunda);
    // Upper entablature curve
    addLine(rx1, 3.8, rz1, rx2, 3.8, rz2, tagRotunda);
    // Dome base ring
    addLine(rx1, 4.1, rz1, rx2, 4.1, rz2, tagRotunda);

    // Vertical colonnade pillars
    if (i % 3 === 0) {
      addLine(rx1, 0, rz1, rx1, 3.8, rz1, tagRotunda);
    }
  }

  // Triple Concentric Monumental Arches at the North Rotunda Main Portal
  const portalZ = rotundaZ - rotundaRadius * 0.8;
  const archRadii = [0.8, 1.05, 1.3];
  archRadii.forEach((r, idx) => {
    const spring = 1.2 + idx * 0.2;
    const crown = spring + r;
    drawArch([-r, 0, portalZ], [r, 0, portalZ], spring, crown, tagRotunda);
  });

  // Twin Flanking Pylon Towers at Rotunda Gate
  // Left Tower (West of portal)
  addBoxLines(-1.7, 0, portalZ - 0.3, -1.2, 4.6, portalZ + 0.3, tagRotunda);
  // Pyramid / finial cap on left tower
  addLine(-1.7, 4.6, portalZ - 0.3, -1.45, 5.0, portalZ, tagRotunda);
  addLine(-1.2, 4.6, portalZ - 0.3, -1.45, 5.0, portalZ, tagRotunda);
  addLine(-1.2, 4.6, portalZ + 0.3, -1.45, 5.0, portalZ, tagRotunda);
  addLine(-1.7, 4.6, portalZ + 0.3, -1.45, 5.0, portalZ, tagRotunda);

  // Right Tower (East of portal)
  addBoxLines(1.2, 0, portalZ - 0.3, 1.7, 4.6, portalZ + 0.3, tagRotunda);
  // Pyramid / finial cap on right tower
  addLine(1.7, 4.6, portalZ - 0.3, 1.45, 5.0, portalZ, tagRotunda);
  addLine(1.2, 4.6, portalZ - 0.3, 1.45, 5.0, portalZ, tagRotunda);
  addLine(1.2, 4.6, portalZ + 0.3, 1.45, 5.0, portalZ, tagRotunda);
  addLine(1.7, 4.6, portalZ + 0.3, 1.45, 5.0, portalZ, tagRotunda);

  // Semicircular Dome Cupola with Ribbed Lines atop the Rotunda
  const domeApexY = 4.8;
  const domeBaseY = 4.1;
  for (let i = 0; i <= rotundaSteps; i += 2) {
    const a = (i / rotundaSteps) * Math.PI;
    const bx = Math.cos(a) * rotundaRadius * 0.9;
    const bz = rotundaZ - Math.sin(a) * rotundaRadius * 0.72;
    // Curved dome rib to apex
    addLine(bx, domeBaseY, bz, 0, domeApexY, rotundaZ - 0.2, tagRotunda);
  }

  // =========================================================================
  // 6. WEST PRESS BOX & HUNTINGTON CLUB TOWER
  // Sits high atop the West upper deck (X: -5.4 to -6.3, Z: -2.0 to 2.0, Y: 3.8 to 5.3)
  // Multi-tier modern glass & steel structure
  // =========================================================================
  const tagPressBox = 5;
  const pbMinX = -6.2;
  const pbMaxX = -5.4;
  const pbMinZ = -2.2;
  const pbMaxZ = 2.2;
  const pbBaseY = 3.8;
  const pbTopY = 5.2;

  // Main Press Box volume
  addBoxLines(pbMinX, pbBaseY, pbMinZ, pbMaxX, pbTopY, pbMaxZ, tagPressBox);

  // Horizontal Floor Lines (Suite tiers 1, 2, 3)
  for (let y = pbBaseY + 0.35; y < pbTopY; y += 0.35) {
    addLine(pbMinX, y, pbMinZ, pbMinX, y, pbMaxZ, tagPressBox);
    addLine(pbMaxX, y, pbMinZ, pbMaxX, y, pbMaxZ, tagPressBox);
  }

  // Vertical Window Mullions overlooking the field
  for (let z = pbMinZ + 0.4; z < pbMaxZ; z += 0.4) {
    addLine(pbMaxX, pbBaseY, z, pbMaxX, pbTopY, z, tagPressBox);
  }

  // Communications mast / antennas atop press box
  addLine(-5.8, pbTopY, -1.0, -5.8, pbTopY + 0.8, -1.0, tagPressBox);
  addLine(-5.8, pbTopY, 1.0, -5.8, pbTopY + 0.8, 1.0, tagPressBox);
  addLine(-5.8, pbTopY + 0.8, -1.0, -5.8, pbTopY + 0.8, 1.0, tagPressBox);

  // =========================================================================
  // 7. SOUTH ENDZONE OPEN HORSESHOE & MASSIVE STEEL VIDEOBOARD TOWER
  // Sits at Z ~ 5.4 to 6.4, opening between X: [-2.0, 2.0]
  // Low bleacher tiers + massive 4-legged steel lattice scoreboard tower
  // =========================================================================
  // Low South bleachers (A-deck south curve connecting the ends)
  for (let t = 0; t <= 4; t++) {
    const frac = t / 4;
    const y = 0.15 + frac * 0.7;
    const z = southZ + frac * 0.5;
    addLine(-2.2, y, z, 2.2, y, z, tagLowerBowl);
  }

  // South Steel Videoboard Framework
  const boardZ = southZ + 1.1;
  const boardW = 3.8;
  const boardH = 1.6;
  const boardBaseY = 2.4;
  const boardTopY = boardBaseY + boardH;

  // 4 Steel lattice leg columns
  const legX1 = -boardW / 2 + 0.2;
  const legX2 = boardW / 2 - 0.2;
  // Left leg lattice
  addLine(legX1, 0, boardZ, legX1, boardBaseY, boardZ, tagPressBox);
  addLine(legX1 - 0.3, 0, boardZ, legX1 - 0.3, boardBaseY, boardZ, tagPressBox);
  for (let y = 0; y < boardBaseY; y += 0.4) {
    addLine(legX1 - 0.3, y, boardZ, legX1, y + 0.4, boardZ, tagPressBox);
    addLine(legX1, y, boardZ, legX1 - 0.3, y + 0.4, boardZ, tagPressBox);
  }

  // Right leg lattice
  addLine(legX2, 0, boardZ, legX2, boardBaseY, boardZ, tagPressBox);
  addLine(legX2 + 0.3, 0, boardZ, legX2 + 0.3, boardBaseY, boardZ, tagPressBox);
  for (let y = 0; y < boardBaseY; y += 0.4) {
    addLine(legX2, y, boardZ, legX2 + 0.3, y + 0.4, boardZ, tagPressBox);
    addLine(legX2 + 0.3, y, boardZ, legX2, y + 0.4, boardZ, tagPressBox);
  }

  // Giant Scoreboard Frame Box
  addBoxLines(-boardW / 2, boardBaseY, boardZ - 0.15, boardW / 2, boardTopY, boardZ + 0.15, tagPressBox);

  // Screen Grid Matrix lines
  for (let y = boardBaseY + 0.4; y < boardTopY; y += 0.4) {
    addLine(-boardW / 2, y, boardZ - 0.15, boardW / 2, y, boardZ - 0.15, tagPressBox);
  }
  for (let x = -boardW / 2 + 0.6; x < boardW / 2; x += 0.6) {
    addLine(x, boardBaseY, boardZ - 0.15, x, boardTopY, boardZ - 0.15, tagPressBox);
  }

  // =========================================================================
  // 8. GOALPOSTS (Iconic Collegiate 'Y' Goalposts)
  // North at goalZ1, South at goalZ2
  // =========================================================================
  [goalZ1, goalZ2].forEach((gz, idx) => {
    const dir = idx === 0 ? -1 : 1;
    const postBaseZ = gz + dir * 0.3;
    // Base post
    addLine(0, 0.02, postBaseZ, 0, 0.8, postBaseZ, tagField);
    // Gooseneck arm to goal line
    addLine(0, 0.8, postBaseZ, 0, 0.8, gz, tagField);
    // Crossbar
    addLine(-0.55, 0.8, gz, 0.55, 0.8, gz, tagField);
    // Uprights
    addLine(-0.55, 0.8, gz, -0.55, 1.9, gz, tagField);
    addLine(0.55, 0.8, gz, 0.55, 1.9, gz, tagField);
  });

  // Convert collected data into Float32Arrays for BufferGeometry
  const posArr = new Float32Array(linePairs);
  const origYArr = new Float32Array(origY);
  const typeArr = new Float32Array(types);

  return {
    positions: posArr,
    originalY: origYArr,
    typeTags: typeArr,
    maxHeight: maxY,
  };
}
