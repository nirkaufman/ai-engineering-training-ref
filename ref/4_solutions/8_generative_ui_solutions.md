# Generative UI Implementation Solutions

This document provides solutions for the Generative UI Implementation exercises, demonstrating best practices and implementation patterns for building streaming UI components with AI integration.

## Exercise 1: Basic Component Setup

```typescript
import React from 'react';
import './styles.css';

// Loading component with animation
const LoadingComponent = () => (
  <div className="animate-pulse p-4 rounded-lg bg-gray-100">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// TypeScript interfaces
interface WeatherProps {
  location: string;
  temperature: string;
  condition: string;
  humidity?: string;
  windSpeed?: string;
}

// Weather display component
const WeatherDisplay: React.FC<WeatherProps> = ({
  location,
  temperature,
  condition,
  humidity,
  windSpeed
}) => (
  <div className="weather-card p-4 rounded-lg shadow-lg bg-white">
    <h2 className="text-xl font-bold mb-2">{location}</h2>
    <div className="temperature text-3xl font-bold mb-2">
      {temperature}
    </div>
    <div className="condition text-lg mb-2">{condition}</div>
    {humidity && (
      <div className="humidity text-sm text-gray-600">
        Humidity: {humidity}
      </div>
    )}
    {windSpeed && (
      <div className="wind-speed text-sm text-gray-600">
        Wind: {windSpeed}
      </div>
    )}
  </div>
);

// Error component
const ErrorComponent: React.FC<{ message: string }> = ({ message }) => (
  <div className="error-card p-4 rounded-lg bg-red-50 border border-red-200">
    <p className="text-red-600">{message}</p>
  </div>
);
```

**Key Features**:
- TypeScript interfaces
- Proper component structure
- Responsive styling
- Error handling component

## Exercise 2: Weather Service Implementation

```typescript
import { z } from 'zod';

// Type definitions
interface WeatherData {
  temperature: string;
  condition: string;
  humidity?: string;
  windSpeed?: string;
}

// Validation schema
const WeatherResponseSchema = z.object({
  temperature: z.string(),
  condition: z.string(),
  humidity: z.string().optional(),
  windSpeed: z.string().optional()
});

// Weather service class
class WeatherService {
  private readonly API_KEY: string;
  private readonly TIMEOUT: number = 5000;

  constructor(apiKey: string) {
    this.API_KEY = apiKey;
  }

  async getWeatherData(location: string): Promise<WeatherData> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${this.API_KEY}&q=${location}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const validatedData = WeatherResponseSchema.parse({
        temperature: `${data.current.temp_f}°F`,
        condition: data.current.condition.text,
        humidity: `${data.current.humidity}%`,
        windSpeed: `${data.current.wind_mph} mph`
      });

      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid weather data format');
      }
      if (error instanceof Error) {
        throw new Error(`Weather service error: ${error.message}`);
      }
      throw new Error('Unknown error occurred');
    }
  }
}

// Usage example
const weatherService = new WeatherService(process.env.WEATHER_API_KEY!);
```

**Key Features**:
- Type safety
- Error handling
- Request timeout
- Data validation

## Exercise 3: Streaming Component Integration

```typescript
import { streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { WeatherService } from './weather-service';
import { LoadingComponent, WeatherDisplay, ErrorComponent } from './components';

interface StreamProps {
  location: string;
  onError?: (error: Error) => void;
}

export const WeatherStream: React.FC<StreamProps> = ({ location, onError }) => {
  const weatherService = new WeatherService(process.env.WEATHER_API_KEY!);

  const streamWeather = async () => {
    try {
      const result = await streamUI({
        model: openai('gpt-4'),
        prompt: `Get weather for ${location}`,
        text: ({ content }) => <div>{content}</div>,
        tools: {
          getWeather: {
            description: 'Get weather for location',
            parameters: z.object({
              location: z.string()
            }),
            generate: async function* ({ location }) {
              yield <LoadingComponent />;
              try {
                const weatherData = await weatherService.getWeatherData(location);
                return <WeatherDisplay {...weatherData} location={location} />;
              } catch (error) {
                return <ErrorComponent message={error.message} />;
              }
            }
          }
        }
      });

      return result.value;
    } catch (error) {
      onError?.(error);
      return <ErrorComponent message="Failed to stream weather data" />;
    }
  };

  return streamWeather();
};
```

**Key Features**:
- AI integration
- Streaming implementation
- Error handling
- Component generation

## Exercise 4: Tool Implementation

