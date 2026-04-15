export type WeatherState = 'idle' | 'rain' | 'heavyRain' | 'wind' | 'cold' | 'snow' | 'sunny';

export interface WeatherData {
  precip_mm_hr: number;
  windspeed: number;
  airtemp: number;
  snow_mm: number;
  solrad: number;
  RH: number;
  pressure: number;
  streamflow_cfs: number;
  soil_mm: number;
  date: string;
}

export function getWeatherState(data: WeatherData | null): WeatherState {
  if (!data) return 'idle';
  const { precip_mm_hr, windspeed, airtemp, snow_mm, solrad } = data;
  if (precip_mm_hr > 2) return 'heavyRain';
  if (precip_mm_hr > 0.3) return 'rain';
  if (windspeed > 2.5) return 'wind';
  // snow: below freezing with active precip or measured snowpack
  if (airtemp < -1 && (precip_mm_hr > 0.05 || snow_mm > 0)) return 'snow';
  // cold: below freezing but dry
  if (airtemp < -1) return 'cold';
  if (solrad > 250) return 'sunny';
  return 'idle';
}
