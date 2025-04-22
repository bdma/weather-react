import React from 'react';
import WeatherForecast from './components/WeatherForecast';
import './styles/App.scss';

const App: React.FC = () => {
  return (
    <div className="app">
      <WeatherForecast />
    </div>
  );
};

export default App;
