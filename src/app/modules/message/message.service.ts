import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
import { ChatRoom } from '../chat/chat.model';
import { Message } from './message.model';
import mongoose from 'mongoose';
import { socketHelper } from '../../../helpers/socketHelper';

const sendMessage = async (
  payload: JwtPayload,
  messageBody: {
    chatID: string;
    content: string;
    type: "MESSAGE" | "IMAGE"
  },
  image?: string
) => {
  const user = await User.isValidUser(payload.id);
  const chat = await ChatRoom.findById(messageBody.chatID)

  // let chats = await ChatRoom.findById(messageBody.chatID)
  //     .populate("participants", "email name image")
  //     .populate("lastMessage")
  //     .lean();
  
  //     //@ts-ignore
  //   chats = {
  //     ...chats,
  //     //@ts-ignore
  //     participants: chats.participants.filter(
  //       (p: any) => p._id.toString() !== user._id.toString()
  //     ),
  //   };

  //   console.log(chats);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "user not found");
  }

  if (!chat) {
    throw new ApiError(StatusCodes.NOT_FOUND, "chat not found");
  }

  const message = await Message.create({
    sender: user._id,
    chatRoom: chat._id,
    content: image ? image : messageBody.content,
    typeOf: messageBody.type,
  });

  chat.lastMessage = message._id;
  await chat.save();


  const populatedMessage = await message.populate("sender", "name email");

  // @ts-ignore
  const io = global.io;

  const socketMessage = {
    content: message.content,
    chatId: message.chatRoom,
    sender: message.sender,
    typeOf: message.typeOf,
    _id: message._id,
    //@ts-ignore
    createdAt: message.createdAt
  }

  // Emit the message to all users in the chat except the sender
  for (const userId of chat.participants) {
    if (userId.toString() !== user._id) {
      const targetSocketId = socketHelper.connectedUsers.get(userId.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit(`socket:message:${userId}`, socketMessage);
        io.to(targetSocketId).emit(`socket:chat:${userId}`, socketMessage);
      }
    }
  }

  return populatedMessage;
};

const getMessages = async (
  userID: any,
  chatId: any,
  options: {
    limit?: number;
    page?: number;
  }
) => {
  const { limit = 10, page = 1 }: { limit?: number; page?: number } = options;
  await User.isValidUser(userID);

  const chatObjectId = new mongoose.Types.ObjectId(chatId);
  const totalResults = await Message.countDocuments({ chatRoom: chatObjectId });

  if (!totalResults) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "No messages exist in this chat room"
    );
  }

  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { totalResults, totalPages, currentPage: page, limit };

  const skip = (page - 1) * limit;

  const messages = await Message.find({ chatRoom: chatObjectId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "_id name image email")
    .exec();

  const messageIdsToUpdate = messages
    .filter((msg: any) => msg.sender._id.toString() !== userID.toString() && !msg.isSeen)
    .map((msg) => msg._id);

  if (messageIdsToUpdate.length > 0) {
    await Message.updateMany(
      { _id: { $in: messageIdsToUpdate } },
      { $set: { isSeen: true } }
    );
  }

  return {
    messages,
    pagination,
  };
};

const deleteMessage = async (id: string) => {
  if (!id) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You must give the message Id!"
    )
  }
  const objID = new mongoose.Types.ObjectId(id)
  const result = await Message.findByIdAndDelete(objID);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
  }
  return result;
};

const deleteMessagesByChatId = async (chatId: string) => {
  if (!chatId) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      "You must give the chat id to delete all message of the chat!"
    )
  }
  const objID = new mongoose.Types.ObjectId(chatId)
  const result = await Message.deleteMany({ chatRoom: objID });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete messages');
  }
  return result;
};

export const MessageService = {
  sendMessage,
  getMessages,
  deleteMessage,
  deleteMessagesByChatId
};