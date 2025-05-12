'use server'
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";


// Step 1: Define the state structure with annotations
const AgentStateAnnotation = Annotation.Root({
  // Track the current task the agent is working on
  task: Annotation<string>(),

  // Store intermediate results from tool usage
  toolResults: Annotation<Record<string, any>>(),

  // Track all steps the agent has taken
  steps: Annotation<Array<{action: string, result: string}>>(),

  // Store the final answer
  finalAnswer: Annotation<string | null>(),

  // Flag to determine if the workflow is complete
  isComplete: Annotation<boolean>()
});

// Create the language model
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2
});

// Step 2: Define the graph nodes that will operate on the state

// Node to determine the next action
const planNextAction = async (state: typeof AgentStateAnnotation.State) => {
  const promptTemplate = ChatPromptTemplate.fromTemplate(
      `You are a task-oriented agent. Your current task is: {task}.
     
     Previous steps you've taken:
     {steps}
     
     Determine the next action to take. 
     If the task is complete, respond with "COMPLETE: [final answer]".
     Otherwise, respond with "ACTION: [action name]".`
  );

  const messages = await promptTemplate.invoke({
    task: state.task,
    steps: state.steps.map(step =>
        `Action: ${step.action}\nResult: ${step.result}`
    ).join("\n\n") || "No steps taken yet."
  });

  const response = await llm.invoke(messages);
  const content = response.content.toString();

  if (content.startsWith("COMPLETE:")) {
    const finalAnswer = content.replace("COMPLETE:", "").trim();
    return {
      finalAnswer,
      isComplete: true
    };
  }

  const nextAction = content.replace("ACTION:", "").trim();

  return {
    steps: [...state.steps, { action: nextAction, result: "" }],
    isComplete: false
  };
};

// Node to execute the chosen action
const executeAction = async (state: typeof AgentStateAnnotation.State) => {
  // Get the last action from the steps array
  const lastStep = state.steps[state.steps.length - 1];

  // This is a simplified example. In a real agent, you would have a
  // tool registry and execute the appropriate tool here
  let result = "Result placeholder for action: " + lastStep.action;

  // Update the result in the last step
  const updatedSteps = [...state.steps];
  updatedSteps[updatedSteps.length - 1].result = result;

  // Store the result in toolResults for easy access later
  return {
    steps: updatedSteps,
    toolResults: {
      ...state.toolResults,
      [lastStep.action]: result
    }
  };
};

// Step 3: Build the graph
const workflow = new StateGraph(AgentStateAnnotation)
    .addNode("plan", planNextAction)
    .addNode("execute", executeAction)
    .addEdge("__start__", "plan")
    .addConditionalEdges(
        "plan",
        (state) => state.isComplete ? "__end__" : "execute"
    )
    .addEdge("execute", "plan")
    .compile();

// Step 4: Create a function to run the workflow
export async function runAgent(task: string) {
  // Initialize the state
  const initialState = {
    task,
    toolResults: {},
    steps: [],
    finalAnswer: null,
    isComplete: false
  };

  // Stream the results
  const stream = await workflow.stream(initialState, {
    streamMode: 'updates'
  });

  // In a real application, you'd return this stream to be consumed
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          // Format the output based on the node that produced it
          if (chunk.plan) {
            if (chunk.plan.isComplete && chunk.plan.finalAnswer) {
              // Format the final answer
              controller.enqueue(`✅ Task Complete: ${chunk.plan.finalAnswer}\n\n`);
            } else if (chunk.plan.steps) {
              // Format the planning step
              const newAction = chunk.plan.steps[chunk.plan.steps.length - 1]?.action || '';
              controller.enqueue(`🤔 Planning next action: ${newAction}\n\n`);
            }
          } else if (chunk.execute) {
            // Format the execution step
            const lastStep = chunk.execute.steps[chunk.execute.steps.length - 1];
            if (lastStep) {
              controller.enqueue(`🔧 Executing: ${lastStep.action}\n`);
              controller.enqueue(`📋 Result: ${lastStep.result}\n\n`);
            }
          } else {
            // Fallback for any other types of chunks
            controller.enqueue(JSON.stringify(chunk, null, 2) + "\n\n");
          }
        }
        controller.close();
      } catch (error) {
        console.error("Error in agent stream:", error);
        controller.error(error);
      }
    },
  });
}
