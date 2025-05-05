import React, { useRef, useEffect, useState } from 'react';
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

interface GridDimensions {
  width: number;
  height: number;
  dotSize: number;
  gapSize: number;
  padding: number;
  lineWidth: number;
}

export const Grid: React.FC<GridProps> = ({ grid, currentPath, onDotClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<GridDimensions>({
    width: 0,
    height: 0,
    dotSize: 0,
    gapSize: 0,
    padding: 0,
    lineWidth: 0
  });
  
  // Grid measurements
  const GRID_SIZE = grid.length;
  
  // Calculate sizes based on screen size
  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Calculate the maximum available space while maintaining margins
      const maxAvailableWidth = Math.min(screenWidth * 0.9, 480); // 90% of width on mobile, max 480px on desktop
      const maxAvailableHeight = Math.min(screenHeight * 0.6, 480); // 60% of height on mobile, max 480px
      const maxSize = Math.min(maxAvailableWidth, maxAvailableHeight);
      
      // Calculate base size for dots and gaps
      const totalGridSpace = maxSize - 32; // Account for padding
      const cellSpace = Math.floor(totalGridSpace / GRID_SIZE);
      
      // Calculate dot and gap sizes proportionally
      const dotSize = Math.max(32, Math.min(44, Math.floor(cellSpace * 0.75)));
      const gapSize = Math.max(8, Math.min(16, Math.floor(cellSpace * 0.25)));
      
      // Calculate total grid size
      const totalSize = (dotSize + gapSize) * GRID_SIZE - gapSize;
      
      setDimensions({
        width: totalSize,
        height: totalSize,
        dotSize,
        gapSize,
        padding: 16,
        lineWidth: Math.max(6, Math.min(10, Math.floor(dotSize * 0.2)))
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [GRID_SIZE]);

  // Helper function to calculate dot center coordinates
  const calculateDotCenter = (point: Point): DotCenter => {
    const { dotSize, gapSize, padding } = dimensions;
    const x = point.x * (dotSize + gapSize) + dotSize / 2 + padding;
    const y = point.y * (dotSize + gapSize) + dotSize / 2 + padding;
    return { x, y };
  };

  useEffect(() => {
    if (!dimensions.width) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, padding, lineWidth } = dimensions;
    const totalWidth = width + padding * 2;
    const totalHeight = height + padding * 2;
    const PIXEL_RATIO = window.devicePixelRatio || 1;
    
    canvas.width = totalWidth * PIXEL_RATIO;
    canvas.height = totalHeight * PIXEL_RATIO;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    
    ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
    ctx.clearRect(0, 0, totalWidth, totalHeight);

    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      currentPath.forEach((point, index) => {
        const { x, y } = calculateDotCenter(point);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    }
  }, [currentPath, dimensions]);

  if (!dimensions.width) return null;

  return (
    <motion.div 
      ref={containerRef}
      className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: dimensions.padding,
        width: dimensions.width + dimensions.padding * 2,
        height: dimensions.height + dimensions.padding * 2,
        maxWidth: '90vw',
        maxHeight: '60vh',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      <div 
        ref={gridRef}
        className="grid relative z-10"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${dimensions.dotSize}px)`,
          gap: `${dimensions.gapSize}px`,
        }}
      >
        {grid.map((row, y) =>
          row.map((point, x) => {
            const gridPoint: Point = { x, y, number: point.number };
            return (
              <Dot
                key={`${x}-${y}`}
                point={gridPoint}
                size={dimensions.dotSize}
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