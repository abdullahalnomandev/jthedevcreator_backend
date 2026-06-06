import SearchKeyword from "./search.model"


const getKeywords = async (
    limit?: number
) => {
    return await SearchKeyword.getKeywords(limit)
}


export const KeywordService = {
    getKeywords
}