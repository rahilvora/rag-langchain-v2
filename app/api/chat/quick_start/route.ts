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
export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};
let retrievalChain: Runnable;
const TEMPLATE = `
    You are a helpful agent who is very polite and direct. 
    All responses must be concise not too long and not too short. 
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
  // const stream = await retrievalChain
  //   .pick("answer")
  //   // .pipe(new HttpResponseOutputParser())
  //   .stream({
  //     chat_history:[],
  //     input: 'What is langsmith?',
  //   });

  //   for await (const chunk of stream) {
  //     console.log(chunk);
  //   }
  return NextResponse.json({ message: "Hello, world!" });
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
        "https://docs.smith.langchain.com/user_guide"
    );
    return loader.load();
}

async function getSplitDocs(docs: Document<Record<string, any>>[]) {;
    const splitter = new RecursiveCharacterTextSplitter();
    return splitter.splitDocuments(docs);
}

async function storeData(docChunks: Document<Record<string, any>>[]) {
    const embeddings = new OpenAIEmbeddings();
    const vectorstore = await MemoryVectorStore.fromDocuments(
        docChunks,
        embeddings
      );
    return vectorstore;
}