import {
  nextGlyph,
  hingeAngle,
  createCellState,
  tick,
  IDLE,
  FLAPPING,
} from "./fsm";
import { N } from "./atlas";

export function runFsmUnitTests() {
  const results: { test: string; passed: boolean; message?: string }[] = [];

  // Test 1: nextGlyph cap K = 7
  // Ensure that from any cur to any target in 0..49, nextGlyph reaches target in <= 7 steps
  let capPassed = true;
  for (let cur = 0; cur < N; cur++) {
    for (let target = 0; target < N; target++) {
      let steps = 0;
      let c = cur;
      while (c !== target && steps < 20) {
        c = nextGlyph(c, target, 7);
        steps++;
      }
      if (steps > 7) {
        capPassed = false;
        results.push({
          test: `nextGlyph cap: cur=${cur}, target=${target}`,
          passed: false,
          message: `Took ${steps} steps > K=7`,
        });
        break;
      }
    }
    if (!capPassed) break;
  }
  if (capPassed) {
    results.push({
      test: "nextGlyph cap: every pair (0..49 -> 0..49) settles in <= 7 steps",
      passed: true,
    });
  }

  // Test 2: hingeAngle continuity at u = 0.7 and u = 1.0
  const angleAt0 = hingeAngle(0, false);
  const angleBeforeFall = hingeAngle(0.699999, false);
  const angleAtFall = hingeAngle(0.7, false);
  const angleAfterFall = hingeAngle(0.700001, false);
  const angleAt1 = hingeAngle(1.0, false);

  const eps = 1e-4;
  const fallContinuous =
    Math.abs(angleAtFall - Math.PI) < eps &&
    Math.abs(angleBeforeFall - Math.PI) < 0.05 &&
    Math.abs(angleAfterFall - Math.PI) < 0.05;
  const endContinuous = Math.abs(angleAt1 - Math.PI) < eps;
  const startAtZero = Math.abs(angleAt0) < eps;

  results.push({
    test: "hingeAngle starts at 0, is continuous at u=0.7 (PI), and settles at u=1.0 (PI)",
    passed: fallContinuous && endContinuous && startAtZero,
    message: `angleAt0=${angleAt0.toFixed(3)}, angleAt0.7=${angleAtFall.toFixed(3)}, angleAt1=${angleAt1.toFixed(3)}`,
  });

  // Test 3: Mid-flip retarget
  // A cell flipping toward target A that is retargeted to target B mid-flip
  // finishes its current step before smoothly branching toward target B
  const s = createCellState(1, 1, 1);
  s.cur[0] = 1; // 'A'
  const targetA = new Uint8Array([5]); // 'E'
  const targetB = new Uint8Array([10]); // 'J'

  let now = 1000;
  // Start flipping toward A
  tick(s, now, targetA, { colStaggerMs: 0, rowStaggerMs: 0, stepDurMs: 100 });
  const midFlip = s.phase[0] === FLAPPING;

  // Advance time to mid-flight (50ms)
  now += 50;
  tick(s, now, targetB, { colStaggerMs: 0, rowStaggerMs: 0, stepDurMs: 100 });
  const stillInStep = s.phase[0] === FLAPPING;

  // Advance to step completion (105ms)
  now += 55;
  tick(s, now, targetB, { colStaggerMs: 0, rowStaggerMs: 0, stepDurMs: 100 });
  // The cell committed the intermediate glyph and immediately chained toward target B
  const chainedToB = s.nxt[0] !== 5; // branched toward B

  // Fast forward until settled
  for (let step = 0; step < 10; step++) {
    now += 150;
    tick(s, now, targetB, { colStaggerMs: 0, rowStaggerMs: 0, stepDurMs: 100 });
  }
  const settledAtB = s.cur[0] === 10 && s.phase[0] === IDLE;

  results.push({
    test: "mid-flip retarget: smoothly chains intermediate step without tearing and settles at target B",
    passed: midFlip && stillInStep && chainedToB && settledAtB,
  });

  // Test 4: Worst-case whole-board flip duration stays <= 1.6s on desktop (30 cols x 5 rows)
  const board = createCellState(150, 30, 5);
  // All cells start at 0, target is max distance away
  const boardTarget = new Uint8Array(150).fill(25); // 25 steps away
  let simTime = 0;
  let isMoving = true;
  const cfg = {};

  // Step simulation in 16ms increments (60fps)
  while (isMoving && simTime < 3000) {
    simTime += 16;
    isMoving = tick(board, simTime, boardTarget, cfg);
  }

  const durationSec = simTime / 1000;
  const withinBudget = durationSec <= 1.6;

  results.push({
    test: "whole-board flip duration budget: 30x5 board finishes in <= 1.6s",
    passed: withinBudget,
    message: `Finished in ${durationSec.toFixed(3)}s (budget <= 1.6s)`,
  });

  // Test 5: Reduced motion snap
  const rmBoard = createCellState(10, 10, 1);
  const rmTarget = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  tick(rmBoard, 1000, rmTarget, { reducedMotion: true });
  const rmSnapped = Array.from(rmBoard.cur).every((v, i) => v === i + 1);

  results.push({
    test: "reduced motion: snaps to target immediately with 0 flips",
    passed: rmSnapped,
  });

  return results;
}
