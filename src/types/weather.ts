export interface WeatherData {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
}

export interface WeatherResponse {
  list: WeatherData[];
  city: {
    name: string;
    country: string;
  };
} 