```typescript
import { z } from 'zod';
import { Tool } from '@langchain/core/tools';

// Weather tool implementation
class WeatherTool extends Tool {
  name = 'get_weather';
  description = 'Get weather for location';
  private weatherService: WeatherService;

  constructor(apiKey: string) {
    super();
    this.weatherService = new WeatherService(apiKey);
  }

  protected async _call(input: string): Promise<string> {
    try {
      const weatherData = await this.weatherService.getWeatherData(input);
      return JSON.stringify(weatherData);
    } catch (error) {
      throw new Error(`Weather tool error: ${error.message}`);
    }
  }
}

// Tool configuration
const weatherToolConfig = {
  name: 'get_weather',
  description: 'Get weather for location',
  parameters: z.object({
    location: z.string(),
    units: z.enum(['celsius', 'fahrenheit']).default('fahrenheit')
  }),
  generate: async function* ({ location, units }) {
    try {
      yield <LoadingComponent />;
      const tool = new WeatherTool(process.env.WEATHER_API_KEY!);
      const result = await tool._call(location);
      const weatherData = JSON.parse(result);
      
      // Convert temperature if needed
      if (units === 'celsius') {
        weatherData.temperature = convertToCelsius(weatherData.temperature);
      }
      
      return <WeatherDisplay {...weatherData} location={location} />;
    } catch (error) {
      return <ErrorComponent message={error.message} />;
    }
  }
};

// Temperature conversion utility
function convertToCelsius(fahrenheit: string): string {
  const temp = parseInt(fahrenheit);
  const celsius = ((temp - 32) * 5) / 9;
  return `${Math.round(celsius)}°C`;
}
```

**Key Features**:
- Tool class implementation
- Parameter validation
- Error handling
- Unit conversion

## Exercise 5: Advanced Features

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Cache implementation
const weatherCache = new Map<string, {
  data: WeatherData;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Performance monitoring
const performanceMetrics = {
  requestCount: 0,
  cacheHits: 0,
  averageResponseTime: 0
};

// Weather provider component
const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState(weatherCache);
  const [metrics, setMetrics] = useState(performanceMetrics);

  const getWeather = useCallback(async (location: string) => {
    const startTime = performance.now();
    performanceMetrics.requestCount++;

    // Check cache
    const cachedData = cache.get(location);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      performanceMetrics.cacheHits++;
      return cachedData.data;
    }

    // Fetch new data
    const weatherService = new WeatherService(process.env.WEATHER_API_KEY!);
    const data = await weatherService.getWeatherData(location);
    
    // Update cache
    setCache(prev => new Map(prev).set(location, {
      data,
      timestamp: Date.now()
    }));

    // Update metrics
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    setMetrics(prev => ({
      ...prev,
      averageResponseTime: (prev.averageResponseTime + responseTime) / 2
    }));

    return data;
  }, [cache]);

  return (
    <WeatherContext.Provider value={{ getWeather, metrics }}>
      {children}
    </WeatherContext.Provider>
  );
};

// Performance monitor component
const PerformanceMonitor: React.FC = () => {
  const { metrics } = useWeatherContext();
  
  return (
    <div className="performance-monitor p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Performance Metrics</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>Requests: {metrics.requestCount}</div>
        <div>Cache Hits: {metrics.cacheHits}</div>
        <div>Avg Response: {metrics.averageResponseTime.toFixed(2)}ms</div>
      </div>
    </div>
  );
};
```

**Key Features**:
- Caching mechanism
- Performance monitoring
- Error boundaries
- Context provider

## Final Project Solution

```typescript
// Main application component
const WeatherApplication: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <WeatherProvider>
        <div className="weather-app p-4">
          <header className="mb-4">
            <h1 className="text-2xl font-bold">Weather App</h1>
          </header>
          
          <main>
            <WeatherStream location="San Francisco" />
            <WeatherControls />
            <PerformanceMonitor />
          </main>
        </div>
      </WeatherProvider>
    </ErrorBoundary>
  );
};

// Error fallback component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary
}) => (
  <div className="error-container p-4 bg-red-50 rounded-lg">
    <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
    <pre className="text-sm text-red-500 mb-4">{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Try again
    </button>
  </div>
);

// Weather controls component
const WeatherControls: React.FC = () => {
  const [location, setLocation] = useState('');
  const [units, setUnits] = useState<'celsius' | 'fahrenheit'>('fahrenheit');

  return (
    <div className="weather-controls p-4 bg-white rounded-lg shadow">
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter location"
        className="p-2 border rounded mr-2"
      />
      <select
        value={units}
        onChange={(e) => setUnits(e.target.value as 'celsius' | 'fahrenheit')}
        className="p-2 border rounded"
      >
        <option value="celsius">Celsius</option>
        <option value="fahrenheit">Fahrenheit</option>
      </select>
    </div>
  );
};
```

**Key Features**:
- Complete application structure
- Error boundary implementation
- Performance monitoring
- User controls
- Responsive design

## Best Practices

1. **Component Design**
   - Use TypeScript for type safety
   - Implement proper error handling
   - Use semantic HTML
   - Follow React best practices

2. **State Management**
   - Use React Context for global state
   - Implement proper caching
   - Handle loading states
   - Manage error states

3. **Performance**
   - Implement caching
   - Monitor performance
   - Optimize rendering
   - Handle timeouts

4. **Error Handling**
   - Use error boundaries
   - Implement fallback UI
   - Log errors properly
   - Provide user feedback

## Common Pitfalls

1. **Memory Leaks**
   - Always cleanup resources
   - Clear timeouts
   - Unsubscribe from events
   - Clear cache properly

2. **Error Handling**
   - Don't swallow errors
   - Provide meaningful messages
   - Implement proper fallbacks
   - Handle edge cases

3. **Performance**
   - Monitor cache size
   - Optimize API calls
   - Handle loading states
   - Implement proper timeouts

4. **Type Safety**
   - Use proper interfaces
   - Validate data
   - Handle optional fields
   - Use proper type guards

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Zod Documentation](https://zod.dev/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) 