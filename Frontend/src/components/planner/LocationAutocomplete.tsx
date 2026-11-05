import React, { useState, useEffect, useRef } from 'react';
import { LocationItem } from '@/types';
import { searchLocations } from '@/services/geocodingService';
import { MapPin, Search, Loader2, X, Check } from 'lucide-react';

interface LocationAutocompleteProps {
  label: string;
  placeholder: string;
  value: LocationItem | null;
  onChange: (location: LocationItem) => void;
  iconColor?: string;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  iconColor = 'text-[#2f8a9d]',
  required = false,
}) => {
  const [query, setQuery] = useState(value ? value.name : '');
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep internal text aligned if external value changes
  useEffect(() => {
    if (value) {
      setQuery(value.name);
    }
  }, [value]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // If query matches current selected location, don't re-search immediately
    if (value && value.name === query) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, value]);

  const handleSelect = (loc: LocationItem) => {
    onChange(loc);
    setQuery(loc.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label className="block text-xs font-semibold text-forest-200">
        {label} {required && <span className="text-greenroute-riskRed">*</span>}
      </label>

      <div className="relative flex items-center">
        <div className={`absolute left-3.5 ${iconColor} pointer-events-none`}>
          <MapPin className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (!query) {
              searchLocations('').then(setSuggestions);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-forest-850/80 border border-forest-750/70 text-sm text-forest-100 placeholder:text-forest-400 focus:outline-none focus:border-[#2f8a9d] focus:ring-1 focus:ring-[#2f8a9d]/50 transition"
        />

        <div className="absolute right-3 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#2f8a9d] animate-spin" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-forest-400 hover:text-white hover:bg-forest-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-forest-850 border border-forest-700/80 shadow-2xl z-50 divide-y divide-forest-800">
          {suggestions.length > 0 ? (
            suggestions.map((loc, idx) => {
              const isSelected =
                value?.name === loc.name ||
                (value?.lat === loc.lat && value?.lon === loc.lon);
              return (
                <button
                  key={`${loc.name}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-forest-800/80 transition flex items-start gap-2.5 group"
                >
                  <MapPin className="w-4 h-4 text-[#2f8a9d] mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-forest-100 truncate">
                        {loc.name}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#3ec99f] flex-shrink-0" />
                      )}
                    </div>
                    {loc.address && (
                      <p className="text-[11px] text-forest-400 truncate">
                        {loc.address}
                      </p>
                    )}
                    <span className="text-[10px] text-forest-500 font-mono">
                      {loc.lat.toFixed(4)}°N, {loc.lon.toFixed(4)}°E
                    </span>
                  </div>
                </button>
              );
            })
          ) : !isLoading && query.length >= 2 ? (
            <div className="px-4 py-3 text-xs text-forest-400 text-center">
              No geocoded locations found for "{query}".
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-forest-400 text-center flex items-center justify-center gap-1.5">
              <Search className="w-3.5 h-3.5" /> Type to search corridor locations
            </div>
          )}
        </div>
      )}
    </div>
  );
};

