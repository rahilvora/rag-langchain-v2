import { Pinecone, Index } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

/**
 * A vector store class abstracting all interactions with Pinecone store
 * TODO Make this class Singleton
 */
export class VectorStore {
  index: Index
  embeddings: OpenAIEmbeddings
  vectorStore: PineconeStore|null
  pinecone: Pinecone

  constructor(index: string) {
    this.embeddings = new OpenAIEmbeddings();
    this.pinecone = new Pinecone();
    // This should work but doesn't
    // this.index = new Pinecone().Index(index);
    this.index = this.pinecone.Index(process.env.PINECONE_INDEX!)
    this.vectorStore = null
  }

  async createVectorStore(docChunks: Document []): Promise<PineconeStore> {
    return PineconeStore.fromDocuments(docChunks, this.embeddings, {
      pineconeIndex: this.index,
      maxConcurrency: 5
    });
  }

  async getVectorStore(): Promise<PineconeStore> {
    return await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      {pineconeIndex: this.index}
    );
  }
}
