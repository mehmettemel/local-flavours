'use client';

import { motion } from 'framer-motion';
import { MapPin, Sparkles, ArrowDown } from 'lucide-react';

// Animated Border Component - Spinning gradient line
function AnimatedBorder() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
      {/* Spinning gradient border */}
      <motion.div
        className="absolute inset-[-2px]"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, #f97316 60deg, #fbbf24 120deg, transparent 180deg, transparent 360deg)',
          borderRadius: '1.5rem',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner white/dark overlay to create border effect */}
      <div className="absolute inset-[2px] rounded-3xl bg-gradient-to-br from-orange-50/95 via-white/95 to-amber-50/95 dark:from-neutral-900/95 dark:via-neutral-900/95 dark:to-neutral-800/95" />
    </div>
  );
}

// Animated Sparkle Dots
function SparklingDots() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-orange-400/60"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function CompactHero() {
  return (
    <section className="relative py-12 md:py-16">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/10 dark:to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-4xl">
          {/* Animated Border Frame */}
          <AnimatedBorder />
          
          {/* Sparkling Dots */}
          <SparklingDots />
          
          {/* Content Container */}
          <div className="relative flex flex-col items-center px-6 py-12 text-center md:px-12 md:py-16">
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-medium text-orange-700 shadow-lg shadow-orange-500/10 backdrop-blur-sm dark:border-orange-800/50 dark:bg-neutral-900/80 dark:text-orange-400">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                <span>Türkiye&apos;nin Mekan Rehberi</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl dark:text-neutral-50"
            >
              <span className="inline-block">Keşfet.</span>{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                  Oyla.
                </span>
                {/* Underline glow effect */}
                <motion.span
                  className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>{' '}
              <span className="inline-block">Paylaş.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 max-w-xl text-base text-neutral-600 md:text-lg dark:text-neutral-400"
            >
              Gerçek insanların önerdiği en iyi mekanları bul,{' '}
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                topluluk oylarıyla
              </span>{' '}
              en güvenilir listelere ulaş.
            </motion.p>

            {/* Floating Location Icons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-500 md:gap-3 dark:text-neutral-500"
            >
              {['İstanbul', 'Ankara', 'İzmir', 'Bursa'].map((city, index) => (
                <motion.div
                  key={city}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 0.5, 
                    delay: index * 0.15 
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 shadow-sm dark:bg-neutral-800/80"
                >
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span>{city}</span>
                </motion.div>
              ))}
              <motion.span 
                className="text-neutral-400 dark:text-neutral-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                + 77 şehir
              </motion.span>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-10"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-1 text-neutral-400 dark:text-neutral-600"
              >
                <span className="text-xs font-medium">Keşfetmeye Başla</span>
                <ArrowDown className="h-4 w-4" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
