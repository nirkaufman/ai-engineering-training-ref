'use server';

import {z} from "zod";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {ChatOpenAI} from "@langchain/openai";

// Represents an instance of the ChatOpenAI language model configuration.
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0
});

// describe what information we want to extract from the text.
const personSchema = z.object({
  name: z.optional(z.string()).describe("The name of the person"),
  hair_color: z
      .optional(z.string())
      .describe("The color of the person's hair if known"),
  height_in_meters: z
      .optional(z.string())
      .describe("Height measured in meters"),
});


/**
 * The `promptTemplate` variable defines a chat prompt template used for generating
 * an expert extraction algorithm behavior. It consists of predefined messages
 * for context setup and interaction flow, enabling the system to extract
 * relevant information from provided input.
 *
 * The template specifies:
 *  - A system message explaining the behavior of the extraction algorithm,
 *    focusing on extracting relevant information from text and returning null
 *    for unknown attribute values.
 *  - A human message which allows dynamic input by replacing placeholders
 *    with actual content during runtime.
 */
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert extraction algorithm.
     Only extract relevant information from the text.
     If you do not know the value of an attribute asked to extract,
     return null for the attribute's value.`,
  ],
  ["human", "{text}"],
]);


const structuredLLM = llm.withStructuredOutput(personSchema);


export async function streamExtraction(text: string) {

  const prompt = await promptTemplate.invoke({text});
  const stream = await structuredLLM.stream(prompt.toString());

  // Return a ReadableStream for server-sent events
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          // Send each chunk to the client
          controller.enqueue(JSON.stringify(chunk, null, 2));
        }
        controller.close();
      } catch (error) {
        console.error("Error in extraction stream:", error);
        controller.error(error);
      }
    },
  });
}




