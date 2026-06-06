import { Model, Schema } from 'mongoose';

export type IMessage = {
  sender: Schema.Types.ObjectId,
  content: string,
  chatRoom: string,
  typeOf: "MESSAGE" | "IMAGE";
  isSeen: boolean
};

export type MessageModel = {
  isArray(token: string): any;
} & Model<IMessage>;
