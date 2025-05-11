'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const glowVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark relative overflow-hidden">
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-glow"
        initial="initial"
        animate="animate"
        variants={glowVariants}
      />
      
      {/* Decorative circles */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-accent-blue/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="relative z-10 text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="text-9xl font-bold text-white/90 mb-4"
        >
          404
        </motion.div>
        <motion.h1 
          variants={itemVariants}
          className="text-3xl font-semibold text-white/80 mb-4"
        >
          Page Not Found
        </motion.h1>
        <motion.p 
          variants={itemVariants}
          className="text-lg text-white/60 mb-8"
        >
          Oops! The page you're looking for doesn't exist.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-full bg-accent-blue/90 hover:bg-accent-blue text-white font-semibold transition-all shadow-lg shadow-accent-blue/20 hover:shadow-accent-blue/30"
          >
            <motion.span
              whileHover={{ x: -4 }}
              whileTap={{ x: -8 }}
            >
              ←
            </motion.span>
            <span className="ml-2">Return Home</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
} 