import React, { useState, useEffect } from 'react';
import { getWeatherForecast } from '../services/weatherService';
import { WeatherData } from '../types/weather';
import '../styles/WeatherForecast.scss';

const MAJOR_CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆',
  '武汉', '西安', '天津', '苏州', '郑州', '长沙', '青岛', '厦门'
];

// 骨骼卡片组件
const SkeletonCard: React.FC = () => {
  return (
    <div className="weather-forecast__weather-card weather-forecast__weather-card--skeleton">
      <h3></h3>
      <div className="weather-forecast__weather-info"></div>
      <div className="weather-forecast__description"></div>
      <div className="weather-forecast__details"></div>
    </div>
  );
};

const WeatherForecast: React.FC = () => {
  const [city, setCity] = useState('上海');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (cityName: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWeatherForecast(cityName);

      // 从响应中提取每天的数据（每天有多个数据点，我们只需要一个）
      const dailyData: WeatherData[] = [];
      const processedDates = new Set<string>();

      response.list.forEach((item: WeatherData) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!processedDates.has(date) && dailyData.length < 8) {
          processedDates.add(date);
          dailyData.push(item);
        }
      });

      if (dailyData.length === 0) {
        throw new Error('未找到天气数据');
      }

      setWeatherData(dailyData);
    } catch (err) {
      console.error('Error in fetchWeatherData:', err);
      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          setError('API 密钥未设置，请在 .env 文件中设置 REACT_APP_WEATHER_API_KEY');
        } else if (err.message.includes('404')) {
          setError(`未找到城市 "${cityName}" 的天气数据`);
        } else {
          setError(`获取天气数据失败: ${err.message}`);
        }
      } else {
        setError('获取天气数据失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData(city);
  };

  const handleCityClick = (cityName: string) => {
    setCity(cityName);
    fetchWeatherData(cityName);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getWeatherType = (description: string): string => {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('sun') || lowerDesc.includes('clear') || lowerDesc.includes('晴')) {
      return 'sunny';
    } else if (lowerDesc.includes('cloud') || lowerDesc.includes('多云') || lowerDesc.includes('阴')) {
      return 'cloudy';
    } else if (lowerDesc.includes('rain') || lowerDesc.includes('drizzle') || lowerDesc.includes('雨')) {
      return 'rainy';
    } else if (lowerDesc.includes('snow') || lowerDesc.includes('雪')) {
      return 'snowy';
    } else if (lowerDesc.includes('thunder') || lowerDesc.includes('storm') || lowerDesc.includes('雷') || lowerDesc.includes('暴')) {
      return 'stormy';
    } else if (lowerDesc.includes('fog') || lowerDesc.includes('mist') || lowerDesc.includes('haze') || lowerDesc.includes('雾')) {
      return 'foggy';
    }

    return 'sunny';
  };

  // 渲染骨骼卡片
  const renderSkeletonCards = () => {
    return Array(8).fill(0).map((_, index) => (
      <SkeletonCard key={`skeleton-${index}`} />
    ));
  };

  return (
    <div className="weather-forecast__container">
      <div className="weather-forecast__header">
        <h1>天气预报</h1>
      </div>

      <div className="weather-forecast__search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="输入城市名称"
          />
          <button type="submit">搜索</button>
        </form>
      </div>

      <div className="weather-forecast__city-list">
        {MAJOR_CITIES.map((cityName) => (
          <button
            key={cityName}
            className={`weather-forecast__city-button ${city === cityName ? 'weather-forecast__city-button--active' : ''}`}
            onClick={() => handleCityClick(cityName)}
          >
            {cityName}
          </button>
        ))}
      </div>

      {error && (
        <div className="weather-forecast__error">
          <p>{error}</p>
          {error.includes('API 密钥') && (
            <p>
              请访问 <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer">OpenWeather</a> 注册并获取 API 密钥，
              然后在项目根目录的 .env 文件中设置 REACT_APP_WEATHER_API_KEY=你的密钥
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="weather-forecast__weather-grid">
          {renderSkeletonCards()}
        </div>
      ) : (
        <div className="weather-forecast__weather-grid">
          {weatherData.map((data) => (
            <div
              key={data.dt}
              className={`weather-forecast__weather-card weather-forecast__weather-card--${getWeatherType(data.weather[0].description)}`}
            >
              <h3>{formatDate(data.dt)}</h3>
              <div className="weather-forecast__weather-info">
                <img
                  src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                  alt={data.weather[0].description}
                  className="weather-forecast__weather-icon"
                />
                <div className="weather-forecast__temperature">{Math.round(data.main.temp)}°C</div>
              </div>
              <div className="weather-forecast__description">
                <span>{data.weather[0].description}</span>
              </div>
              <div className="weather-forecast__details">
                <div>
                  <div className="label">体感温度</div>
                  <div className="value">{Math.round(data.main.feels_like)}°C</div>
                </div>
                <div>
                  <div className="label">湿度</div>
                  <div className="value">{data.main.humidity}%</div>
                </div>
                <div>
                  <div className="label">风速</div>
                  <div className="value">{data.wind.speed} m/s</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherForecast; 