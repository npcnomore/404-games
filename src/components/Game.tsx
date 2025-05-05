import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid } from './Grid';
import { AdUnit } from './AdUnit';
import { generatePuzzle, isValidMove, checkWinCondition, validateConfig } from '../utils/gameLogic';
import { GameState, Point, GameConfig } from '../types';
import { Instructions } from './Instructions';

interface ConfigPanelProps {
  config: GameConfig;
  onConfigChange: (newConfig: GameConfig) => void;
  onClose: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange, onClose }) => {
  const [localConfig, setLocalConfig] = useState<GameConfig>(config);

  const handleChange = (field: keyof GameConfig, value: any) => {
    let newValue = value;
    
    // Enforce limits for grid size
    if (field === 'gridSize') {
      newValue = Math.min(Math.max(3, parseInt(value) || 3), 9);
    }
    
    // Enforce limits for numbered dots (max 15)
    if (field === 'numberedDotsCount') {
      const maxDots = Math.min(15, (localConfig.gridSize || 5) * (localConfig.gridSize || 5));
      newValue = Math.min(Math.max(2, parseInt(value) || 2), maxDots);
    }

    const newConfig = { ...localConfig, [field]: newValue };
    setLocalConfig(newConfig);
  };

  const handleSave = () => {
    onConfigChange(validateConfig(localConfig));
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Game Settings</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Grid Size
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {localConfig.gridSize || 5}×{localConfig.gridSize || 5}
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="9"
              step="1"
              value={localConfig.gridSize || 5}
              onChange={(e) => handleChange('gridSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>3×3</span>
              <span>9×9</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Dots
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {localConfig.numberedDotsCount || 5}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max={Math.min(15, (localConfig.gridSize || 5) * (localConfig.gridSize || 5))}
              step="1"
              value={localConfig.numberedDotsCount || 5}
              onChange={(e) => handleChange('numberedDotsCount', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>2</span>
              <span>15</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={localConfig.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const puzzle = generatePuzzle(new Date());
    console.log('Initial puzzle state:', puzzle);
    return puzzle;
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAd, setShowAd] = useState(false);

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
      setShowAd(true); // Show ad first
    }

    setGameState(prev => ({
      ...prev,
      currentPath: newPath,
      moveCount: prev.moveCount + 1
    }));
  };

  const handleAdClose = () => {
    setShowAd(false);
    setShowSuccess(true); // Show success message after ad is closed
  };

  const handleReset = () => {
    // Generate a new seed for each reset to ensure different number positions
    const seed = `${Date.now()}-${Math.random()}`;
    const config = gameState.config ? { ...gameState.config, seed } : { seed };
    const newPuzzle = generatePuzzle(new Date(), config);
    setGameState(newPuzzle);
    setShowSuccess(false);
    setShowAd(false);
    
    // Clear completion state
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`puzzle_completed_${today}`);
  };

  const handleConfigChange = (newConfig: GameConfig) => {
    // Enforce grid size limits
    const validatedConfig = {
      ...newConfig,
      gridSize: Math.min(Math.max(3, newConfig.gridSize || 3), 9),
      seed: `${Date.now()}-${Math.random()}` // New seed for new config
    };
    
    // Ensure number of dots doesn't exceed grid capacity
    if (validatedConfig.numberedDotsCount) {
      validatedConfig.numberedDotsCount = Math.min(
        validatedConfig.numberedDotsCount,
        validatedConfig.gridSize * validatedConfig.gridSize
      );
    }

    const newPuzzle = generatePuzzle(new Date(), validatedConfig);
    setGameState(newPuzzle);
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Main game content */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 px-4">
        <motion.header 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-2 text-gray-900 dark:text-white">Thread</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Weave your path through the puzzle!</p>
        </motion.header>

        <div className="relative flex flex-col items-center gap-6">
          <Grid
            grid={gameState.grid}
            currentPath={gameState.currentPath}
            onDotClick={handleDotClick}
          />

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-4 py-2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 dark:text-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L5 9M2 12L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Restart</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConfig(true)}
              className="px-4 py-2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 dark:text-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74485 20.1656 6.23582 20.3766 5.705 20.3766C5.17418 20.3766 4.66515 20.1656 4.29 19.79C3.91435 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91435 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95231 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87231 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83435 6.74485 3.62343 6.23582 3.62343 5.705C3.62343 5.17418 3.83435 4.66515 4.21 4.29C4.58515 3.91435 5.09418 3.70343 5.625 3.70343C6.15582 3.70343 6.66485 3.91435 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95231 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87231 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83435 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83435 19.71 4.21C20.0856 4.58515 20.2966 5.09418 20.2966 5.625C20.2966 6.15582 20.0856 6.66485 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Settings</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInstructions(true)}
              className="px-4 py-2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 dark:text-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>How to Play</span>
            </motion.button>
          </div>

          <Instructions
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
          />

          <AdUnit
            isVisible={showAd}
            onClose={handleAdClose}
          />

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl"
              >
                <div className="text-center p-6">
                  <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                    Puzzle Complete! 🎉
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                    Moves: {gameState.moveCount}
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 text-lg bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showConfig && (
          <ConfigPanel
            config={gameState.config || {}}
            onConfigChange={handleConfigChange}
            onClose={() => setShowConfig(false)}
          />
        )}
      </div>
      {/* Ad section - fixed height */}
      <AdUnit 
        isVisible={showAd}
        onClose={handleAdClose}
      />
    </div>
  );
};