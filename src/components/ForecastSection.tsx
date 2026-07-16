import React from 'react';
import { motion } from 'motion/react';
import { CloudRain, Compass } from 'lucide-react';
import { DailyForecast } from '../types';
import { getWeatherStyle, formatDayName, formatDateString } from '../utils/weatherUtils';
import WeatherIcon from './WeatherIcon';

interface ForecastSectionProps {
  forecasts: DailyForecast[];
}

const parentVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

export default function ForecastSection({ forecasts }: ForecastSectionProps) {
  return (
    <div className="w-full flex flex-col gap-4" id="forecast-section-container">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-sky-400" />
          7-Day Detailed Forecast
        </h3>
        <span className="text-xs text-slate-500 font-semibold tracking-wide">
          Swipe/scroll horizontally if needed
        </span>
      </div>

      <motion.div
        variants={parentVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto pb-2 snap-x"
        id="forecast-grid"
      >
        {forecasts.map((day, idx) => {
          const isToday = idx === 0;
          const weatherStyle = getWeatherStyle(day.weatherCode, true); // Always assume day icon for forecast cards
          const dayName = formatDayName(day.date);
          const dateStr = formatDateString(day.date);

          return (
            <motion.div
              key={day.date}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`snap-start flex flex-col items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                isToday
                  ? 'bg-gradient-to-b from-sky-500/15 to-transparent border-sky-500/30 shadow-lg shadow-sky-500/5'
                  : 'bg-[#1e293b]/50 hover:bg-[#1e293b]/80 border-slate-800 shadow-xl'
              }`}
            >
              {/* Day & Date Headers */}
              <div className="text-center">
                <span className={`text-sm font-bold block ${isToday ? 'text-sky-400' : 'text-slate-200'}`}>
                  {dayName}
                </span>
                <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                  {dateStr}
                </span>
              </div>

              {/* Weather Icon & Description */}
              <div className="my-5 flex flex-col items-center gap-2">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${
                  isToday ? weatherStyle.gradient : 'from-slate-800 to-slate-900'
                } ${isToday ? 'text-white' : 'text-slate-300'} ${
                  !isToday && 'border border-slate-700/30'
                } shadow-sm`}>
                  <WeatherIcon name={weatherStyle.iconName} size={28} />
                </div>
                <span className="text-xs font-semibold text-slate-400 text-center max-w-[85px] truncate">
                  {weatherStyle.description}
                </span>
              </div>

              {/* High & Low Temp */}
              <div className="w-full flex items-center justify-center gap-2 border-t border-slate-800/60 pt-3.5">
                <span className="text-sm font-extrabold text-slate-200">
                  {Math.round(day.tempMax)}°
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {Math.round(day.tempMin)}°
                </span>
              </div>

              {/* Rain Risk Indicator */}
              {day.precipitationSum > 0 ? (
                <div className="flex items-center gap-1 mt-2 text-sky-400/95" title={`Precipitation: ${day.precipitationSum}mm`}>
                  <CloudRain className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">{day.precipitationSum.toFixed(1)}mm</span>
                </div>
              ) : (
                <div className="h-4 mt-2" /> /* Invisible spacer */
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
