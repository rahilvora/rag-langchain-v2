import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { ChatMessage } from "@langchain/core/messages";
import { VectorStore } from "@/database/vector_store"

export const runtime = "edge";

const formatMessage = (message: ChatMessage) => {
  return new ChatMessage({content: message.content, role: message.role})
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
    const chain = await getRetrivalChain();
    const stream = await chain
    .pick("answer")
    .pipe(new HttpResponseOutputParser())
    .stream({
      chat_history: formattedPreviousMessages,
      input: currentMessageContent,
    });
    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

async function getRetrivalChain(): Promise<Runnable> {
  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      "system", `You are a helpful agent who is very polite. All responses must be elloborated and with examples if possible. Please do not assume things if you have no knowledge about it.
      Given the above conversation, generate a search query to look up to get information relevant to the conversation:\n\n{context}`,
    ],
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
  ]);
    
  const model = new ChatOpenAI({
    temperature: 0.8,
    modelName: "gpt-3.5-turbo-1106",
  });

  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt:historyAwareRetrievalPrompt,
  });
  const vectorStore = await new VectorStore('').getVectorStore();
  return createRetrievalChain({
    combineDocsChain: historyAwareCombineDocsChain,
    retriever: vectorStore.asRetriever(),
  });
}