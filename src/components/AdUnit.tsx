import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Declare adsbygoogle on window object
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AdUnit: React.FC<AdUnitProps> = ({ isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      // Initialize the ad when the component becomes visible
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative w-full max-w-3xl mx-4"
            style={{
              minHeight: '300px',
              maxHeight: 'calc(90vh - 2rem)',
              aspectRatio: '4/3'
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Ad container */}
            <div className="w-full h-full">
              <ins
                className="adsbygoogle"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  minHeight: '300px'
                }}
                data-ad-client="ca-pub-7253609224696658"
                data-ad-slot="5304067023"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 