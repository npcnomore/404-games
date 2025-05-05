import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">How to Play Thread</h2>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p className="font-medium text-lg text-gray-800 dark:text-gray-200">
                Connect the dots in ascending order to solve the puzzle!
              </p>
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Rules:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Start by clicking on the dot numbered "1"</li>
                  <li>Connect dots in numerical order (1 → 2 → 3 ...)</li>
                  <li>Create a continuous path without crossing or backtracking</li>
                  <li>You can pass through unnumbered dots</li>
                  <li>The puzzle is complete when you connect all numbered dots</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Tips:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Plan your path ahead - look for the next number before making a move</li>
                  <li>Use unnumbered dots as bridges to reach your target</li>
                  <li>If stuck, try restarting with a fresh perspective</li>
                </ul>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium"
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 