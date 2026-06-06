import { model, Schema } from "mongoose";
import { notificationI } from "./notification.interface";

const notificationSchema = new Schema<notificationI>({
    from: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    for: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    discription: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
},{
    timestamps: true
});

export const NotificationModel = model<notificationI>("notification",notificationSchema)