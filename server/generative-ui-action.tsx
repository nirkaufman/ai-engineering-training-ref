'use server';

import { streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Simple React component for loading state
const LoadingComponent = () => (
    <div className="animate-pulse p-4">getting weather...</div>
);

// Simple function to get weather for a location
// This function is slow, so we use a timeout to simulate a network request
const getWeather = async (location: string) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return '82°F️ ☀️';
};

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

export async function streamComponent() {
  const result = await streamUI({
    model: openai('gpt-4o'),
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
