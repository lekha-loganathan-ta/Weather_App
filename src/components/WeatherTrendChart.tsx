import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Clock, Calendar, Droplets, CloudRain } from 'lucide-react';
import { HourlyForecast, DailyForecast } from '../types';
import { getWeatherStyle } from '../utils/weatherUtils';

interface WeatherTrendChartProps {
  hourlyData: HourlyForecast[];
  dailyData: DailyForecast[];
}

export default function WeatherTrendChart({ hourlyData, dailyData }: WeatherTrendChartProps) {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver for responsive SVG dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width || 600);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Filter hourly to the next 24 hours
  const filteredHourly = hourlyData.slice(0, 24);

  // Layout parameters
  const height = 240;
  const padding = { top: 30, right: 20, bottom: 40, left: 40 };
  
  // Choose datasets based on active tab
  const isHourly = activeTab === 'hourly';
  const dataLength = isHourly ? filteredHourly.length : dailyData.length;
  
  // Calculate Min/Max for Y scaling
  let temps: number[] = [];
  if (isHourly) {
    temps = filteredHourly.map(d => d.temperature);
  } else {
    temps = [
      ...dailyData.map(d => d.tempMax),
      ...dailyData.map(d => d.tempMin)
    ];
  }
  
  const maxTemp = Math.max(...temps, 10) + 2; // pad top
  const minTemp = Math.min(...temps, 0) - 2; // pad bottom
  const tempRange = maxTemp - minTemp || 1;

  // X & Y scalers
  const getX = (index: number) => {
    const chartWidth = containerWidth - padding.left - padding.right;
    return padding.left + (index / (dataLength - 1)) * chartWidth;
  };

  const getY = (temp: number) => {
    const chartHeight = height - padding.top - padding.bottom;
    return padding.top + (1 - (temp - minTemp) / tempRange) * chartHeight;
  };

  // Generate SVG Path for Line and Area
  const buildPaths = () => {
    if (dataLength === 0) return { linePath: '', areaPath: '', minLinePath: '', minAreaPath: '' };

    if (isHourly) {
      let points = filteredHourly.map((d, idx) => ({ x: getX(idx), y: getY(d.temperature) }));
      
      // Straight lines with beautiful curve approximation
      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const areaPath = `
        ${linePath} 
        L ${points[points.length - 1].x} ${height - padding.bottom} 
        L ${points[0].x} ${height - padding.bottom} 
        Z
      `;
      return { linePath, areaPath };
    } else {
      // For daily, we'll draw TWO curves: one for Max temperature, one for Min temperature
      let maxPoints = dailyData.map((d, idx) => ({ x: getX(idx), y: getY(d.tempMax) }));
      let minPoints = dailyData.map((d, idx) => ({ x: getX(idx), y: getY(d.tempMin) }));

      const maxLinePath = maxPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const minLinePath = minPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

      // Shaded envelope area between max and min temps
      const envelopePath = `
        M ${maxPoints[0].x} ${maxPoints[0].y}
        ${maxPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
        L ${minPoints[minPoints.length - 1].x} ${minPoints[minPoints.length - 1].y}
        ${minPoints.slice().reverse().slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
        Z
      `;

      return { linePath: maxLinePath, areaPath: envelopePath, minLinePath };
    }
  };

  const paths = buildPaths();

  // Mouse interactivity on SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Convert mouseX to closest data index
    const chartWidth = containerWidth - padding.left - padding.right;
    const relativeX = mouseX - padding.left;
    
    let index = Math.round((relativeX / chartWidth) * (dataLength - 1));
    index = Math.max(0, Math.min(dataLength - 1, index));
    
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Extract selected hovered data
  const getHoveredData = () => {
    if (hoveredIndex === null) return null;
    if (isHourly) {
      const data = filteredHourly[hoveredIndex];
      const timeStr = new Date(data.time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const weatherStyle = getWeatherStyle(data.weatherCode, true);
      return {
        label: timeStr,
        temp: `${Math.round(data.temperature)}°C`,
        extra: [
          { name: 'Humidity', val: `${data.humidity}%`, icon: Droplets, color: 'text-sky-400' },
          { name: 'Rain Prob.', val: `${data.precipitationProbability}%`, icon: CloudRain, color: 'text-indigo-400' }
        ],
        desc: weatherStyle.description
      };
    } else {
      const data = dailyData[hoveredIndex];
      const dateStr = new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const weatherStyle = getWeatherStyle(data.weatherCode, true);
      return {
        label: dateStr,
        temp: `Max: ${Math.round(data.tempMax)}°C / Min: ${Math.round(data.tempMin)}°C`,
        extra: [
          { name: 'Rainfall', val: `${data.precipitationSum.toFixed(1)} mm`, icon: CloudRain, color: 'text-sky-400' },
          { name: 'Max Wind', val: `${Math.round(data.windSpeedMax)} km/h`, icon: TrendingUp, color: 'text-teal-400' }
        ],
        desc: weatherStyle.description
      };
    }
  };

  const hoveredData = getHoveredData();

  return (
    <div className="w-full bg-[#1e293b]/70 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md" id="weather-trends-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            Weather Trends Analytics
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Interactive chart showing temperature and humidity variations
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-900/60 border border-slate-800/80 p-1 rounded-xl self-stretch sm:self-auto">
          <button
            onClick={() => { setActiveTab('hourly'); setHoveredIndex(null); }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isHourly
                ? 'bg-[#0f172a] text-sky-400 shadow-md border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="trend-hourly-tab"
          >
            <Clock className="w-3.5 h-3.5" />
            24-Hour Hourly
          </button>
          <button
            onClick={() => { setActiveTab('daily'); setHoveredIndex(null); }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isHourly
                ? 'bg-[#0f172a] text-sky-400 shadow-md border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="trend-daily-tab"
          >
            <Calendar className="w-3.5 h-3.5" />
            7-Day Envelope
          </button>
        </div>
      </div>

      <div className="relative flex flex-col lg:flex-row gap-6 items-stretch">
        {/* SVG Chart Panel */}
        <div className="flex-1 min-h-[240px]" ref={containerRef}>
          <svg
            width={containerWidth}
            height={height}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="overflow-visible select-none cursor-crosshair"
            id="weather-trend-svg"
          >
            <defs>
              <linearGradient id="hourlyTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(56, 189, 248)" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="envelopeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="rgb(129, 140, 248)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const h = height - padding.top - padding.bottom;
              const y = padding.top + ratio * h;
              const val = maxTemp - ratio * tempRange;
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={containerWidth - padding.right}
                    y2={y}
                    stroke="rgba(51, 65, 85, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="end"
                  >
                    {Math.round(val)}°
                  </text>
                </g>
              );
            })}

            {/* X-Axis labels */}
            {dataLength > 0 && [0, Math.floor((dataLength-1)/3), Math.floor((dataLength-1)*2/3), dataLength-1].map((idx) => {
              const x = getX(idx);
              let label = '';
              if (isHourly) {
                label = new Date(filteredHourly[idx].time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
              } else {
                label = new Date(dailyData[idx].date).toLocaleDateString('en-US', { weekday: 'short' });
              }
              return (
                <text
                  key={idx}
                  x={x}
                  y={height - padding.bottom + 18}
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {label}
                </text>
              );
            })}

            {/* Shaded Area */}
            {paths.areaPath && (
              <path
                d={paths.areaPath}
                fill={isHourly ? "url(#hourlyTempGrad)" : "url(#envelopeGrad)"}
                className="transition-all duration-500"
              />
            )}

            {/* Lines */}
            {paths.linePath && (
              <path
                d={paths.linePath}
                fill="none"
                stroke="rgb(56, 189, 248)"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}

            {paths.minLinePath && (
              <path
                d={paths.minLinePath}
                fill="none"
                stroke="rgb(129, 140, 248)"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}

            {/* Hover Crosshair & Highlights */}
            {hoveredIndex !== null && (
              <g>
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={height - padding.bottom}
                  stroke="rgba(148, 163, 184, 0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {isHourly ? (
                  // Hourly single point highlight
                  <g>
                    <circle
                      cx={getX(hoveredIndex)}
                      cy={getY(filteredHourly[hoveredIndex].temperature)}
                      r="8"
                      fill="rgba(56, 189, 248, 0.2)"
                    />
                    <circle
                      cx={getX(hoveredIndex)}
                      cy={getY(filteredHourly[hoveredIndex].temperature)}
                      r="4"
                      fill="rgb(56, 189, 248)"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  </g>
                ) : (
                  // Daily double point highlights (Min and Max)
                  <g>
                    <circle
                      cx={getX(hoveredIndex)}
                      cy={getY(dailyData[hoveredIndex].tempMax)}
                      r="7"
                      fill="rgba(56, 189, 248, 0.2)"
                    />
                    <circle
                      cx={getX(hoveredIndex)}
                      cy={getY(dailyData[hoveredIndex].tempMax)}
                      r="3.5"
                      fill="rgb(56, 189, 248)"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={getX(hoveredIndex)}
                      cy={getY(dailyData[hoveredIndex].tempMin)}
                      r="7"
                      fill="rgba(129, 140, 248, 0.2)"
                    />
                    <circle
                      cx={getX(hoveredIndex)}
                      cy={getY(dailyData[hoveredIndex].tempMin)}
                      r="3.5"
                      fill="rgb(129, 140, 248)"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  </g>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Floating details / Tooltip card on the side */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {hoveredData ? (
              <motion.div
                key={`tooltip-${hoveredIndex}-${activeTab}`}
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-[#0f172a]/95 border border-slate-850 p-5 rounded-2xl flex flex-col gap-3.5 h-full min-h-[160px] justify-between backdrop-blur-md shadow-2xl"
              >
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Selected Point
                  </div>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    {hoveredData.label}
                  </div>
                  <div className="text-2xl font-black text-sky-400 mt-1">
                    {hoveredData.temp}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-1">
                    Condition: {hoveredData.desc}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
                  {hoveredData.extra.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{item.name}</span>
                          <span className="text-xs font-bold text-slate-200">{item.val}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#0f172a]/45 border border-dashed border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[160px]">
                <TrendingUp className="w-8 h-8 text-slate-700 animate-pulse mb-2" />
                <span className="text-xs font-bold text-slate-500 max-w-[180px]">
                  Hover or slide across the chart to inspect weather metrics
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
