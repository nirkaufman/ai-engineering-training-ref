'use server'

import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { Annotation } from "@langchain/langgraph";
import { StateGraph } from "@langchain/langgraph";



/****************************
   1. Instantiate model
****************************/

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0
});

/****************************
   2. Instantiate embedding model
****************************/
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large"
});


/****************************
   3. Instantiate vector store
****************************/

const vectorStore = new MemoryVectorStore(embeddings);



/****************************
   4. Loading documents
****************************/

// Select the p tag to extract the text from
const pTagSelector = "p";

// Load the page using the CheerioWebBaseLoader
const cheerioLoader = new CheerioWebBaseLoader(
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    {
      selector: pTagSelector,
    }
);

// Load the page and extract the text from the p tag
const docs = await cheerioLoader.load();


console.assert(docs.length === 1);
console.log(`Total characters: ${docs[0].pageContent.length}`);



/****************************
    5. Split documents
****************************/


const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const allSplits = await splitter.splitDocuments(docs);

console.log(`Split blog post into ${allSplits.length} sub-documents.`);


/****************************
    5. Store documents
 ****************************/

await vectorStore.addDocuments(allSplits);


/****************************
   6. Retrieval and Generation
 ****************************/

const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

// Example:
const example_prompt = await promptTemplate.invoke({
  context: "(context goes here)",
  question: "(question goes here)",
});


/****************************
  7. Define the graph state
****************************/

const InputStateAnnotation = Annotation.Root({
  question: Annotation<string>,
});

const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  context: Annotation<Document[]>,
  answer: Annotation<string>,
});


/****************************
 7. Define the graph nodes
 ****************************/

const retrieve = async (state: typeof InputStateAnnotation.State) => {
  const retrievedDocs = await vectorStore.similaritySearch(state.question);
  return { context: retrievedDocs };
};

const generate = async (state: typeof StateAnnotation.State) => {
  const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
  const messages = await promptTemplate.invoke({
    question: state.question,
    context: docsContent,
  });
  const response = await llm.invoke(messages);
  return { answer: response.content };
};


/****************************
 8. Build the graph control flow
 ****************************/

const graph = new StateGraph(StateAnnotation)
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge("__start__", "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", "__end__")
    .compile();


export async function chatWithRag(question: string) {
  // Format the question using the promptTemplate
  const formattedQuestion = await promptTemplate.formatMessages({
    question: question,
    context: "" // Initially empty, will be filled during retrieval
  });

  // Extract the content from the formatted question, ensuring it's a string
  const formattedContent = typeof formattedQuestion[0].content === 'string'
    ? formattedQuestion[0].content
    : question;

  const stream = await graph.stream({ question: formattedContent }, {
    streamMode:'updates'
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          console.log(chunk);

          // Format the chunk based on its content
          if (chunk.question) {
            controller.enqueue(`{ question: '${chunk.question}' }\n\n---\n\n`);
          }
          else if (chunk.retrieve?.context) {
            const contextStr = `{\n  retrieve: { context: [ ${chunk.retrieve.context.map(() => '[Document]').join(', ')} ] }\n}\n\n---\n\n`;
            controller.enqueue(contextStr);
          }
          else if (chunk.generate?.answer) {
            const answerStr = `{\n  generate: {\n    answer: '${chunk.generate.answer}'\n  }\n}\n\n----\n`;
            controller.enqueue(answerStr);
          }
        }

        controller.close();
      } catch (error) {
        console.error("Error in RAG chat stream:", error);
        controller.error(error);
      }
    },
  });
}
