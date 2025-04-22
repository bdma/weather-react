export interface WttrHourly {
  time: string;
  tempC: string;
  FeelsLikeC: string;
  humidity: string;
  windspeedKmph: string;
  winddirDegree: string;
  weatherIconUrl: string;
  lang_zh: Array<{
    value: string;
  }>;
}

export interface WttrDaily {
  date: string;
  mintempC: string;
  maxtempC: string;
  hourly: WttrHourly[];
}

export interface WttrArea {
  value: string;
}

export interface WttrResponse {
  current_condition: Array<{
    temp_C: string;
    FeelsLikeC: string;
    humidity: string;
    windspeedKmph: string;
    winddirDegree: string;
    weatherIconUrl: string;
    lang_zh: Array<{
      value: string;
    }>;
  }>;
  nearest_area: Array<{
    country: WttrArea[];
  }>;
  weather: WttrDaily[];
} 