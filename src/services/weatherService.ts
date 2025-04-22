import axios from 'axios';
import { WeatherResponse } from '../types/weather';

const BASE_URL = 'https://api.open-meteo.com/v1';

export const getWeatherForecast = async (city: string): Promise<WeatherResponse> => {
  try {
    // 先获取城市坐标
    const geoResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: city,
        count: 1,
        language: 'zh',
        format: 'json'
      }
    });

    if (!geoResponse.data.results?.[0]) {
      throw new Error('未找到该城市');
    }

    const { latitude, longitude, name, country } = geoResponse.data.results[0];

    // 获取天气数据
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        latitude,
        longitude,
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'apparent_temperature_max',
          'relative_humidity_2m_max',
          'wind_speed_10m_max',
          'wind_direction_10m_dominant',
          'weather_code'
        ],
        timezone: 'auto',
        forecast_days: 8 // 修改为8天
      }
    });

    // 转换数据格式以匹配我们的接口
    const weatherData: WeatherResponse = {
      list: response.data.daily.time.map((date: string, index: number) => ({
        dt: new Date(date).getTime() / 1000,
        main: {
          temp: response.data.daily.temperature_2m_max[index],
          feels_like: response.data.daily.apparent_temperature_max[index],
          temp_min: response.data.daily.temperature_2m_min[index],
          temp_max: response.data.daily.temperature_2m_max[index],
          humidity: response.data.daily.relative_humidity_2m_max[index]
        },
        weather: [{
          id: response.data.daily.weather_code[index],
          main: getWeatherDescription(response.data.daily.weather_code[index]),
          description: getWeatherDescription(response.data.daily.weather_code[index]),
          icon: getWeatherIcon(response.data.daily.weather_code[index])
        }],
        wind: {
          speed: response.data.daily.wind_speed_10m_max[index],
          deg: response.data.daily.wind_direction_10m_dominant[index]
        }
      })),
      city: {
        name,
        country
      }
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// 天气代码转换为描述
function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: '晴朗',
    1: '多云',
    2: '阴天',
    3: '阴天',
    45: '雾',
    48: '霾',
    51: '小雨',
    53: '中雨',
    55: '大雨',
    56: '小雨',
    57: '大雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '小雨',
    67: '大雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '小雪',
    80: '小雨',
    81: '中雨',
    82: '大雨',
    85: '小雪',
    86: '大雪',
    95: '雷雨',
    96: '雷阵雨',
    99: '雷阵雨'
  };
  return weatherCodes[code] || '未知';
}

// 天气代码转换为图标
function getWeatherIcon(code: number): string {
  const iconCodes: { [key: number]: string } = {
    0: '01d',
    1: '02d',
    2: '03d',
    3: '04d',
    45: '50d',
    48: '50d',
    51: '09d',
    53: '09d',
    55: '09d',
    56: '09d',
    57: '09d',
    61: '10d',
    63: '10d',
    65: '10d',
    66: '10d',
    67: '10d',
    71: '13d',
    73: '13d',
    75: '13d',
    77: '13d',
    80: '09d',
    81: '09d',
    82: '09d',
    85: '13d',
    86: '13d',
    95: '11d',
    96: '11d',
    99: '11d'
  };
  return iconCodes[code] || '01d';
} 