# Generative UI Implementation Exercises

These exercises will help you build and enhance your generative UI system using streaming components and AI. Each exercise builds upon the previous one, gradually introducing more complex concepts and features.

## Exercise 1: Basic Component Setup

**Task**: Create basic React components for a weather application.

**Requirements**:
- Create a loading component
- Define TypeScript interfaces
- Implement a weather display component
- Add proper styling

**Example Usage**:
```typescript
const LoadingComponent = () => (
  <div className="animate-pulse">Loading...</div>
);

interface WeatherProps {
  location: string;
  temperature: string;
  condition: string;
}

const WeatherDisplay = (props: WeatherProps) => (
  <div className="weather-card">
    <h2>{props.location}</h2>
    <p>{props.temperature}</p>
    <p>{props.condition}</p>
  </div>
);
```

**Hints**:
- Use TypeScript interfaces
- Implement proper styling
- Add loading animations
- Use semantic HTML

**Submission Guidelines**:
- Submit a TypeScript file
- Include all necessary imports
- Document component props
- Add CSS styling

**Evaluation Criteria**:
- Component structure
- Type safety
- Styling implementation
- Code organization

## Exercise 2: Weather Service Implementation

**Task**: Implement a weather service with proper error handling.

**Requirements**:
- Create an async weather service
- Implement error handling
- Add request timeout
- Return formatted data

**Example Usage**:
```typescript
const getWeatherData = async (location: string) => {
  try {
    // Implement weather fetching
    return {
      temperature: "72°F",
      condition: "Sunny"
    };
  } catch (error) {
    throw new Error("Failed to fetch weather");
  }
};
```

**Hints**:
- Use try-catch blocks
- Implement timeouts
- Format response data
- Handle edge cases

**Submission Guidelines**:
- Submit a TypeScript file
- Include error handling
- Document the API
- Add type definitions

**Evaluation Criteria**:
- Error handling
- Data formatting
- Code structure
- Documentation

## Exercise 3: Streaming Component Integration

**Task**: Implement streaming components with AI integration.

**Requirements**:
- Set up AI SDK
- Configure streaming
- Implement component generation
- Handle different states

**Example Usage**:
```typescript
const WeatherStream = async () => {
  const result = await streamUI({
    model: openai('gpt-4'),
    prompt: 'Get weather for location',
    tools: {
      getWeather: {
        // Implement tool configuration
      }
    }
  });
  return result.value;
};
```

**Hints**:
- Use AI SDK properly
- Implement streaming
- Handle component states
- Add proper error handling

**Submission Guidelines**:
- Submit a TypeScript file
- Include AI configuration
- Document streaming setup
- Add error handling

**Evaluation Criteria**:
- AI integration
- Streaming implementation
- State management
- Error handling

## Exercise 4: Tool Implementation

**Task**: Create and integrate custom tools for the weather application.

**Requirements**:
- Define tool interface
- Implement tool logic
- Add parameter validation
- Handle tool responses

**Example Usage**:
```typescript
const weatherTool = {
  name: 'get_weather',
  description: 'Get weather for location',
  parameters: z.object({
    location: z.string(),
    units: z.enum(['celsius', 'fahrenheit'])
  }),
  generate: async function* ({ location, units }) {
    // Implement tool logic
  }
};
```

**Hints**:
- Use Zod for validation
- Implement proper typing
- Handle async operations
- Add error handling

**Submission Guidelines**:
- Submit a TypeScript file
- Include tool implementation
- Document parameters
- Add validation

**Evaluation Criteria**:
- Tool implementation
- Parameter validation
- Error handling
- Documentation

## Exercise 5: Advanced Features

**Task**: Implement advanced features for the weather application.

**Requirements**:
- Add caching mechanism
- Implement error boundaries
- Add performance monitoring
- Optimize rendering

**Example Usage**:
```typescript
const WeatherApp = () => {
  const [cache, setCache] = useState(new Map());
  const [metrics, setMetrics] = useState({});

  // Implement advanced features
};
```

**Hints**:
- Use React hooks
- Implement caching
- Add performance tracking
- Optimize components

**Submission Guidelines**:
- Submit a TypeScript file
- Include advanced features
- Document optimizations
- Add monitoring

**Evaluation Criteria**:
- Feature implementation
- Performance optimization
- Code organization
- Documentation

## Final Project

**Task**: Create a complete weather application with all features.

**Requirements**:
- Combine all previous exercises
- Add additional features
- Implement comprehensive error handling
- Add documentation

**Example Usage**:
```typescript
const WeatherApplication = () => {
  // Implement complete application
  return (
    <ErrorBoundary>
      <WeatherProvider>
        <WeatherDisplay />
        <WeatherControls />
        <PerformanceMonitor />
      </WeatherProvider>
    </ErrorBoundary>
  );
};
```

**Hints**:
- Review all previous exercises
- Add comprehensive error handling
- Implement all features
- Add thorough documentation

**Submission Guidelines**:
- Submit a complete TypeScript implementation
- Include all features
- Add comprehensive documentation
- Provide usage examples

**Evaluation Criteria**:
- Feature completeness
- Code quality
- Error handling
- Documentation
- Performance
- User experience

## Resources

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [React Documentation](https://react.dev/) 