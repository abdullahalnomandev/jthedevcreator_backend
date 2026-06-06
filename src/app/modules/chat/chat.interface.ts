import { Model, Types } from 'mongoose';

export type IChat = {
  participants: Types.ObjectId[];
  lastMessage: Types.ObjectId
};

export type ChatModel = {
  isArray(token: string): any;
} & Model<IChat>;