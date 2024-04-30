import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import { ChatMessage } from "@langchain/core/messages";

export const runtime = "edge";

const formatMessage = (message: ChatMessage) => {
  return new ChatMessage({content: message.content, role: message.role})
};
let conversationalRetrievalChain: Runnable;

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
    const stream = await conversationalRetrievalChain
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