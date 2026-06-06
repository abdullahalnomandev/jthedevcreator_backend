import { model, Schema } from "mongoose";
import { IPayment } from "./payment.interface";

const paymentSchem = new Schema<IPayment>({
    taskID:{
        type: Schema.Types.ObjectId,
        ref: "task"
    },
    transactionId:{
        type: String,
        required: true
    },
    commission:{
        type: Number,
        required: true
    }
},{timestamps: true});

export const Payment = model<IPayment>("payment", paymentSchem);