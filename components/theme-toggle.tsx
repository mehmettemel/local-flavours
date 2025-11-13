'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 rounded-full"
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <div className="relative flex h-full w-full items-center justify-center">
            <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
            theme === 'light'
              ? 'bg-neutral-100 dark:bg-neutral-800'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
          }`}
        >
          <Sun className="h-4 w-4" />
          <span className="font-medium">Light</span>
          {theme === 'light' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-50" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
            theme === 'dark'
              ? 'bg-neutral-100 dark:bg-neutral-800'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
          }`}
        >
          <Moon className="h-4 w-4" />
          <span className="font-medium">Dark</span>
          {theme === 'dark' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-50" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
            theme === 'system'
              ? 'bg-neutral-100 dark:bg-neutral-800'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
          }`}
        >
          <Laptop className="h-4 w-4" />
          <span className="font-medium">System</span>
          {theme === 'system' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-50" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
