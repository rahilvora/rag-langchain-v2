import { TavilySearchResults } from "@langchain/community/tools/tavily_search";


/**
 * Search tool
 */
export default class SearchTool {
  private searchTool: TavilySearchResults;

  /**
   * Creates an instance of SearchTool.
   */ 
  constructor() {
    this.searchTool = new TavilySearchResults();
  }

  /**
   * Get the search tool
   * @returns {TavilySearchResults}
   * @memberof SearchTool
   */
  public getSearchTool(): TavilySearchResults {
    return this.searchTool;
  }
}