'use client';

import * as React from 'react';
import { Languages, Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, type Locale } from '@/i18n/config';

const languageNames: Record<Locale, { native: string; flag: string }> = {
  en: { native: 'English', flag: '🇬🇧' },
  tr: { native: 'Türkçe', flag: '🇹🇷' },
  es: { native: 'Español', flag: '🇪🇸' },
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale || ''}`);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 rounded-full"
      >
        <Languages className="h-5 w-5" />
      </Button>
    );
  }

  const currentLanguage = languageNames[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <div className="relative flex h-full w-full items-center justify-center">
            <span className="text-lg transition-transform duration-300 hover:scale-110">
              {currentLanguage.flag}
            </span>
          </div>
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
      >
        {locales.map((lang) => {
          const language = languageNames[lang];
          const isActive = locale === lang;

          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => switchLocale(lang)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <span className="text-base">{language.flag}</span>
              <span className="font-medium">{language.native}</span>
              {isActive && (
                <Check className="ml-auto h-4 w-4 text-neutral-900 dark:text-neutral-50" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
