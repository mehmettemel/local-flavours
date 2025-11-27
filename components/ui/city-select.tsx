'use client';

import React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { TURKISH_CITIES } from '@/lib/data/turkish-cities';

interface CitySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Normalize Turkish characters for better search
function normalizeTurkish(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

export function CitySelect({
  value,
  onValueChange,
  placeholder = 'Şehir seç...',
  disabled = false,
  className,
}: CitySelectProps) {
  const [open, setOpen] = React.useState(false);

  // Add "Genel" option at the top, then sort cities alphabetically
  const cities = React.useMemo(
    () => [
      { id: 'genel', name: '🌍 Genel (Tüm Şehirler)', slug: 'genel' },
      ...[...TURKISH_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'tr')),
    ],
    []
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content
        align="start"
        sideOffset={4}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-0 shadow-md outline-hidden'
        )}
      >
        <Command
          filter={(itemValue, search) => {
            const normalizedValue = normalizeTurkish(itemValue);
            const normalizedSearch = normalizeTurkish(search);
            if (normalizedValue.includes(normalizedSearch)) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder="Şehir ara..." />
          <CommandList>
            <CommandEmpty>Şehir bulunamadı.</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer",
                    value === city.name && "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100"
                  )}
                >
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
}
