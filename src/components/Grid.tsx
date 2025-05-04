import React, { useRef, useEffect } from 'react';
import { Point } from '../types';
import { Dot } from './Dot';
import { motion } from 'framer-motion';

interface GridProps {
  grid: Point[][];
  currentPath: Point[];
  onDotClick: (point: Point) => void;
}

interface DotCenter {
  x: number;
  y: number;
}

export const Grid: React.FC<GridProps> = ({ grid, currentPath, onDotClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Grid measurements
  const GRID_SIZE = 5;
  const DOT_SIZE = 32; // w-8 = 2rem = 32px
  const GAP_SIZE = 12; // gap-3 = 0.75rem = 12px
  const TOTAL_CELL_SIZE = DOT_SIZE + GAP_SIZE;
  const GRID_WIDTH = TOTAL_CELL_SIZE * GRID_SIZE - GAP_SIZE;
  const PADDING = 16; // p-4 = 1rem = 16px
  const LINE_WIDTH = 8;
  const PIXEL_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  // Helper function to calculate dot center coordinates
  const calculateDotCenter = (point: Point): DotCenter => {
    return {
      x: PADDING + (point.x * (TOTAL_CELL_SIZE)) + (DOT_SIZE / 2),
      y: PADDING + (point.y * (TOTAL_CELL_SIZE)) + (DOT_SIZE / 2)
    };
  };

  // Helper function to calculate control points for smooth curves
  const calculateControlPoints = (start: DotCenter, end: DotCenter): DotCenter => {
    // For vertical or horizontal lines, use the midpoint
    if (start.x === end.x || start.y === end.y) {
      return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
      };
    }

    // For diagonal lines, use a more natural curve
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up high-resolution canvas
    const canvasWidth = (GRID_WIDTH + PADDING * 2) * PIXEL_RATIO;
    const canvasHeight = (GRID_WIDTH + PADDING * 2) * PIXEL_RATIO;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${GRID_WIDTH + PADDING * 2}px`;
    canvas.style.height = `${GRID_WIDTH + PADDING * 2}px`;
    
    // Scale all drawing operations
    ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
    
    // Clear canvas with pixel-perfect clearing
    ctx.clearRect(0, 0, canvasWidth / PIXEL_RATIO, canvasHeight / PIXEL_RATIO);

    // Draw lines between connected dots
    if (currentPath.length > 1) {
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, GRID_WIDTH, GRID_WIDTH);
      gradient.addColorStop(0, '#818CF8'); // game-primary-light
      gradient.addColorStop(1, '#6366F1'); // game-primary

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add shadow
      ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';
      ctx.shadowBlur = 8 * PIXEL_RATIO; // Scale blur for high DPI
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw path with precise centering
      currentPath.forEach((point, index) => {
        const currentCenter = calculateDotCenter(point);
        
        if (index === 0) {
          ctx.moveTo(currentCenter.x, currentCenter.y);
        } else {
          const prevCenter = calculateDotCenter(currentPath[index - 1]);
          const controlPoint = calculateControlPoints(prevCenter, currentCenter);
          
          // Draw the path segment
          ctx.quadraticCurveTo(
            controlPoint.x,
            controlPoint.y,
            currentCenter.x,
            currentCenter.y
          );
        }
      });

      ctx.stroke();
    }
  }, [currentPath]);

  return (
    <motion.div 
      ref={containerRef}
      className="relative inline-block p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
      <div 
        ref={gridRef}
        className="grid grid-cols-5 gap-3 relative z-10"
        style={{
          width: GRID_WIDTH,
          height: GRID_WIDTH,
        }}
      >
        {grid.map((row, y) =>
          row.map((point, x) => {
            const gridPoint: Point = { x, y, number: point.number };
            return (
              <Dot
                key={`${x}-${y}`}
                point={gridPoint}
                isActive={currentPath.some(p => p.x === x && p.y === y)}
                isConnected={currentPath.some(p => p.x === x && p.y === y)}
                onClick={() => onDotClick(gridPoint)}
              />
            );
          })
        )}
      </div>
    </motion.div>
  );
}; 