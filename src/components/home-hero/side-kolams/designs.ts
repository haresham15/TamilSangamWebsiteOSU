/**
 * designs.ts
 * 
 * Approved sibling pair for Kolam L and Kolam R (Phase 1 Option A).
 * Both configurations have identical density (28 crossings), 5 continuous closed loops,
 * and 100% solvable alternating weaves under D4 symmetry.
 */

import { TileType } from './tileGrammar';

export interface ApprovedDesign {
  id: number;
  name: string;
  config: TileType[];
  configStr: string;
  crossings: number;
  loopsCount: number;
  description: string;
}

export const KOLAM_L_DESIGN: ApprovedDesign = {
  id: 46815,
  name: 'Kolam L (Left Flank)',
  config: ['A', 'X', 'X', 'X', 'B', 'A', 'B', 'A', 'B', 'X'],
  configStr: 'AXXXBABABX',
  crossings: 28,
  loopsCount: 5,
  description: 'Flowing continuous heart loop with dense radial interlacing and 4-petal symmetry.',
};

export const KOLAM_R_DESIGN: ApprovedDesign = {
  id: 46895,
  name: 'Kolam R (Right Flank)',
  config: ['X', 'B', 'X', 'X', 'X', 'A', 'B', 'A', 'B', 'X'],
  configStr: 'XBXXXABABX',
  crossings: 28,
  loopsCount: 5,
  description: 'Star-crossing heart sibling with complementary central weave and matched 28-crossing weight.',
};
