'use client';

import { useState, useEffect } from 'react';
import type { WeatherData } from '@/lib/weatherState';

const BACKEND_URL = 'http://localhost:8000';

export function useWeatherData(): WeatherData | null {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/weather`);
        if (!res.ok) return;
        const json = await res.json();
        setData({
          precip_mm_hr: json.precip_mm_hr ?? 0,
          windspeed: json.windspeed ?? 0,
          airtemp: json.airtemp ?? 0,
          snow_mm: json.snow_mm ?? 0,
          solrad: json.solrad ?? 0,
          RH: json.RH ?? 0,
          pressure: json.pressure ?? 0,
          streamflow_cfs: json.streamflow_cfs ?? 0,
          soil_mm: json.soil_mm ?? 0,
          date: json.date ?? '',
        });
      } catch {
        // network unavailable — keep last value
      }
    }

    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return data;
}
