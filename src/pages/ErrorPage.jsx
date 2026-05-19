import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      {/* Animated SVG Illustration - MTN styled */}
      <div className="relative w-full max-w-md mb-8">
        <motion.svg
          viewBox="0 0 500 500"
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="drop-shadow-2xl"
        >
          {/* Background Blob - Light gray (matches sidebar gray-400 tones) */}
          <circle cx="250" cy="250" r="200" fill="#F1F5F9" />
          
          {/* Main Error Character/Icon - MTN Yellow */}
          <motion.path
            d="M150 350 L350 350 L250 150 Z"
            fill="#FFCC00"   // mtn-yellow
            stroke="#000000" // mtn-black
            strokeWidth="8"
          />
          
          {/* The "!" mark - Black */}
          <rect x="240" y="220" width="20" height="70" rx="10" fill="#000000" />
          <circle cx="250" cy="315" r="12" fill="#000000" />

          {/* Floating Small Elements - Gray tones */}
          <motion.circle 
            cx="100" cy="150" r="10" fill="#64748B" 
            animate={{ opacity: [0.4, 1, 0.4] }} 
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle 
            cx="400" cy="280" r="15" fill="#94A3B8" 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.svg>
      </div>

      {/* Error Text Content - Using sidebar text colors */}
      <h1 className="text-8xl font-black text-slate-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-700 mb-6">
        Oops! You've drifted into deep space.
      </h2>
      <p className="text-slate-500 max-w-sm mb-10 leading-relaxed">
        The page you’re looking for doesn’t exist or has been moved to another quadrant.
      </p>

      {/* Action Button - Matches sidebar active button style (mtn-yellow bg, black text, rounded-lg, transition) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGoBack}
        className="px-8 py-3 bg-mtn-yellow text-black font-medium rounded-lg shadow-md shadow-yellow-200 hover:bg-yellow-500 transition-colors"
      >
        Take Me Back
      </motion.button>

      {/* Subtle Footer Decor - matches sidebar footer text-gray-400 */}
      <div className="absolute bottom-10 text-gray-400 text-sm">
        Error Code: <span className="font-mono">ERR_PAGE_NOT_FOUND</span>
      </div>
    </div>
  );
};

export default ErrorPage;