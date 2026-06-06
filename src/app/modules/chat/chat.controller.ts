import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChatService } from './chat.service';
import ApiError from '../../../errors/ApiError';

const createChat = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const { ...verifyData } = req.body;

  const result = await ChatService.createChat(user.id, verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Chat room get successfull",
    data: result,
  });
});

const getChatRoomWithId = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const { chatId } = req.body;

  const result = await ChatService.getChatById(chatId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Successfully get a chat room",
    data: result,
  });
});

const allChats = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const { ...bodyData } = req.body;

  const data = {
    id: user.id,
    ...bodyData
  }

  const result = await ChatService.allChats(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Chat room created successfull",
    data: result,
  });
});

const deleteChat = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const chatId = req.params.chatId as any;
  if (!chatId) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "You must give the chat is to delete the chat!"
    )
  }

  const result = await ChatService.deleteChat(user.id, chatId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Chat room deleted successfull",
    data: result,
  });
});

export const ChatController = { 
  createChat,
  getChatRoomWithId,
  allChats,
  deleteChat
 };
