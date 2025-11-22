'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GooglePlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlacesAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  onPlaceSelect: (placeId: string, description: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function GooglePlacesAutocomplete({
  value,
  onValueChange,
  onPlaceSelect,
  placeholder = 'Mekan ara...',
  className,
  disabled = false,
  onKeyDown,
}: GooglePlacesAutocompleteProps) {
  const [predictions, setPredictions] = useState<GooglePlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value || value.trim().length < 2) {
      setPredictions([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/places/search?input=${encodeURIComponent(value)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch predictions');
        }

        const data = await response.json();
        setPredictions(data.predictions || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value]);

  const handleSelect = (prediction: GooglePlacePrediction) => {
    onPlaceSelect(prediction.place_id, prediction.description);
    setShowResults(false);
    setPredictions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setShowResults(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn('pr-10', className)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && predictions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="max-h-[300px] overflow-y-auto p-2">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                onClick={() => handleSelect(prediction)}
                className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-neutral-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 dark:text-neutral-50">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-neutral-200 px-3 py-2 dark:border-neutral-800">
            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/googleg_16dp.png"
                alt="Google"
                className="h-3 w-3"
              />
              Powered by Google
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
