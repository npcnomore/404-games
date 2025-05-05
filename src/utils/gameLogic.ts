import seedrandom from 'seedrandom';
import { Point, GameState, GameConfig } from '../types';

const DEFAULT_GRID_SIZE = 5;
const DEFAULT_NUMBERED_DOTS_COUNT = 5;
const MIN_GRID_SIZE = 3;
const MIN_DOTS_COUNT = 2;
const MAX_GRID_SIZE = 9;
const MAX_DOTS_COUNT = 15;

// Difficulty settings affect the spacing between numbered dots
const DIFFICULTY_SETTINGS = {
  easy: { minDistance: 1 },
  medium: { minDistance: 2 },
  hard: { minDistance: 3 }
};

export const validateConfig = (config?: GameConfig): GameConfig => {
  const validatedConfig: GameConfig = { ...config };
  
  // Validate grid size
  if (!validatedConfig.gridSize || validatedConfig.gridSize < MIN_GRID_SIZE || validatedConfig.gridSize > MAX_GRID_SIZE) {
    validatedConfig.gridSize = DEFAULT_GRID_SIZE;
  }

  // Validate numbered dots count
  const maxPossibleDots = validatedConfig.gridSize * validatedConfig.gridSize;
  if (!validatedConfig.numberedDotsCount || 
      validatedConfig.numberedDotsCount < MIN_DOTS_COUNT || 
      validatedConfig.numberedDotsCount > Math.min(MAX_DOTS_COUNT, maxPossibleDots)) {
    validatedConfig.numberedDotsCount = Math.min(DEFAULT_NUMBERED_DOTS_COUNT, maxPossibleDots);
  }

  // Validate difficulty
  if (!validatedConfig.difficulty || !DIFFICULTY_SETTINGS[validatedConfig.difficulty]) {
    validatedConfig.difficulty = 'medium';
  }

  return validatedConfig;
};

export const isAdjacent = (p1: Point, p2: Point): boolean => {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

export const generatePuzzle = (date: Date, config?: GameConfig): GameState => {
  const validConfig = validateConfig(config);
  const GRID_SIZE = validConfig.gridSize!;
  const NUMBERED_DOTS_COUNT = validConfig.numberedDotsCount!;
  const difficulty = DIFFICULTY_SETTINGS[validConfig.difficulty!];

  // Use custom seed if provided, otherwise use date
  const seedBase = validConfig.seed || 
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
  const rng = seedrandom(seedBase);

  // Initialize grid
  const grid: Point[][] = Array(GRID_SIZE).fill(null).map((_, y) =>
    Array(GRID_SIZE).fill(null).map((_, x) => ({ x, y }))
  );

  // Generate all possible positions
  const allPositions: Point[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      allPositions.push({ x, y });
    }
  }

  // Shuffle all positions
  for (let i = allPositions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
  }

  // Try to generate a valid path
  const generateValidPath = (): Point[] => {
    const numberedDots: Point[] = [];
    const usedPositions = new Set<string>();

    // Update canReachPoint to consider difficulty
    const canReachPoint = (from: Point, to: Point, used: Set<string>): boolean => {
      if (used.size === 0) return true;
      
      // Check minimum distance requirement based on difficulty
      const manhattanDistance = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
      if (manhattanDistance < difficulty.minDistance) return false;
      
      const queue: Point[] = [from];
      const visited = new Set<string>();
      visited.add(`${from.x},${from.y}`);

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current.x === to.x && current.y === to.y) return true;

        const neighbors = [
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y },
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 },
        ];

        for (const neighbor of neighbors) {
          const key = `${neighbor.x},${neighbor.y}`;
          if (
            neighbor.x >= 0 && neighbor.x < GRID_SIZE &&
            neighbor.y >= 0 && neighbor.y < GRID_SIZE &&
            !visited.has(key) &&
            !used.has(key)
          ) {
            queue.push(neighbor);
            visited.add(key);
          }
        }
      }
      return false;
    };

    // Try positions from the shuffled list
    for (const pos of allPositions) {
      if (numberedDots.length === 0) {
        // First number
        numberedDots.push({ ...pos, number: 1 });
        usedPositions.add(`${pos.x},${pos.y}`);
        continue;
      }

      const lastDot = numberedDots[numberedDots.length - 1];
      const posKey = `${pos.x},${pos.y}`;

      if (!usedPositions.has(posKey) && canReachPoint(lastDot, pos, usedPositions)) {
        numberedDots.push({ ...pos, number: numberedDots.length + 1 });
        usedPositions.add(posKey);

        if (numberedDots.length === NUMBERED_DOTS_COUNT) {
          return numberedDots;
        }
      }
    }

    return [];
  };

  // Try to generate a valid path, retry if failed
  let numberedDots = generateValidPath();
  while (numberedDots.length < NUMBERED_DOTS_COUNT) {
    numberedDots = generateValidPath();
  }

  // Place numbered dots in the grid
  numberedDots.forEach(dot => {
    grid[dot.y][dot.x] = dot;
  });

  return {
    grid,
    numberedDots,
    currentPath: [],
    isComplete: false,
    moveCount: 0,
    config: validConfig
  };
};

export const isValidMove = (from: Point | null, to: Point, currentPath: Point[]): boolean => {
  console.log('isValidMove check:', {
    from: from ? { x: from.x, y: from.y, number: from.number } : 'null',
    to: { x: to.x, y: to.y, number: to.number },
    currentPath: currentPath.map(p => ({ x: p.x, y: p.y, number: p.number }))
  });

  // First move must start with number 1
  if (!from) {
    const isValid = to.number === 1;
    console.log('First move check:', { isValid, expectedNumber: 1, actualNumber: to.number });
    return isValid;
  }
  
  // Must be adjacent
  if (!isAdjacent(from, to)) {
    console.log('Adjacent check failed:', {
      fromCoord: `${from.x},${from.y}`,
      toCoord: `${to.x},${to.y}`
    });
    return false;
  }
  
  // Cannot revisit points
  const toKey = `${to.x},${to.y}`;
  const hasVisited = currentPath.some(p => `${p.x},${p.y}` === toKey);
  if (hasVisited) {
    console.log('Already visited this point:', toKey);
    return false;
  }

  // If clicking a numbered dot, it must be the next number in sequence
  if (to.number) {
    // Find the last numbered dot in the path
    const lastNumberedDot = [...currentPath].reverse().find(p => p.number !== undefined);
    const expectedNumber = (lastNumberedDot?.number ?? 0) + 1;
    
    const isValidNumber = to.number === expectedNumber;
    console.log('Number sequence check:', {
      isValid: isValidNumber,
      lastNumber: lastNumberedDot?.number || 'none',
      expectedNumber,
      actualNumber: to.number
    });
    return isValidNumber;
  }

  // Can move through unnumbered dots
  return true;
};

export const checkWinCondition = (path: Point[], numberedDots: Point[]): boolean => {
  return path.length >= numberedDots.length &&
    path.filter(p => p.number).length === numberedDots.length &&
    path[path.length - 1].number === numberedDots.length;
}; 