'use server'

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({ model: "gpt-4" });

export async function chatResponse() {
  const messages = [
    new SystemMessage("Translate the following from English into spanish"),
    new HumanMessage('hi'),
  ];
  const response = await model.invoke(messages);
  return JSON.stringify(response, null, 2);
}


export async function streamChat(prompt: string) {
  const messages = [
    new SystemMessage("Translate the following from English into spanish"),
    new HumanMessage(prompt),
  ];
  const stream = await model.stream(messages);

  // We need to use a ReadableStream for server-sent events
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        // Send each chunk to the client
        controller.enqueue(chunk.content);
      }
      controller.close();
    },
  });
}
