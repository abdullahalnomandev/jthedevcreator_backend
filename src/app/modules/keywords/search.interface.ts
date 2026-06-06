import { Model } from "mongoose";


export type SearchKeyword = {
    keyword: string,
    count: number,
}

export type KeywordModal = {
  getKeywords(limit?: number):any;
} & Model<SearchKeyword>;
