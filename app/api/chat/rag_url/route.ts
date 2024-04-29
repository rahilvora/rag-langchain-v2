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

export async function GET(req: NextRequest) {
  console.log("Initializing...")
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
  const docs = await getDocs();
  const splitDocs = await getSplitDocs(docs);
  const vectorstore = await storeData(splitDocs);
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt:historyAwareRetrievalPrompt,
  });

  conversationalRetrievalChain = await createRetrievalChain({
    combineDocsChain: historyAwareCombineDocsChain,
    retriever: vectorstore.asRetriever(),
  });
  return NextResponse.json({ message: "Success!" });
}

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

async function getDocs() {
    const loader = new CheerioWebBaseLoader(
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
    );
    return loader.load();
}

async function getSplitDocs(docs: Document[]) {
  const splitter = new RecursiveCharacterTextSplitter();
  return splitter.splitDocuments(docs);
}

async function storeData(docChunks: Document  []) {
  const embeddings = new OpenAIEmbeddings();
  const vectorstore = await MemoryVectorStore.fromDocuments(
    docChunks,
    embeddings
  );
  return vectorstore;
}