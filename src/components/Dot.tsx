import { Point } from '../types';
import { motion } from 'framer-motion';

interface DotProps {
  point: Point;
  size?: number;
  isActive: boolean;
  isConnected: boolean;
  onClick: () => void;
}

export const Dot: React.FC<DotProps> = ({ point, size = 44, isActive, isConnected, onClick }) => {
  const buttonClasses = [
    // Base styles
    "rounded-full",
    "flex items-center justify-center",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-game-primary-light/50",
    "border-0 appearance-none",
    "z-0",
    // State-based styles
    isActive 
      ? "bg-gradient-to-br from-game-primary-light to-game-primary-dark text-white shadow-lg shadow-game-primary/20" 
      : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300",
    isConnected 
      ? "ring-4 ring-game-primary-light/30" 
      : "",
    // Dark mode
    "dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700",
    isActive && "dark:from-game-primary-dark dark:to-game-primary",
    // Ensure the entire button is clickable
    "cursor-pointer select-none"
  ].filter(Boolean).join(" ");

  const contentClasses = [
    "w-full h-full",
    "flex items-center justify-center",
    "pointer-events-none",
    point.number ? (
      isActive 
        ? "font-bold text-white"
        : "font-bold text-gray-900 dark:text-white"
    ) : "text-gray-400 dark:text-gray-500",
    "font-sans tracking-tight"
  ].join(" ");

  // Calculate font size based on dot size
  const fontSize = Math.max(16, Math.round(size * 0.4)); // 40% of dot size, minimum 16px

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={buttonClasses}
      style={{
        width: size,
        height: size,
      }}
      onClick={onClick}
      aria-label={point.number ? `Number ${point.number}` : 'Empty dot'}
    >
      <motion.div 
        className={contentClasses}
        initial={point.number ? { opacity: 0, y: -10 } : {}}
        animate={point.number ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.2 }}
        style={{
          fontSize: `${fontSize}px`,
        }}
      >
        {point.number || "•"}
      </motion.div>
    </motion.button>
  );
}; 