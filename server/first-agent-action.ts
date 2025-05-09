'use server'
import { TavilySearch } from "@langchain/tavily";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {v4 as uuidv4} from "uuid";


// Define the tools for the agent to use
const agentTools = [new TavilySearch({ maxResults: 3 })];
const agentModel = new ChatOpenAI({ temperature: 0 });


// Initialize memory to persist state between graph runs
const agentCheckPointer = new MemorySaver();

// create the actual agent
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckPointer,
});

// create a unique id for the thread
const config = { configurable: { thread_id: uuidv4() } };


export async function chatWithAgent(prompt: string) {

  const stream = await agent.stream(
      { messages: [new HumanMessage(prompt)]},
      config,
  );

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
          console.log("Agent chunk:", chunk);
          
          // Handle different types of chunks that can come from the agent
          if (chunk.agent && chunk.agent.messages && chunk.agent.messages.length > 0) {
            // Final answer from the agent
            if (chunk.agent.messages[0].content) {
              controller.enqueue(chunk.agent.messages[0].content);
            }
          } 
          else if (chunk.tools && chunk.tools.messages && chunk.tools.messages.length > 0) {
            // Tool response
            if (chunk.tools.messages[0].content) {
              controller.enqueue(`Tool Result: ${chunk.tools.messages[0].content}`);
            }
          }
          else if (chunk.intermediate_steps) {
            // Intermediate steps (reasoning, etc.)
            for (const step of chunk.intermediate_steps) {
              if (step.action) {
                // Tool being called
                controller.enqueue(`Using tool: ${step.action.tool} with input: ${step.action.toolInput}`);
              }
              if (step.observation) {
                // Tool response
                controller.enqueue(`Tool result: ${step.observation}`);
              }
            }
          }
          else if (chunk.generated) {
            // Generated reasoning
            controller.enqueue(`Thinking: ${chunk.generated}`);
        }
      }
      controller.close();
    },
  });
}
