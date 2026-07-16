import { CurrentWeather, DailyForecast, Recommendation } from '../types';

export interface WeatherStyle {
  description: string;
  iconName: string;
  gradient: string; // Tailwind background gradient for visual theme
  cardBg: string;   // Glassmorphism card bg
  glowColor: string; // Accent glow
}

export function getWeatherStyle(code: number, isDay: boolean = true): WeatherStyle {
  // Clear sky
  if (code === 0) {
    return {
      description: 'Clear Sky',
      iconName: isDay ? 'Sun' : 'Moon',
      gradient: isDay 
        ? 'from-amber-400 via-orange-400 to-sky-500' 
        : 'from-slate-900 via-indigo-950 to-slate-950',
      cardBg: isDay ? 'bg-white/80' : 'bg-slate-900/70',
      glowColor: isDay ? 'shadow-amber-500/20' : 'shadow-indigo-500/20',
    };
  }
  
  // Mainly clear, partly cloudy, overcast
  if (code >= 1 && code <= 3) {
    const descriptions = ['Mainly Clear', 'Partly Cloudy', 'Overcast'];
    const desc = descriptions[code - 1];
    return {
      description: desc,
      iconName: code === 3 ? 'Cloud' : (isDay ? 'CloudSun' : 'CloudMoon'),
      gradient: isDay
        ? 'from-sky-400 via-blue-400 to-slate-400'
        : 'from-slate-800 via-slate-900 to-slate-950',
      cardBg: isDay ? 'bg-white/80' : 'bg-slate-900/70',
      glowColor: isDay ? 'shadow-blue-500/10' : 'shadow-slate-500/10',
    };
  }
  
  // Fog and depositing rime fog
  if (code === 45 || code === 48) {
    return {
      description: code === 45 ? 'Fog' : 'Rime Fog',
      iconName: 'CloudFog',
      gradient: 'from-slate-400 via-zinc-400 to-slate-500',
      cardBg: 'bg-white/70',
      glowColor: 'shadow-slate-400/10',
    };
  }
  
  // Drizzle
  if (code === 51 || code === 53 || code === 55) {
    return {
      description: 'Drizzle',
      iconName: 'CloudDrizzle',
      gradient: 'from-blue-400 via-sky-500 to-slate-500',
      cardBg: 'bg-white/80',
      glowColor: 'shadow-sky-400/10',
    };
  }
  
  // Freezing drizzle
  if (code === 56 || code === 57) {
    return {
      description: 'Freezing Drizzle',
      iconName: 'CloudSnow',
      gradient: 'from-teal-300 via-cyan-400 to-slate-500',
      cardBg: 'bg-white/80',
      glowColor: 'shadow-teal-400/15',
    };
  }
  
  // Rain
  if (code === 61 || code === 63 || code === 65 || code === 80 || code === 81 || code === 82) {
    const desc = code >= 80 ? 'Rain Showers' : 'Rain';
    return {
      description: desc,
      iconName: 'CloudRain',
      gradient: 'from-blue-500 via-indigo-600 to-slate-700',
      cardBg: 'bg-slate-900/30 backdrop-blur-md',
      glowColor: 'shadow-blue-600/20',
    };
  }
  
  // Freezing rain
  if (code === 66 || code === 67) {
    return {
      description: 'Freezing Rain',
      iconName: 'CloudSnow',
      gradient: 'from-blue-400 via-teal-500 to-slate-600',
      cardBg: 'bg-white/80',
      glowColor: 'shadow-blue-400/15',
    };
  }
  
  // Snow fall / grains / showers
  if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) {
    let desc = 'Snowfall';
    if (code === 77) desc = 'Snow Grains';
    if (code >= 85) desc = 'Snow Showers';
    return {
      description: desc,
      iconName: 'CloudSnow',
      gradient: 'from-indigo-100 via-sky-200 to-slate-300',
      cardBg: 'bg-white/90',
      glowColor: 'shadow-cyan-400/20',
    };
  }
  
  // Thunderstorm
  if (code === 95 || code === 96 || code === 99) {
    return {
      description: code === 95 ? 'Thunderstorm' : 'Thunderstorm with Hail',
      iconName: 'CloudLightning',
      gradient: 'from-violet-800 via-slate-950 to-indigo-950',
      cardBg: 'bg-slate-950/60 backdrop-blur-md border-violet-900/30',
      glowColor: 'shadow-violet-600/30',
    };
  }

  // Default
  return {
    description: 'Unknown Weather',
    iconName: 'Cloud',
    gradient: 'from-slate-400 via-slate-500 to-slate-600',
    cardBg: 'bg-white/80',
    glowColor: 'shadow-slate-500/10',
  };
}

