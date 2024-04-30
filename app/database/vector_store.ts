import { Pinecone, Index } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

/**
 * A vector store class abstracting all interactions with Pinecone store
 */
class VectorStore {
    index: Index
    embeddings: OpenAIEmbeddings
    vectorStore: PineconeStore|null

    constructor(index: string) {
        this.embeddings = new OpenAIEmbeddings();
        // This should work but doesn't
        // this.index = new Pinecone().Index(index);
        this.index = new Pinecone().Index(process.env.PINECONE_INDEX!)
        this.vectorStore = null
    }

    async createVectorStore(docChunks: Document []): Promise<PineconeStore> {
        return PineconeStore.fromDocuments(docChunks, this.embeddings, {
            pineconeIndex: this.index,
            maxConcurrency: 5
          });
    }
}

export { VectorStore }