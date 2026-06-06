import { model, Schema, Types } from "mongoose";
import { IMessage, MessageModel } from "./message.interface";

const messageSchema = new Schema<IMessage>({
    chatRoom: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    typeOf: {
        type: String,
        enum: [ "MESSAGE" , "IMAGE"]
    },
    sender: {
        type: Types.ObjectId,
        ref: "user"
    },
    isSeen:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

export const Message = model<IMessage, MessageModel>("message", messageSchema);