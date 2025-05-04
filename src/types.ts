export interface Point {
  x: number;
  y: number;
  number?: number;
}

export interface Line {
  from: Point;
  to: Point;
}

export interface GameState {
  grid: Point[][];
  numberedDots: Point[];
  currentPath: Point[];
  isComplete: boolean;
  moveCount: number;
} 