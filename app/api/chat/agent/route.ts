import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, ChatMessage } from "@langchain/core/messages";
import { Calculator } from "@langchain/community/tools/calculator";
import { createOpenAIFunctionsAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import RetrieverTool from "@/tools/retriever_tool";
import SearchTool from "@/tools/search_tool";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const agentExecutor = await getAgent();
    // TODO: Figure out how to Stream Agent Response instead of waiting for the response
    const result = await agentExecutor.invoke({
      input: currentMessageContent,
      chat_history: formattedPreviousMessages,
    });
    return NextResponse.json(
      { output: result.output, intermediate_steps: result.intermediateSteps },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

async function getAgent() {
  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      "system", `You are a helpful agent who is very polite. All responses must be elloborated and with examples if possible. Please do not assume things if you have no knowledge about it.
      Given the above conversation, generate a search query to look up to get information relevant to the conversation.`,
    ],
    new MessagesPlaceholder("chat_history"),
    new MessagesPlaceholder("agent_scratchpad"),
    ["user", "{input}"],
  ]);

  const model = new ChatOpenAI({
    temperature: 0.8,
    modelName: "gpt-3.5-turbo-1106",
  });

  const tools =  [
    new Calculator(),
    await new RetrieverTool().getRetrieverTool(),
    new SearchTool().getSearchTool()
  ];

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt: historyAwareRetrievalPrompt,
    streamRunnable: true,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });
  return agentExecutor;
}
