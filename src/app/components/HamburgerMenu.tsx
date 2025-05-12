'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';

interface HamburgerMenuProps {
  userName: string;
  userImage?: string | null;
  firstName?: string | null;
}

export default function HamburgerMenu({ userName, userImage, firstName }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  const buttonVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 }
  };

  const lineVariants = {
    closed: {
      rotate: 0,
      translateY: 0,
      opacity: 1
    },
    open: (i: number) => ({
      rotate: i === 1 ? 45 : i === 2 ? -45 : 0,
      translateY: i === 1 ? 8 : i === 2 ? -8 : 0,
      opacity: i === 0 ? 0 : 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    })
  };

  return (
    <div className="md:hidden fixed top-4 right-4 z-[100]">
      {/* Hamburger Button */}
      <motion.button
        className="relative p-2 flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        animate={isOpen ? "open" : "closed"}
        variants={buttonVariants}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-6 h-0.5 bg-white/90 transform origin-center"
            variants={lineVariants}
            custom={i}
            style={{
              transformOrigin: "center",
              marginBottom: i !== 2 ? "0.375rem" : "0"
            }}
          />
        ))}
      </motion.button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 h-screen w-64 bg-dark-200/95 backdrop-blur-lg z-[95] shadow-xl"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="p-6 space-y-6">
              {/* User Profile Section */}
              <div className="flex items-center space-x-4 border-b border-white/10 pb-6">
                {userImage && (
                  <motion.img
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    src={userImage}
                    alt={userName}
                    className="w-12 h-12 rounded-full ring-2 ring-accent-blue/30"
                  />
                )}
                <div>
                  <motion.p
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="font-semibold text-white/90"
                  >
                    {firstName || userName}
                  </motion.p>
                  <motion.p
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm text-white/60"
                  >
                    {userName}
                  </motion.p>
                </div>
              </div>

              {/* Menu Items */}
              <motion.div
                className="space-y-4"
                initial="closed"
                animate="open"
                variants={{
                  open: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <motion.button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 text-accent-pink hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-2"
                  variants={{
                    closed: { x: 20, opacity: 0 },
                    open: { x: 0, opacity: 1 }
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Sign Out</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 