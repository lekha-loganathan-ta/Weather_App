import React from 'react';
import { motion } from 'motion/react';
import { Thermometer, Droplets, Wind, CloudRain, Sun, Sunrise, Sunset } from 'lucide-react';
import { WeatherData } from '../types';
import { getWeatherStyle } from '../utils/weatherUtils';
import WeatherIcon from './WeatherIcon';

interface CurrentWeatherProps {
  data: WeatherData;
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  const { city, current, daily } = data;
  const weatherStyle = getWeatherStyle(current.weatherCode, current.isDay);
  
  // Format current local time of the forecast
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const todayForecast = daily[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-[#1e293b]/70 shadow-2xl backdrop-blur-md"
      id="current-weather-card"
    >
      {/* Background Ambient Glow */}
      <div 
        className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${weatherStyle.gradient} opacity-20 blur-3xl transition-all duration-1000`}
      />
      <div 
        className={`absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-gradient-to-tr ${weatherStyle.gradient} opacity-10 blur-2xl transition-all duration-1000`}
      />

      <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
        
        {/* Left Side: General Overview */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Conditions • {formattedTime}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-white flex items-center gap-2">
            {city.name}
            <span className="text-sm font-bold text-sky-400 bg-sky-950/40 px-2.5 py-1 rounded-xl uppercase border border-sky-800/60">
              {city.country_code}
            </span>
          </h2>
          
          <p className="text-sm text-slate-400 font-medium mt-1 mb-6">
            {formattedDate} {city.admin1 ? `| ${city.admin1}` : ''}
          </p>

          <div className="flex items-center gap-6 mb-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className={`p-4 rounded-3xl bg-gradient-to-br ${weatherStyle.gradient} text-white shadow-lg ${weatherStyle.glowColor} transition-all duration-1000`}
              id="current-weather-icon-wrapper"
            >
              <WeatherIcon name={weatherStyle.iconName} size={48} />
            </motion.div>
            
            <div className="flex flex-col">
              <span className="text-6xl font-bold font-sans tracking-tighter text-white flex">
                {Math.round(current.temperature)}
                <span className="text-4xl font-medium text-slate-500 relative -top-1">°C</span>
              </span>
              <span className="text-lg font-semibold text-slate-300 mt-0.5">
                {weatherStyle.description}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Grid Stats */}
        <div className="w-full md:w-auto md:min-w-[320px] lg:min-w-[380px] grid grid-cols-2 gap-4">
          
          {/* Feels Like Temp */}
          <div className="bg-[#0f172a]/40 hover:bg-[#0f172a]/70 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
              <Thermometer className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Feels Like</span>
              <span className="text-base font-bold text-slate-200">
                {Math.round(current.apparentTemperature)}°C
              </span>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-[#0f172a]/40 hover:bg-[#0f172a]/70 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Humidity</span>
              <span className="text-base font-bold text-slate-200">{current.humidity}%</span>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="bg-[#0f172a]/40 hover:bg-[#0f172a]/70 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
              <Wind className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Wind Speed</span>
              <span className="text-base font-bold text-slate-200">{current.windSpeed} km/h</span>
            </div>
          </div>

          {/* Precipitation */}
          <div className="bg-[#0f172a]/40 hover:bg-[#0f172a]/70 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Rainfall</span>
              <span className="text-base font-bold text-slate-200">{current.precipitation} mm</span>
            </div>
          </div>

          {/* Sunrise */}
          <div className="bg-[#0f172a]/40 hover:bg-[#0f172a]/70 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Sunrise className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sunrise</span>
              <span className="text-sm font-bold text-slate-200">
                {todayForecast ? new Date(todayForecast.sunrise).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }) : '--:--'}
              </span>
            </div>
          </div>

          {/* Sunset */}
          <div className="bg-[#0f172a]/40 hover:bg-[#0f172a]/70 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Sunset className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sunset</span>
              <span className="text-sm font-bold text-slate-200">
                {todayForecast ? new Date(todayForecast.sunset).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }) : '--:--'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
