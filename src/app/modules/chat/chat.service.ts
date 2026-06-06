import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { ChatRoom } from './chat.model';
import mongoose from 'mongoose';

const createChat = async (
  sender: any, 
  chatInfo: {
    receiver: any
  }, 
) => {

  const isUser = await User.isValidUser(sender);
  const isRecever = await User.isValidUser( chatInfo.receiver );
  
  if (!isRecever) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Receiver not found");
  };

  if (!isUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  };

  const isChatExist = await ChatRoom.findOne({
    // name: chatInfo.chatName,
    participants: { $all:[ isUser._id, chatInfo.receiver ] }
  }).populate("participants","email name image")

  if (!isChatExist) {
    const chatRoom = await ChatRoom.create({
      participants: [
        sender,
        chatInfo.receiver
      ]
    }
  );

    return await chatRoom.populate("participants","email name");
  }

  return isChatExist
  
};

const getChatById = async ( id: string ) => {
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ObjectId');
  }
  
  const chat = await ChatRoom.findById(id)
    .populate("participants", "email name image geoLocation");
  
  return chat;
};

const allChats = async (
  data: {
    id: string,
    page: number,
    limit: number
  }
) => {
  const { id, page = 1, limit = 10 } = data;

  const user = await User.isValidUser(id);

  const skip = (page - 1) * limit;

  let chats = await ChatRoom.find({
    participants: { $in: [id] }
  })
    .populate("participants", "email name image")
    .populate("lastMessage")
    .lean();

  chats = chats.map(chat => ({
    ...chat,
    participants: chat.participants.filter(
      (p: any) => p._id.toString() !== id.toString()
    ),
  }));

  return chats
};

const deleteChat = async ( userID: string, id: string ) => {
  const user = await User.isValidUser(userID);

  const chatRoom = await ChatRoom.findById(id);
  if (!chatRoom) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Chat not founded!`
    ); 
  };

  const isInChat = chatRoom.participants.filter( ( e: any ) => e === user._id );
  if (!isInChat) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You are not a member of this chat so you can delete this chat`
    );
  };

  await ChatRoom.deleteOne({ _id: chatRoom._id });

  return true

};

export const ChatService = {
  createChat,
  getChatById,
  allChats,
  deleteChat
};