export function generateRecommendations(
  current: CurrentWeather,
  daily: DailyForecast[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const today = daily[0];

  // 1. Clothing recommendations based on temperature
  const temp = current.temperature;
  if (temp < 0) {
    recommendations.push({
      id: 'clothing_extreme_cold',
      category: 'clothing',
      title: 'Freezing Cold Outerwear',
      description: 'Heavy insulated coat, thermal layers, thermal socks, scarf, gloves, and a beanie are absolutely essential.',
      iconName: 'Shirt',
      urgency: 'high',
    });
  } else if (temp >= 0 && temp < 10) {
    recommendations.push({
      id: 'clothing_cold',
      category: 'clothing',
      title: 'Warm Winter Layers',
      description: 'A warm winter coat or thick puffer jacket over sweaters. Don\'t forget a scarf for chilly drafts.',
      iconName: 'Shirt',
      urgency: 'medium',
    });
  } else if (temp >= 10 && temp < 18) {
    recommendations.push({
      id: 'clothing_cool',
      category: 'clothing',
      title: 'Light Outerwear Needed',
      description: 'Comfortable layers are best. A light jacket, trench coat, sweater, or denim jacket over a tee will keep you comfortable.',
      iconName: 'Shirt',
      urgency: 'low',
    });
  } else if (temp >= 18 && temp < 27) {
    recommendations.push({
      id: 'clothing_comfortable',
      category: 'clothing',
      title: 'Comfortable Warm Weather Wear',
      description: 'Lightweight fabrics like linen or cotton, t-shirts, and shorts/skirts. Perfect weather for light clothing.',
      iconName: 'Shirt',
      urgency: 'low',
    });
  } else {
    recommendations.push({
      id: 'clothing_hot',
      category: 'clothing',
      title: 'Breathable and Sun-Safe',
      description: 'Extremely lightweight, breathable garments. Wear light colors, a wide-brimmed sun hat, and high UV sunglasses.',
      iconName: 'Shirt',
      urgency: 'high',
    });
  }

  // 2. Travel & Activity recommendations based on weather codes & temperature
  const weatherCode = current.weatherCode;
  
  // Rainy or severe conditions
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  const isStormy = [95, 96, 99].includes(weatherCode);
  const isSnowy = [71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(weatherCode);
  const isFoggy = [45, 48].includes(weatherCode);

  if (isStormy) {
    recommendations.push({
      id: 'travel_storm',
      category: 'caution',
      title: 'Severe Storm Alert',
      description: 'Stay indoors. Avoid non-essential road travel. Secure outdoor objects and prepare for possible power outages or flight delays.',
      iconName: 'AlertTriangle',
      urgency: 'high',
    });
    recommendations.push({
      id: 'activity_storm',
      category: 'activity',
      title: 'Opt for Cozy Indoor Activities',
      description: 'Perfect time for a museum visit, reading, board games, or visiting local cafes rather than outdoor sightseeing.',
      iconName: 'Activity',
      urgency: 'medium',
    });
  } else if (isRainy) {
    recommendations.push({
      id: 'travel_rain',
      category: 'travel',
      title: 'Carry a Sturdy Umbrella',
      description: 'Expect wet roads and slower traffic. Keep a compact umbrella or rain poncho handy when walking around.',
      iconName: 'Briefcase',
      urgency: 'medium',
    });
    recommendations.push({
      id: 'activity_rain',
      category: 'activity',
      title: 'Indoor Planning Recommended',
      description: 'Focus your day around covered malls, art galleries, spa sessions, or standard indoor local attractions.',
      iconName: 'Activity',
      urgency: 'low',
    });
  } else if (isSnowy) {
    recommendations.push({
      id: 'travel_snow',
      category: 'caution',
      title: 'Winter Travel Conditions',
      description: 'Slippery roads and walks. Public transport may have delays. Wear insulated, high-traction boots to prevent slipping.',
      iconName: 'AlertTriangle',
      urgency: 'high',
    });
    recommendations.push({
      id: 'activity_snow',
      category: 'activity',
      title: 'Winter Wonders & Snow Fun',
      description: 'Perfect for building a snowman, sledding, or photography. Warm up with a hot chocolate nearby afterwards.',
      iconName: 'Activity',
      urgency: 'low',
    });
  } else if (isFoggy) {
    recommendations.push({
      id: 'travel_fog',
      category: 'caution',
      title: 'Low Road Visibility',
      description: 'Extremely reduced visibility. If driving, keep fog lights on, maintain safe distances, and expect potential flight delays.',
      iconName: 'AlertTriangle',
      urgency: 'medium',
    });
  } else {
    // Clear / Partly Cloudy - Nice weather
    recommendations.push({
      id: 'travel_nice',
      category: 'travel',
      title: 'Perfect Sightseeing Weather',
      description: 'Conditions are excellent for walking tours, outdoor architectural photography, and exploring open-air markets.',
      iconName: 'Compass',
      urgency: 'low',
    });
    
    if (temp >= 15 && temp <= 28) {
      recommendations.push({
        id: 'activity_outdoor',
        category: 'activity',
        title: 'Ideal for Outdoor Pursuits',
        description: 'Excellent day for hiking, bicycling, packing a picnic for the local park, or taking scenic walking paths.',
        iconName: 'Activity',
        urgency: 'low',
      });
    }
  }

  // 3. Environmental Alerts (UV index, wind speed)
  if (today && today.uvIndexMax > 6) {
    recommendations.push({
      id: 'caution_uv',
      category: 'caution',
      title: 'High UV Index Warning',
      description: `Peak UV Index will hit a high of ${today.uvIndexMax}. Seek shade during midday, apply SPF 30+ sunscreen, and wear a hat.`,
      iconName: 'Shield',
      urgency: 'medium',
    });
  }

  if (current.windSpeed > 24) {
    recommendations.push({
      id: 'caution_wind',
      category: 'caution',
      title: 'Strong Windy Conditions',
      description: `Winds of ${current.windSpeed} km/h are blowing. Secure lightweight items, wear windbreakers, and expect breezy coastal spots.`,
      iconName: 'AlertTriangle',
      urgency: 'medium',
    });
  }

  // 4. Custom Travel General Tip based on precipitation
  const futureRain = daily.slice(1, 4).some(day => day.precipitationSum > 5);
  if (futureRain) {
    recommendations.push({
      id: 'travel_forecast_alert',
      category: 'travel',
      title: 'Upcoming Rain in Forecast',
      description: 'Our 3-day lookout suggests rainfall is approaching. Arrange your outdoor trips for today while it is drier.',
      iconName: 'Briefcase',
      urgency: 'low',
    });
  }

  return recommendations;
}

export function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDateString(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
