'use server'

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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


export async function streamChatWithPromptTemplate(
    language: string,
    text: string
) {
  const systemTemplate = "Translate the following from English into {language}";

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);

  const messages = await promptTemplate.formatMessages({
    language: language,
    text: text,
  });

  const stream = await model.stream(messages);

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(chunk.content);
      }
      controller.close();
    },
  });
}
