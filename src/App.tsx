import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, CloudLightning, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

import { CityResult, WeatherData, CurrentWeather, DailyForecast, HourlyForecast } from './types';
import CitySearch from './components/CitySearch';
import CurrentWeatherComponent from './components/CurrentWeather';
import ForecastSection from './components/ForecastSection';
import WeatherTrendChart from './components/WeatherTrendChart';
import Recommendations from './components/Recommendations';

const DEFAULT_CITY: CityResult = {
  id: 2643743,
  name: 'London',
  latitude: 51.50853,
  longitude: -0.12574,
  country: 'United Kingdom',
  country_code: 'GB',
  timezone: 'Europe/London'
};

export default function App() {
  const [activeCity, setActiveCity] = useState<CityResult>(() => {
    const saved = localStorage.getItem('weather_active_city');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_CITY;
      }
    }
    return DEFAULT_CITY;
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch forecast data when city changes
  useEffect(() => {
    let isMounted = true;

    async function fetchWeather() {
      setIsLoading(true);
      setError(null);
      
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${activeCity.latitude}&longitude=${activeCity.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to retrieve forecast details from the server.');
        }

        const data = await response.json();
        
        if (!data || !data.current || !data.daily || !data.hourly) {
          throw new Error('Retrieved weather payload was malformed or incomplete.');
        }

        // Map data to structured types
        const mappedCurrent: CurrentWeather = {
          temperature: data.current.temperature_2m,
          apparentTemperature: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          precipitation: data.current.precipitation,
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
          time: data.current.time
        };

        const mappedDaily: DailyForecast[] = data.daily.time.map((timeStr: string, idx: number) => ({
          date: timeStr,
          dayOfWeek: '',
          weatherCode: data.daily.weather_code[idx],
          tempMax: data.daily.temperature_2m_max[idx],
          tempMin: data.daily.temperature_2m_min[idx],
          apparentTempMax: data.daily.apparent_temperature_max[idx],
          apparentTempMin: data.daily.apparent_temperature_min[idx],
          precipitationSum: data.daily.precipitation_sum[idx],
          windSpeedMax: data.daily.wind_speed_10m_max[idx],
          uvIndexMax: data.daily.uv_index_max[idx],
          sunrise: data.daily.sunrise[idx],
          sunset: data.daily.sunset[idx]
        }));

        const mappedHourly: HourlyForecast[] = data.hourly.time.map((timeStr: string, idx: number) => ({
          time: timeStr,
          temperature: data.hourly.temperature_2m[idx],
          humidity: data.hourly.relative_humidity_2m[idx],
          precipitationProbability: data.hourly.precipitation_probability[idx],
          weatherCode: data.hourly.weather_code[idx]
        }));

        if (isMounted) {
          setWeatherData({
            city: activeCity,
            current: mappedCurrent,
            daily: mappedDaily,
            hourly: mappedHourly
          });
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching weather data:', err);
        if (isMounted) {
          setError(err.message || 'An unexpected error occurred while communicating with Open-Meteo.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [activeCity]);

  // Persist city to localStorage
  const handleSelectCity = (city: CityResult) => {
    setActiveCity(city);
    localStorage.setItem('weather_active_city', JSON.stringify(city));
  };

  const handleReset = () => {
    handleSelectCity(DEFAULT_CITY);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col antialiased">
      
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />

      {/* Main Header */}
      <header className="relative w-full border-b border-slate-800/60 bg-[#1e293b]/40 backdrop-blur-md px-6 py-5 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500 text-white rounded-2xl shadow-lg shadow-sky-500/20">
              <CloudLightning className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Weather Intel
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Live System Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/50 px-3.5 py-1.5 rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Station: {activeCity.name}, {activeCity.country_code}</span>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 z-10">
        
        {/* City Search and Selector Bar */}
        <section className="w-full flex justify-center">
          <CitySearch onSelectCity={handleSelectCity} currentCity={activeCity} />
        </section>

        {/* Dashboard Panels */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* Loading Skeleton */
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-8"
              id="dashboard-skeleton"
            >
              {/* Primary Weather Card Skeleton */}
              <div className="w-full h-64 bg-slate-800/40 animate-pulse rounded-3xl border border-slate-800/50" />
              
              {/* Trends Skeleton */}
              <div className="w-full h-[320px] bg-slate-800/40 animate-pulse rounded-3xl border border-slate-800/50" />

              {/* Forecast cards Row Skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-44 bg-slate-800/40 animate-pulse rounded-2xl border border-slate-800/50" />
                ))}
              </div>
            </motion.div>
          ) : error ? (
            /* Error Card */
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-2xl mx-auto bg-slate-900/80 border border-red-500/20 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center gap-5 my-12 backdrop-blur-md"
              id="error-card"
            >
              <div className="p-4 bg-red-950/50 text-red-400 rounded-full border border-red-900/30">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Station Communication Interrupted</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
                  {error}
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => handleSelectCity(activeCity)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm shadow-md shadow-sky-500/10 hover:shadow transition-all cursor-pointer"
                  id="retry-fetch-btn"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Try Again
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  id="reset-default-btn"
                >
                  Reset Station
                </button>
              </div>
            </motion.div>
          ) : weatherData ? (
            /* Full Dashboard Grid */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-8"
              id="dashboard-data"
            >
              {/* Row 1: Current weather */}
              <section aria-label="Current Weather Details">
                <CurrentWeatherComponent data={weatherData} />
              </section>

              {/* Row 2: Analytics & Trends */}
              <section aria-label="Weather Analytics and Trends">
                <WeatherTrendChart 
                  hourlyData={weatherData.hourly} 
                  dailyData={weatherData.daily} 
                />
              </section>

              {/* Row 3: 7-Day Forecast cards */}
              <section aria-label="7-Day Future Weather Forecast">
                <ForecastSection forecasts={weatherData.daily} />
              </section>

              {/* Row 4: Intelligent recommendations */}
              <section aria-label="Travel and Planning Recommendations">
                <Recommendations data={weatherData} />
              </section>
            </motion.div>
          ) : null}
        </AnimatePresence>

      </main>

      {/* Global Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-xs py-6 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Weather Intel Dashboard • 2026-07-16</span>
          </div>
          <span>Powered by Open-Meteo Public API • No Private Credentials Required</span>
        </div>
      </footer>

    </div>
  );
}
