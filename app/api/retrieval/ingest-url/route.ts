import { NextRequest, NextResponse } from "next/server";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { VectorStore } from "@/database/vector_store"
export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = body.url;
  try {
    const docs = await getDocs(url);
    const splitDocs = await getSplitDocs(docs);
    const vectorstore = await createVectorStore(url, splitDocs);
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

async function createVectorStore(index: string, docChunks: Document []) {
  return await new VectorStore(index).createVectorStore(docChunks);
}