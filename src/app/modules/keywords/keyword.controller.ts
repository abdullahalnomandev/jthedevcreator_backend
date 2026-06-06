import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { KeywordService } from "./keyword.service";


const keywordsForSugation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const  limit = req.query.limit;

    const result = await KeywordService.getKeywords(Number(limit))

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get all top searched keywords!',
      data: result,
    });
  }
);



export const KeywordController = { 
  keywordsForSugation
};