export interface Point {
  x: number;
  y: number;
  number?: number;
}

export interface Line {
  from: Point;
  to: Point;
}

export interface GameConfig {
  gridSize?: number;          // Size of the grid (minimum 3x3)
  numberedDotsCount?: number; // Number of dots to connect (minimum 2)
  difficulty?: 'easy' | 'medium' | 'hard'; // Difficulty setting
  seed?: string;             // Optional seed for consistent randomization
}

export interface GameState {
  grid: Point[][];
  numberedDots: Point[];
  currentPath: Point[];
  isComplete: boolean;
  moveCount: number;
  config?: GameConfig;      // Added to track current game configuration
} 