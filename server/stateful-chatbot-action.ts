'use server';

import { ChatOpenAI } from "@langchain/openai";

// These imports are for the stateful example
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";

import { v4 as uuidv4 } from "uuid";
import {ChatPromptTemplate} from "@langchain/core/prompts";



const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0
});


// test the stateless chat by providing some information such as
// "My name is Nir" and trying to ask for your name
export async function statelessChat(prompt: string) {

  const stream = await model.stream([
    {role: "user", content: prompt},
  ]);

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(chunk.content);
      }
      controller.close();
    },
  });
}


/**
 * LANG_GRAPH MEMORY EXAMPLE
 */

// Define the function that calls the model
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await model.invoke(state.messages);
  return { messages: response };
};

/*********************
  Example with templates
 *************************/

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You talk like a pirate. Answer all questions to the best of your ability.",
  ],
  ["placeholder", "{messages}"],
]);

const callModel2 = async (state: typeof MessagesAnnotation.State) => {
  const prompt = await promptTemplate.invoke(state);
  const response = await model.invoke(prompt);

  // Update message history with a response:
  return { messages: [response] };
};

/*********************
 END Example with templates
 *************************/


// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
    // Define the node and edge
    .addNode("model", callModel)
    .addEdge(START, "model")
    .addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

const config = { configurable: { thread_id: uuidv4() } };


export async function chatWithMemory(prompt: string) {

  const stream = await app.stream({
    messages: [{role: "user", content: prompt},],
  }, config);

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {

        controller.enqueue(chunk.model.messages.content);

        // for messages placeholder
        // controller.enqueue(chunk.model.messages[0].content);
      }
      controller.close();
    },
  });
}
