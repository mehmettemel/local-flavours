import { getTranslations } from 'next-intl/server';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { CityCard } from '@/components/locations/city-card';
import { getCitiesByCountry } from '@/lib/api/locations';

export default async function HomePage() {
  const t = await getTranslations('home');
  const cities = await getCitiesByCountry('turkey');
  console.log(cities);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-neutral-800 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              LocalFlavors
            </h1>
          </div>
          <nav className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex min-h-[80vh] items-center justify-center bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
        <div className="container px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-neutral-900 md:text-7xl dark:text-neutral-50">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-600 md:text-xl dark:text-neutral-400">
            {t('hero.subtitle')}
          </p>
          <button className="rounded-full bg-neutral-900 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200">
            {t('hero.cta')}
          </button>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-20">
        <div className="container px-4">
          <h2 className="mb-12 text-center text-4xl font-bold text-neutral-900 dark:text-neutral-50">
            {t('popularCities')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cities?.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
