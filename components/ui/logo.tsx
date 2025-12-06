'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <motion.div 
      className={cn('flex items-center gap-2 cursor-pointer', className)}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      <motion.div
        className="relative flex h-8 w-8 items-center justify-center"
        // whileHover removed, inherits from parent
      >
        {/* Pin Shape */}
        <motion.svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-orange-500"
        >
          <motion.path
            d="M16 2C10.477 2 6 6.477 6 12C6 19.5 16 30 16 30C16 30 26 19.5 26 12C26 6.477 21.523 2 16 2Z"
            fill="currentColor"
            variants={{
              initial: { y: -20, opacity: 0 },
              animate: { 
                y: 0, 
                opacity: 1,
                transition: { 
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }
              },
              hover: { 
                y: -20,
                transition: { 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }
            }}
          />
          
          {/* Fork Negative Space (White) */}
          <motion.path
            d="M16 6C17.5 6 18.5 7 18.5 8.5V11.5C18.5 12.88 17.38 14 16 14C14.62 14 13.5 12.88 13.5 11.5V8.5C13.5 7 14.5 6 16 6ZM16 14V20"
            stroke="white" // Use background color for negative space effect
            strokeWidth="2"
            strokeLinecap="round"
            className="dark:stroke-neutral-950" // Adapt to dark mode
            variants={{
              initial: { pathLength: 0, opacity: 0 },
              animate: { 
                pathLength: 1, 
                opacity: 1,
                transition: { delay: 0.3, duration: 0.5 }
              }
            }}
          />
        </motion.svg>
      </motion.div>

      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          variants={{
            hover: { 
              scale: 1.05,
              x: 2,
              transition: { duration: 0.2 }
            }
          }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col"
        >
          <h1 className="text-xl font-bold leading-none text-neutral-900 dark:text-neutral-50">
            mekan<span className="text-orange-500 transition-colors duration-300">.guru</span>
          </h1>
        </motion.div>
      )}
    </motion.div>
  );
}
