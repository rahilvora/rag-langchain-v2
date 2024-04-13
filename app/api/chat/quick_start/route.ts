import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Runnable } from "@langchain/core/runnables";
import { Document } from "langchain/document";
export const runtime = "edge";
export const dynamic = 'force-dynamic';

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};
let retrievalChain: Runnable;
const TEMPLATE = `
    You are a helpful agent who is very polite. 
    All responses must be elloborated and with examples if possible. 
    Please do not assume things if you have no knowledge about it
    
    <chat_history>
      {chat_history}
    </chat_history>

    <context>
      {context}
    </context>
    User: {input}
    AI:
`;

export async function GET(req: NextRequest) {
  const prompt = PromptTemplate.fromTemplate(TEMPLATE);
  const model = new ChatOpenAI({
    temperature: 0.8,
    modelName: "gpt-3.5-turbo-1106",
  });
  const docs = await getDocs();
  const splitDocs = await getSplitDocs(docs);
  const vectorstore = await storeData(splitDocs);
  const documentChain = await createStuffDocumentsChain({
    llm: model,
    prompt,
  });
  retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
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
    const stream = await retrievalChain
    .pick("answer")
    .pipe(new HttpResponseOutputParser())
    .stream({
      chat_history: formattedPreviousMessages.join("\n"),
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