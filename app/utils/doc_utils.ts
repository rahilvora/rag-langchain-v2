import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { VectorStore } from "@/database/vector_store"

/**
 * Get docs from a given url
 * @param {string} url
 * @returns {Promise<Document[]>}
 */
export async function getDocs(url: string): Promise<Document[]> {
  const loader = new CheerioWebBaseLoader(url);
  return loader.load();
}

/**
 * Get split docs
 * @param {Document[]} docs
 * @returns {Promise<Document[]>}
 */
export async function getSplitDocs(docs: Document[]): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter();
  return splitter.splitDocuments(docs);
}

/**
 * Create vector store
 * @param {string} index
 * @param {Document[]} docChunks
 * @returns {Promise<VectorStore>}
 */
export async function createVectorStore(index: string, docChunks: Document []): Promise<PineconeStore> {
  return await new VectorStore(index).createVectorStore(docChunks);
}
