import React from 'react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdUnit: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-lg mx-auto px-4 py-4"
    >
      <div 
        className="w-full h-[100px] bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
        style={{
          minHeight: '100px',
          maxHeight: '100px'
        }}
      >
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
          data-ad-client="ca-pub-2191121256242382"
          data-ad-slot="5224103334"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </motion.div>
  );
}; 