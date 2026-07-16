import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Shirt, Briefcase, Activity, AlertTriangle, Filter, Sparkles } from 'lucide-react';
import { WeatherData, Recommendation } from '../types';
import { generateRecommendations } from '../utils/weatherUtils';
import WeatherIcon from './WeatherIcon';

interface RecommendationsProps {
  data: WeatherData;
}

type FilterCategory = 'all' | 'travel' | 'clothing' | 'activity' | 'caution';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120 } }
};

export default function Recommendations({ data }: RecommendationsProps) {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const recommendations = generateRecommendations(data.current, data.daily);

  const filteredRecs = filter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === filter);

  // Map category to styles and icon
  const getCategoryStyles = (category: string, urgency: string) => {
    switch (category) {
      case 'caution':
        return {
          bg: 'bg-red-500/5 border-red-500/20',
          accent: 'bg-red-500/10 text-red-400 border border-red-500/30',
          text: 'text-red-200',
          descText: 'text-red-300/80',
          badge: 'bg-red-950/40 text-red-400 border border-red-900/40',
          label: 'Caution'
        };
      case 'clothing':
        return {
          bg: 'bg-sky-500/5 border-sky-500/20',
          accent: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
          text: 'text-sky-200',
          descText: 'text-sky-300/80',
          badge: 'bg-sky-950/40 text-sky-400 border border-sky-900/40',
          label: 'Clothing'
        };
      case 'travel':
        return {
          bg: 'bg-emerald-500/5 border-emerald-500/20',
          accent: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
          text: 'text-emerald-200',
          descText: 'text-emerald-300/80',
          badge: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40',
          label: 'Travel'
        };
      case 'activity':
        return {
          bg: 'bg-amber-500/5 border-amber-500/20',
          accent: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
          text: 'text-amber-200',
          descText: 'text-amber-300/80',
          badge: 'bg-amber-950/40 text-amber-400 border border-amber-900/40',
          label: 'Activity'
        };
      default:
        return {
          bg: 'bg-[#1e293b]/50 border-slate-800',
          accent: 'bg-slate-800 text-slate-300 border border-slate-700/50',
          text: 'text-slate-100',
          descText: 'text-slate-400',
          badge: 'bg-slate-900/50 text-slate-400 border border-slate-800',
          label: 'General'
        };
    }
  };

  return (
    <div className="w-full flex flex-col gap-5" id="recommendations-container">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400 fill-sky-950/40" />
            Smart Weather Intelligence Recommendations
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            AI-modeled suggestions for travel, outfit pairing, outdoor events, and conditions planning
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex bg-slate-900/60 border border-slate-800/80 p-1 rounded-xl self-stretch sm:self-auto flex-wrap items-center">
          {[
            { id: 'all', label: 'All', icon: Sparkles },
            { id: 'travel', label: 'Travel', icon: Briefcase },
            { id: 'clothing', label: 'Outfits', icon: Shirt },
            { id: 'activity', label: 'Activities', icon: Activity },
            { id: 'caution', label: 'Alerts', icon: AlertTriangle }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = filter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as FilterCategory)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-[#0f172a] border-slate-800 text-sky-400 shadow-md'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of cards */}
      <AnimatePresence mode="wait">
        {filteredRecs.length > 0 ? (
          <motion.div
            key={filter}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            id="recs-grid"
          >
            {filteredRecs.map((rec) => {
              const styles = getCategoryStyles(rec.category, rec.urgency);
              return (
                <motion.div
                  key={rec.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className={`border rounded-2xl p-5 flex gap-4 ${styles.bg} transition-all duration-200 hover:shadow-lg`}
                >
                  {/* Styled Icon Wrapper */}
                  <div className={`p-3 rounded-2xl h-12 w-12 flex items-center justify-center shrink-0 ${styles.accent} shadow-sm`}>
                    <WeatherIcon name={rec.iconName} size={22} />
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${styles.badge}`}>
                        {styles.label}
                      </span>
                      {rec.urgency === 'high' && (
                        <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/40 animate-pulse">
                          Important Alert
                        </span>
                      )}
                    </div>

                    <h4 className={`text-base font-bold ${styles.text}`}>
                      {rec.title}
                    </h4>
                    
                    <p className={`text-sm leading-relaxed font-medium ${styles.descText}`}>
                      {rec.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-[#1e293b]/30 flex flex-col items-center justify-center"
            id="empty-recs-state"
          >
            <AlertTriangle className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-sm font-bold text-slate-500">
              No recommendations found for this specific filter.
            </p>
            <button
              onClick={() => setFilter('all')}
              className="text-xs text-sky-400 font-bold underline mt-1 cursor-pointer"
            >
              Show all recommendations
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
