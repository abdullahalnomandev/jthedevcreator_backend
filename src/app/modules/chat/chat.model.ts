import { model, Schema } from "mongoose";
import { ChatModel, IChat } from "./chat.interface";


const chatRoom = new Schema<IChat, ChatModel>({
    participants:{
        type: [Schema.Types.ObjectId],
        ref: "user"
    },
    lastMessage:{
        type: Schema.Types.ObjectId,
        ref: "message"
    }
},{
    timestamps: true
})

export const ChatRoom = model<IChat, ChatModel>("chat", chatRoom);