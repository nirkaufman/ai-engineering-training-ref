'use server'

import {Annotation, END, START, StateGraph} from "@langchain/langgraph";


// Define the state using LangGraph's Annotation system
const state = Annotation.Root({
  graphState: Annotation<string>()
});

// Type for the state
type StateType = typeof state.State;

// Nodes are simple functions that accept state, and return state
function node_1(state: StateType): StateType {
  return {graphState: state.graphState + " I am"};
}

function node_2(state: StateType): StateType {
  return {graphState: state.graphState + " happy!"};
}

function node_3(state: StateType): StateType {
  return {graphState: state.graphState + " sad!"};
}


// Node is a simple function
function decideMood(state: StateType): "node_2" | "node_3" {

  // Often, we will use state to decide on the next node to visit
  console.log("User input:", state.graphState);

  // Here, let's just do a 50 / 50 split between nodes 2, 3
  if (Math.random() < 0.5) {

    // 50% of the time, we return Node 2
    return "node_2";
  }

  // 50% of the time, we return Node 3
  return "node_3";
}


// Build graph
const graph = new StateGraph(state)

    // Add Nodes
    .addNode("node_1", node_1)
    .addNode("node_2", node_2)
    .addNode("node_3", node_3)

    // Logic
    .addEdge(START, "node_1")
    .addConditionalEdges("node_1", decideMood)
    .addEdge("node_2", END)
    .addEdge("node_3", END)

    //Finally, compile the graph
    .compile()

// Server action to run the graph and stream the results to the client
export async function runSimpleGraph(initialMessage: string = "Hello") {
  // Initialize the state
  const initialState = {
    graphState: initialMessage
  };

  // Stream the results
  const stream = await graph.stream(initialState, {
    streamMode: 'updates'
  });

  // Return a readable stream for the UI
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          console.log('**chunk**', chunk);

          if (chunk.node_1) {
            controller.enqueue(`🔍 Node 1 processed: "${chunk.node_1.graphState}"\n\n`);
          }

          if (chunk.node_2) {
            controller.enqueue(`😀 Node 2 (Happy Path): "${chunk.node_2.graphState}"\n\n`);
          }

          if (chunk.node_3) {
            controller.enqueue(`😢 Node 3 (Sad Path): "${chunk.node_3.graphState}"\n\n`);
          }
        }

        controller.enqueue("✅ Graph execution complete\n");
        controller.close();
      } catch (error) {
        console.error("Error in graph stream:", error);
        controller.error(error);
      }
    },
  });
}


