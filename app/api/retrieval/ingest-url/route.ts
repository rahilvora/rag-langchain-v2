import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
export const runtime = "edge";

// Before running, follow set-up instructions at
// https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase

/**
 * This handler takes input text, splits it into chunks, and embeds those chunks
 * into a vector store for later retrieval. See the following docs for more information:
 *
 * https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/recursive_text_splitter
 * https://js.langchain.com/docs/modules/data_connection/vectorstores/integrations/supabase
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = body.url;

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
  try {
    const docs = await getDocs(url);
    const splitDocs = await getSplitDocs(docs);
    const vectorstore = await storeData(splitDocs);
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
      llm: model,
      prompt:historyAwareRetrievalPrompt,
    });

    createRetrievalChain({
      combineDocsChain: historyAwareCombineDocsChain,
      retriever: vectorstore.asRetriever(),
    });
    return NextResponse.json({ message: `${url} is uploaded` });
  }
  catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function getDocs(url: string) {
    const loader = new CheerioWebBaseLoader(url);
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