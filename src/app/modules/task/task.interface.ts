import { Types } from "mongoose";

export interface taskI {
    service: Types.ObjectId,
    provider: Types.ObjectId,
    customer: Types.ObjectId,
    isPayed: boolean,
    transactionId: string,
    bid: Types.ObjectId
}