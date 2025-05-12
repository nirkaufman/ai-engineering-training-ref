# Building Generative UI with Streaming Components

This tutorial guides you through creating a generative UI system that uses streaming components and AI to create dynamic, interactive interfaces.

## Prerequisites

- Next.js environment
- AI SDK installed
- OpenAI API key configured
- Basic React knowledge
- TypeScript understanding

## 1. Basic Component Setup

Let's start by setting up the basic components and types.

```typescript
// Simple React component for loading state
const LoadingComponent = () => (
    <div className="animate-pulse p-4">getting weather...</div>
);

// Interface for weather component props
interface WeatherProps {
  location: string;
  weather: string;
}

// Simple React component for displaying weather information
const WeatherComponent = (props: WeatherProps) => (
    <div className="border border-neutral-200 p-4 rounded-lg max-w-fit">
      The weather in {props.location} is {props.weather}
    </div>
);
```

This setup:
- Creates a loading component
- Defines weather component props
- Implements a weather display component
- Uses TypeScript for type safety

## 2. Implementing the Weather Service

Now, let's implement the weather service function.

```typescript
// Simple function to get weather for a location
const getWeather = async (location: string) => {
  // Simulate network request with timeout
  await new Promise(resolve => setTimeout(resolve, 2000));
  return '82°F️ ☀️';
};
```

This implementation:
- Takes a location parameter
- Simulates network delay
- Returns weather information
- Handles async operations

## 3. Creating the Streaming Component

Let's implement the main streaming component function.

```typescript
import { streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function streamComponent() {
  const result = await streamUI({
    model: openai('gpt-4'),
    prompt: 'Get the weather for San Francisco',
    text: ({ content }) => <div>{content}</div>,
    tools: {
      getWeather: {
        description: 'Get the weather for a location',
        parameters: z.object({
          location: z.string(),
        }),
        generate: async function* ({ location }) {
          yield <LoadingComponent />;
          const weather = await getWeather(location);
          return <WeatherComponent weather={weather} location={location} />;
        },
      },
    },
  });

  return result.value;
}
```

This implementation:
- Uses AI SDK for streaming
- Configures the language model
- Defines tool parameters
- Handles component generation

## 4. Understanding Component Flow

### Tool Definition
```typescript
tools: {
  getWeather: {
    description: 'Get the weather for a location',
    parameters: z.object({
      location: z.string(),
    }),
    generate: async function* ({ location }) {
      // Implementation
    },
  },
}
```
- **Description**: Tool purpose
- **Parameters**: Input validation
- **Generate**: Component generation

### Streaming Implementation
```typescript
const result = await streamUI({
  model: openai('gpt-4'),
  prompt: 'Get the weather for San Francisco',
  text: ({ content }) => <div>{content}</div>,
  // Tool configuration
});
```
- **Model**: Language model
- **Prompt**: User request
- **Text**: Content rendering
- **Tools**: Available actions

## 5. Component States

The system handles different states:

1. **Loading State**
   ```typescript
   yield <LoadingComponent />;
   ```

2. **Weather Display**
   ```typescript
   return <WeatherComponent weather={weather} location={location} />;
   ```

3. **Error Handling**
   ```typescript
   try {
     const weather = await getWeather(location);
   } catch (error) {
     // Handle error
   }
   ```

## Usage Examples

### Basic Weather Request
```typescript
const component = await streamComponent();
// Renders weather information for San Francisco
```

### Custom Location
```typescript
const component = await streamUI({
  model: openai('gpt-4'),
  prompt: 'Get the weather for New York',
  // Tool configuration
});
```

## Best Practices

1. **Component Design**
   - Keep components simple
   - Use TypeScript interfaces
   - Implement proper loading states
   - Handle errors gracefully

2. **Streaming Implementation**
   - Use proper async/await
   - Implement proper error handling
   - Handle loading states
   - Provide user feedback

3. **Error Handling**
   - Catch async errors
   - Provide fallback UI
   - Log errors properly
   - Handle edge cases

## Common Issues and Solutions

1. **Streaming Issues**
   - Problem: Component not updating
   - Solution: Check async flow
   - Best Practice: Use proper yield/return

2. **Type Errors**
   - Problem: Type mismatches
   - Solution: Define proper interfaces
   - Best Practice: Use TypeScript strictly

3. **Performance Issues**
   - Problem: Slow rendering
   - Solution: Optimize async operations
   - Best Practice: Use proper loading states

## Next Steps

1. Add more tools
2. Implement error boundaries
3. Add more component types
4. Implement caching
5. Add performance monitoring

## Resources

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/) 