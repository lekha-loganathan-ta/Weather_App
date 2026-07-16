import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, X, Loader2 } from 'lucide-react';
import { CityResult } from '../types';

interface CitySearchProps {
  onSelectCity: (city: CityResult) => void;
  currentCity: CityResult | null;
}

const POPULAR_CITIES: CityResult[] = [
  { id: 5128581, name: 'New York', latitude: 40.71278, longitude: -74.00597, country: 'United States', country_code: 'US', timezone: 'America/New_York' },
  { id: 2643743, name: 'London', latitude: 51.50853, longitude: -0.12574, country: 'United Kingdom', country_code: 'GB', timezone: 'Europe/London' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, country: 'Japan', country_code: 'JP', timezone: 'Asia/Tokyo' },
  { id: 2988507, name: 'Paris', latitude: 48.85341, longitude: 2.3488, country: 'France', country_code: 'FR', timezone: 'Europe/Paris' },
  { id: 2147714, name: 'Sydney', latitude: -33.86785, longitude: 151.20732, country: 'Australia', country_code: 'AU', timezone: 'Australia/Sydney' }
];

export default function CitySearch({ onSelectCity, currentCity }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recents, setRecents] = useState<CityResult[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('weather_recent_searches');
    if (saved) {
      try {
        setRecents(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);

  // Save recent search helper
  const saveToRecents = (city: CityResult) => {
    const updated = [
      city,
      ...recents.filter(item => item.id !== city.id)
    ].slice(0, 5); // Keep top 5 recents
    
    setRecents(updated);
    localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce API calls for geocoding suggestions
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
        );
        const data = await response.json();
        
        if (data && data.results) {
          const results: CityResult[] = data.results.map((item: any) => ({
            id: item.id,
            name: item.name,
            latitude: item.latitude,
            longitude: item.longitude,
            country: item.country || '',
            admin1: item.admin1 || '',
            country_code: item.country_code || '',
            timezone: item.timezone || 'UTC'
          }));
          setSuggestions(results);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching geocoding suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (city: CityResult) => {
    onSelectCity(city);
    saveToRecents(city);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const clearRecents = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecents([]);
    localStorage.removeItem('weather_recent_searches');
  };

  const removeRecentItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = recents.filter(item => item.id !== id);
    setRecents(updated);
    localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4" id="city-search-container">
      {/* Search Input Container */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            id="city-search-input"
            type="text"
            className="w-full pl-12 pr-12 py-3.5 bg-[#1e293b]/60 hover:bg-[#1e293b]/85 focus:bg-[#1e293b] border border-slate-800 focus:border-sky-500 rounded-2xl shadow-md outline-none text-white placeholder-slate-500 font-sans text-base transition-all duration-200 backdrop-blur-md"
            placeholder="Search for a city (e.g., Paris, Kyoto, Calgary)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
          />
          {isLoading && (
            <Loader2 className="absolute right-4 text-sky-400 w-5 h-5 animate-spin" />
          )}
          {!isLoading && query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="absolute right-4 text-slate-400 hover:text-slate-200 transition-colors"
              id="clear-search-btn"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showDropdown && (suggestions.length > 0 || (query.length >= 2 && !isLoading)) && (
          <div
            id="search-dropdown"
            className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {suggestions.length > 0 ? (
              <ul className="divide-y divide-slate-800/50">
                {suggestions.map((city) => (
                  <li key={city.id}>
                    <button
                      onClick={() => handleSelect(city)}
                      className="w-full px-5 py-3.5 hover:bg-slate-800/60 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="text-sky-400 w-5 h-5 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-100">{city.name}</span>
                          {city.admin1 && (
                            <span className="text-slate-400 text-sm">, {city.admin1}</span>
                          )}
                          <span className="text-slate-400 text-sm font-medium">
                            , {city.country}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs uppercase px-2 py-1 bg-slate-800 text-slate-300 rounded font-semibold tracking-wider border border-slate-700/50">
                        {city.country_code}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-center text-slate-400 text-sm">
                No matching cities found. Try checking the spelling.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recents & Quick Select Chips */}
      <div className="flex flex-col gap-2">
        {/* Recents Searches */}
        {recents.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm" id="recent-searches">
            <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
              <Clock className="w-4 h-4" /> Recent:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {recents.map((city) => (
                <div
                  key={city.id}
                  className="flex items-center gap-1 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 rounded-full px-3 py-1 text-slate-300 transition-colors cursor-pointer text-xs font-semibold shadow-2xs"
                  onClick={() => onSelectCity(city)}
                >
                  <span>{city.name}</span>
                  <button
                    onClick={(e) => removeRecentItem(e, city.id)}
                    className="hover:text-red-400 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={clearRecents}
                className="text-xs text-slate-500 hover:text-red-400 font-semibold underline underline-offset-2 ml-1 transition-colors"
                id="clear-recents-btn"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Popular Cities Chips */}
        <div className="flex flex-wrap items-center gap-2 text-sm" id="popular-cities">
          <span className="text-slate-500 font-medium shrink-0">Explore:</span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelect(city)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                  currentCity?.id === city.id
                    ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/15'
                    : 'bg-slate-800/60 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
