import { Types } from "mongoose";

export interface IPayment {
    transactionId: string;
    taskID: Types.ObjectId;
    commission: number;
}
