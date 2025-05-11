'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AssistantType = 
  | 'Personal Assistant'
  | 'Girlfriend'
  | 'Boyfriend'
  | 'Technology Specialist'
  | 'Health & Wellness Coach'
  | 'Language Tutor'
  | 'Career Coach'
  | 'Creative Writing Assistant'
  | 'Financial Advisor'
  | 'Gaming Companion'
  | 'Travel Planner';

interface AssistantSelectorProps {
  selectedType: AssistantType;
  onSelect: (type: AssistantType) => void;
}

const assistantTypes: AssistantType[] = [
  'Personal Assistant',
  'Girlfriend',
  'Boyfriend',
  'Technology Specialist',
  'Health & Wellness Coach',
  'Language Tutor',
  'Career Coach',
  'Creative Writing Assistant',
  'Financial Advisor',
  'Gaming Companion',
  'Travel Planner'
];

const assistantIcons: Record<AssistantType, string> = {
  'Personal Assistant': '👤',
  'Girlfriend': '👩',
  'Boyfriend': '👨',
  'Technology Specialist': '💻',
  'Health & Wellness Coach': '🧘‍♂️',
  'Language Tutor': '🗣️',
  'Career Coach': '💼',
  'Creative Writing Assistant': '✍️',
  'Financial Advisor': '💰',
  'Gaming Companion': '🎮',
  'Travel Planner': '✈️'
};

export default function AssistantSelector({ selectedType, onSelect }: AssistantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-dark-100/50 hover:bg-dark-100/70 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-between text-white/90 transition-colors"
      >
        <span className="flex items-center min-w-0 flex-shrink">
          <span className="mr-2 flex-shrink-0">{assistantIcons[selectedType]}</span>
          <span className="truncate">{selectedType}</span>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/60 flex-shrink-0 ml-2"
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-full mt-2 w-full bg-dark-200/95 backdrop-blur-lg rounded-lg border border-white/10 shadow-xl z-50 overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto py-1">
                {assistantTypes.map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    onClick={() => {
                      onSelect(type);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 flex items-center text-left transition-colors ${
                      selectedType === type ? 'text-accent-blue' : 'text-white/80'
                    }`}
                  >
                    <span className="mr-2 flex-shrink-0">{assistantIcons[type]}</span>
                    <span className="truncate">{type}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 