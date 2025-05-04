import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid } from './Grid';
import { generatePuzzle, isValidMove, checkWinCondition } from '../utils/gameLogic';
import { GameState, Point } from '../types';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const puzzle = generatePuzzle(new Date());
    console.log('Initial puzzle state:', puzzle);
    return puzzle;
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Clear any stale completion state
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`puzzle_completed_${today}`);
  }, []);

  const handleDotClick = (point: Point) => {
    console.log('Dot clicked:', point);
    if (showSuccess) {
      console.log('Success screen is showing');
      return;
    }

    const lastPoint = gameState.currentPath[gameState.currentPath.length - 1] || null;
    console.log('Last point:', lastPoint);
    
    const isValid = isValidMove(lastPoint, point, gameState.currentPath);
    console.log('Is valid move:', isValid);

    if (!isValid) return;

    const newPath = [...gameState.currentPath, point];
    const isComplete = checkWinCondition(newPath, gameState.numberedDots);

    console.log('New path:', newPath);
    console.log('Is complete:', isComplete);

    if (isComplete) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`puzzle_completed_${today}`, 'true');
      setShowSuccess(true);
    }

    setGameState(prev => ({
      ...prev,
      currentPath: newPath,
      moveCount: prev.moveCount + 1
    }));
  };

  const handleReset = () => {
    const newPuzzle = generatePuzzle(new Date());
    setGameState(newPuzzle);
    setShowSuccess(false);
    
    // Clear completion state
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`puzzle_completed_${today}`);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-8">
      <motion.header 
        className="text-center w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">Thread</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Connect the dots in order</p>
      </motion.header>

      <div className="relative flex flex-col items-center gap-6">
        <Grid
          grid={gameState.grid}
          currentPath={gameState.currentPath}
          onDotClick={handleDotClick}
        />

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                  Puzzle Complete! 🎉
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Moves: {gameState.moveCount}
                </p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game controls */}
        <motion.button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
          </svg>
          Restart
        </motion.button>
      </div>

      {/* AdSense Placeholder */}
      <div className="w-[300px] h-[250px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        Ad Space (300x250)
      </div>
    </div>
  );
}; 