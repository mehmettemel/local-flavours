'use client';

import { motion } from 'framer-motion';
import { MapPin, Sparkles, ArrowDown } from 'lucide-react';

export function CompactHero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-orange-950/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-orange-200/30 to-transparent blur-3xl dark:from-orange-600/10" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-medium text-orange-700 shadow-sm backdrop-blur-sm dark:border-orange-800/50 dark:bg-neutral-900/80 dark:text-orange-400">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
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
            className="mb-4 max-w-3xl text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl dark:text-neutral-50"
          >
            <span className="inline-block">Keşfet.</span>{' '}
            <motion.span 
              className="inline-block bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Oyla.
            </motion.span>{' '}
            <span className="inline-block">Paylaş.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 max-w-xl text-lg text-neutral-600 md:text-xl dark:text-neutral-400"
          >
            Gerçek insanların önerdiği en iyi mekanları bul,{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">
              topluluk oylarıyla
            </span>{' '}
            en güvenilir listelere ulaş.
          </motion.p>

          {/* Floating Location Icons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-500"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
              className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800"
            >
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
              <span>İstanbul</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5, delay: 0.2 }}
              className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800"
            >
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
              <span>Ankara</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5, delay: 0.4 }}
              className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800"
            >
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
              <span>İzmir</span>
            </motion.div>
            <span className="text-neutral-400 dark:text-neutral-600">+ 78 şehir</span>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-1 text-neutral-400 dark:text-neutral-600"
            >
              <span className="text-xs">Keşfetmeye Başla</span>
              <ArrowDown className="h-4 w-4" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
