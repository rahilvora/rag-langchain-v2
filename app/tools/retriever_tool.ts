import { VectorStore } from "../database/vector_store";
import { createRetrieverTool } from "langchain/tools/retriever";

/**
 * Retriever tool
 * @export
 * @class RetrieverTool
 */
export default class RetrieverTool {
  private vectorStore: VectorStore;

  /**
   * Creates an instance of RetrieverTool.
   */
  constructor() {
    this.vectorStore = new VectorStore('');
  }

  /**
   * Get the retriever tool
   * @returns {string}
   * @memberof RetrieverTool
   */
  public async getRetrieverTool(): Promise<any> {
    const vectorStore =  await this.vectorStore.getVectorStore()
    const retriever = await vectorStore.asRetriever();
    return createRetrieverTool(retriever, {
      name: "langsmith_search",
      description:
        "Search for information about LangSmith. For any questions about LangSmith, you must use this tool!",
    });
  }
}
