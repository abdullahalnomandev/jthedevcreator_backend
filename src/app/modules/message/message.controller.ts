import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MessageService } from './message.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const send = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const { ...verifyData } = req.body;

  const image = getSingleFilePath(req.files, "image");
  if (image) {
    verifyData.type = "IMAGE"
    verifyData.content = image
  } else{
    verifyData.type = 'MESSAGE'
  }

  const result = await MessageService.sendMessage(user, verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Send message successfully!",
    data: result,
  });
});

const allMessagesOfARoom = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;

  const { ...verifyData } = req.body;

  const result = await MessageService.getMessages(user.id, verifyData.chatId, {limit: verifyData.limit, page: verifyData.page});

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "get messages successfully!",
    data: result,
  });
});

const deleteMessagesOfARoom = catchAsync(async (
  req: Request, 
  res: Response
) => {

  const chatId = req.params.chatID;

  const result = await MessageService.deleteMessagesByChatId(chatId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "delete messages successfully!",
    data: result,
  });
});

const deleteAMessages = catchAsync(async (
  req: Request, 
  res: Response
) => {

  const chatId = req.params.messageID;

  const result = await MessageService.deleteMessage(chatId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "delete message successfully!",
    data: result,
  });
});

export const MessageController = { 
  send,
  allMessagesOfARoom,
  deleteMessagesOfARoom,
  deleteAMessages
 };
