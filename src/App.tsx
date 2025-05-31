import { useState, useEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import { motion, AnimatePresence } from 'framer-motion';
import { WiDaySunny, WiRain, WiCloudy, WiDayHaze } from 'react-icons/wi';
import { getWeatherData } from './services/weatherApi';
import type { WeatherData } from './types/weather';

function App() {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setLoading(true);
            const data = await getWeatherData(`${position.coords.latitude},${position.coords.longitude}`);
            setWeather(data);
            setCity(data.location.name);
          } catch (err) {
            setError('Failed to fetch weather data for your location');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError('Unable to get your location');
          setLoading(false);
        }
      );
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <WiDaySunny className="text-6xl text-[#8B7355]" />;
      case 'rain': return <WiRain className="text-6xl text-[#8B7355]" />;
      case 'cloudy': return <WiCloudy className="text-6xl text-[#8B7355]" />;
      default: return <WiDayHaze className="text-6xl text-[#8B7355]" />;
    }
  };

  const fetchWeather = async () => {
    if (!city) return;
    try {
      setLoading(true);
      setError('');
      const data = await getWeatherData(city);
      setWeather(data);
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  const getSuggestions = async (value: string) => {
    // In a real app, this would call an API endpoint for city suggestions
    const mockSuggestions = [
      'London', 'New York', 'Tokyo', 'Paris', 'Berlin'
    ].filter(city => city.toLowerCase().includes(value.toLowerCase()));
    setSuggestions(mockSuggestions);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5EEE6] via-[#E8DCC4] to-[#F5EEE6]">
        <div className="pixel-loading">
          <div className="pixel"></div>
          <div className="pixel"></div>
          <div className="pixel"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-[#F5EEE6] via-[#E8DCC4] to-[#F5EEE6]">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pixel-container"
        >
          <form onSubmit={handleSubmit} className="search-container">
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={({ value }) => getSuggestions(value)}
              onSuggestionsClearRequested={() => setSuggestions([])}
              getSuggestionValue={suggestion => suggestion}
              renderSuggestion={suggestion => (
                <div className="suggestion-item">
                  {suggestion}
                </div>
              )}
              inputProps={{
                placeholder: 'Enter city name',
                value: city,
                onChange: (_, { newValue }) => setCity(newValue),
                className: "search-input"
              }}
            />
            <button type="submit" className="search-button">
              Search
            </button>
            <button 
              type="button" 
              onClick={getCurrentLocation} 
              className="location-button"
            >
              📍
            </button>
          </form>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="error-container"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {weather && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="weather-container"
          >
            <div className="current-weather">
              <h1 className="city-name">{weather.location.name}, {weather.location.country}</h1>
              <div className="temp-display">
                <span className="current-temp">{weather.current.temp_c}°C</span>
                {getWeatherIcon(weather.current.condition.text)}
              </div>
              <p className="condition-text">{weather.current.condition.text}</p>
              <div className="weather-details">
                <div className="detail-item">
                  <span>Humidity</span>
                  <span>{weather.current.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span>Wind</span>
                  <span>{weather.current.wind_kph} km/h</span>
                </div>
              </div>
            </div>

            <div className="forecast-container">
              {weather.forecast.forecastday.map((day, index) => (
                <motion.div 
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="forecast-card"
                >
                  <p className="date">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  {getWeatherIcon(day.day.condition.text)}
                  <div className="temp-range">
                    <span className="max-temp">{day.day.maxtemp_c}°C</span>
                    <span className="min-temp">{day.day.mintemp_c}°C</span>
                  </div>
                  <p className="forecast-condition">{day.day.condition.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;