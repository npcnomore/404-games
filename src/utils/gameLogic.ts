import seedrandom from 'seedrandom';
import { Point, GameState } from '../types';

const GRID_SIZE = 5;
const NUMBERED_DOTS_COUNT = 5;

export const isAdjacent = (p1: Point, p2: Point): boolean => {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

export const generatePuzzle = (date: Date): GameState => {
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const rng = seedrandom(dateString);

  // Initialize grid
  const grid: Point[][] = Array(GRID_SIZE).fill(null).map((_, y) =>
    Array(GRID_SIZE).fill(null).map((_, x) => ({ x, y }))
  );

  // Generate numbered dots
  const numberedDots: Point[] = [];
  const usedPositions = new Set<string>();

  // Helper to check if a point can be reached from the last point
  const canReachPoint = (from: Point, to: Point, used: Set<string>): boolean => {
    if (used.size === 0) return true;
    
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
        if (
          neighbor.x >= 0 && neighbor.x < GRID_SIZE &&
          neighbor.y >= 0 && neighbor.y < GRID_SIZE &&
          !visited.has(`${neighbor.x},${neighbor.y}`) &&
          !used.has(`${neighbor.x},${neighbor.y}`)
        ) {
          queue.push(neighbor);
          visited.add(`${neighbor.x},${neighbor.y}`);
        }
      }
    }

    return false;
  };

  // Generate first point randomly
  const firstPoint: Point = {
    x: Math.floor(rng() * GRID_SIZE),
    y: Math.floor(rng() * GRID_SIZE),
    number: 1
  };
  numberedDots.push(firstPoint);
  usedPositions.add(`${firstPoint.x},${firstPoint.y}`);
  grid[firstPoint.y][firstPoint.x] = firstPoint;

  // Generate remaining points ensuring they can be connected
  for (let i = 1; i < NUMBERED_DOTS_COUNT; i++) {
    let attempts = 0;
    let found = false;

    while (!found && attempts < 100) {
      const x = Math.floor(rng() * GRID_SIZE);
      const y = Math.floor(rng() * GRID_SIZE);
      const posKey = `${x},${y}`;

      if (!usedPositions.has(posKey)) {
        const point: Point = { x, y, number: i + 1 };
        if (canReachPoint(numberedDots[i - 1], point, usedPositions)) {
          numberedDots.push(point);
          usedPositions.add(posKey);
          grid[y][x] = point;
          found = true;
        }
      }
      attempts++;
    }

    if (!found) {
      // If we can't find a valid point, start over
      return generatePuzzle(date);
    }
  }

  return {
    grid,
    numberedDots,
    currentPath: [],
    isComplete: false,
    moveCount: 0
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