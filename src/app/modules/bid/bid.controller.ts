import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BidService } from './bid.service';

const sendBid = catchAsync(async (
  req: Request, 
  res: Response
) => {
  
  const user = req.user
  const { ...verifyData } = req.body;
  const result = await BidService.sendBid(user,verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Bid send successfully!",
    data: result,
  });
});

const deleteBid = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user
  const id = req.params.id
  const result = await BidService.removeBid(user,id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Bid send successfully!",
    data: result,
  });
});

const bidRequestes = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user
  const { ...data } = req.body;
  const result = await BidService.bidRequests(user,data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Bid requestes",
    data: result,
  });
});

const bidRequestesAsAdvengrar = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user
  const { ...data } = req.body;
  const result = await BidService.bidRequesteAsAdvengerer(user,data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Bid requestes",
    data: result,
  });
});

const intrigateWithBid = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const { action, bid_id } = req.body;
  const result = await BidService.intrigateWithBid(user,bid_id,action) as any;

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message? result.message : "Bid intrigated!",
    data: result,
  });
});

const paytheBid = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const { bid_id } = req.body;
  const result = await BidService.paytheBid(user,bid_id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Payed to the adventurer!",
    data: result,
  });
});

const getBidData = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const { bid_id } = req.body;
  const result = await BidService.getPayDetails(user,bid_id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Bid Payment data!",
    data: result,
  });
});

const cancelTask = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const { bid_id } = req.body;
  const result = await BidService.cancelTask(user,bid_id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Task canceled!",
    data: result,
  });
});

const aggryWithTask = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const id = req.params.id;
  const result = await BidService.aggryWithTask(user,id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Successfully agree with the post details",
    data: result,
  });
});

export const BidController = {
  sendBid,
  bidRequestes,
  intrigateWithBid,
  bidRequestesAsAdvengrar,
  paytheBid,
  getBidData,
  aggryWithTask,
  cancelTask,
  deleteBid
};