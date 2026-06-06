import { model, Schema } from "mongoose";
import { KeywordModal, SearchKeyword } from "./search.interface";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";


const searchSchema = new Schema<SearchKeyword, KeywordModal>({
  keyword: {
    type: String,
    required: true,
    index: true, 
  },
  count: {
    type: Number,
    default: 1
  }
});

searchSchema.statics.getKeywords = async function ( limit: number = 10 ) {
  try {

    return await this.find()
                    .sort({ count: -1 })
                    .limit(limit);
    
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error from the DB!"
    )
  }
}

const SearchKeyword = model<SearchKeyword, KeywordModal>('search_keyword', searchSchema);
export default SearchKeyword