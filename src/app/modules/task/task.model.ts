import { model, Schema } from "mongoose";
import { taskI } from "./task.interface";


const taskSchema = new Schema<taskI>({
    customer:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    provider:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    service:{
        type: Schema.Types.ObjectId,
        ref: "post"
    },
    bid:{
        type: Schema.Types.ObjectId,
        ref: "bid"
    },
    transactionId:{
        type: String
    },
    isPayed:{
        type: Boolean
    }
},{
    timestamps: true
})

export const Task = model<taskI>("task", taskSchema);