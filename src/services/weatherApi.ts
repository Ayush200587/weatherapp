import axios from 'axios';
import type { WeatherData } from '../types/weather';

const API_KEY = 'bf43d111e6da4a69a8d93920253005';
const BASE_URL = 'https://api.weatherapi.com/v1';

export const getWeatherData = async (city: string): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast.json`, {
      params: {
        key: API_KEY,
        q: city,
        days: 3,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
};