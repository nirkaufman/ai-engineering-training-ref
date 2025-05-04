'use server'

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0
});


const taggingPrompt = ChatPromptTemplate.fromTemplate(
    `Extract the desired information from the following passage.

                Only extract the properties mentioned in the 'Classification' function.
                
                Passage:
                {input}
`
);

const classificationSchema = z.object({
  sentiment: z.string().describe("The sentiment of the text"),
  aggressiveness: z
      .number()
      .int()
      .describe("How aggressive the text is on a scale from 1 to 10"),
  language: z.string().describe("The language the text is written in"),
});



const llmWihStructuredOutput = llm.withStructuredOutput(classificationSchema, {
  name: "extractor",
});



const model = new ChatOpenAI({ model: "gpt-4" });

/**
 * Streams classification results for the provided text
 * @param text The text to classify
 * @returns A ReadableStream containing the classification results
 */
export async function streamClassification(text: string) {
  const prompt = await taggingPrompt.invoke({ input: text});


  const messages = [
    new SystemMessage(
      "You are a content classifier. Analyze the text and classify it into one of these categories: " +
      "Business, Technology, Health, Education, Entertainment, or Other. " +
      "First, provide the classification category in a single word. " +
      "Then, on a new line, provide a brief explanation for why you classified it this way."
    ),
    new HumanMessage(prompt.toString()),
  ];

  const stream = await llmWihStructuredOutput.stream(messages);

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
        console.error("Error in classification stream:", error);
        controller.error(error);
      }
    },
  });
}
